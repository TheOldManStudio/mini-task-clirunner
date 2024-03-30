import _ from "lodash";
import yargs from "yargs/yargs";
import { green, red, yellow } from "@colors/colors/safe";

import { parseIds } from "./id_parser";
import { addNewRecord, readRecords, findRecordById } from "./csv";
import { NoTaskDefinedError, TaskFileNotFoundError } from "./error";

import { delay } from "./delay";
import { randomInRange } from "./random";

import { Task } from "./task";
import { TaskConfig, getChainInfo, getDeployedContracts, loadConfig } from "./config";
import { asyncGlob } from "./async_glob";
import { Account, Chain } from "./index";

//
/**
 * @dev attributes of config are mutable
 */
export type PrerunPlugin = (user: Account, config: TaskConfig) => Promise<void>;

const buildRecordFilePath = (reportDir: string, taskId: number) => `${reportDir}/task_${taskId}.csv`;

const readTaskRecord = async (reportDir: string, userId: number, taskId: number) => {
  const reportFile = buildRecordFilePath(reportDir, taskId);
  return findRecordById(reportFile, userId);
};

export class TaskCliRunner {
  private hanlder: PrerunPlugin;

  public setPrerunPlugin(handler: PrerunPlugin) {
    this.hanlder = handler;
  }

  public async run() {
    const config = await loadConfig();

    // console.log(config);

    let { chain, shuffleId, accountFile, taskDefDir, reportDir } = config;

    const argv = yargs(process.argv.slice(2)).parse();

    // console.log(argv);

    if (argv["chain"]) chain = argv["chain"];
    if (!chain) throw new Error("no chainId");

    if (argv.hasOwnProperty("shuffle")) {
      shuffleId = argv["shuffle"];
    }

    const taskFileName = argv["_"][0];
    if (!taskFileName) throw new TaskFileNotFoundError();

    const cwd = process.cwd();
    const pat = `${cwd}/${taskDefDir}/${taskFileName}*.js`;

    const files = await asyncGlob(pat);
    // console.log(pat, files, process.cwd());

    if (files?.length != 1) {
      throw new TaskFileNotFoundError(taskFileName);
    }

    const path = files[0];

    Task.tasklist = [];
    require(path);

    const tasks = Task.tasklist;
    if (tasks.length <= 0) throw new NoTaskDefinedError();

    console.log(`Task: ${path}`);

    let ids = parseIds(argv["_"][1]);
    if (ids.length == 0) {
      console.log("yarn task <task-name> <account-id-list> [task-specific-args...]");
      console.log("options: --no-shuffle --chainId <chain>");
      return;
    }

    // randomize ids
    if (shuffleId) ids = _.shuffle(ids);

    // remaining args to task
    let taskArgs = [];
    if (argv["_"].length > 2) taskArgs = argv["_"].slice(2);

    // read all accounts
    const users = readRecords(accountFile);

    let chainObj: Chain;

    if (chain != "auto") {
      chainObj = getChainInfo(chain);
      if (!chainObj) throw new Error(`unknown chain ${chain}`);
    }

    console.log(`Chain: ${green(chainObj ? chainObj.chain : (chain as string))}`);

    for (let i = 0; i < ids.length; i++) {
      const user = _.find(users, { id: ids[i] });

      if (!user) {
        console.log(`no account found by id: ${ids[i]}`);
        continue;
      }

      console.log();
      console.log(green(`[${i + 1}/${ids.length}]`), yellow(`#${user.id}, ${user.address}`));

      // run middleware
      if (this.hanlder) {
        try {
          await this.hanlder(user, config);
        } catch (error: any) {
          console.log(red(error));
          continue;
        }

        chain = config.chain;
      }

      // prepare context

      chainObj = getChainInfo(chain);
      const deployedContracts = getDeployedContracts(chain);
      const context = {
        chain,
        chainObj,
        deployedContracts,
        users,
        readTaskRecord: readTaskRecord.bind(this, reportDir, user.id),
      };

      for (let j = 0; j < tasks.length; j++) {
        const task = tasks[j];
        try {
          const { id, name, delayspec, argspec, func } = task;

          if (tasks.length > 1) {
            console.log(`-->subtask #${id}: ${name || ""}`);
          }

          const reportFile = buildRecordFilePath(reportDir, id);
          if (findRecordById(reportFile, user.id)) {
            console.log(`already done`);
            continue;
          }

          // parse taskArgs
          let parsedArgs = {};
          if (argspec) {
            parsedArgs = yargs([...taskArgs])
              .command(`* ${argspec}`, false)
              .parse();
          }

          let result = await func(user, context, parsedArgs);

          // persist result
          if (result) {
            if (typeof result != "object") throw new Error("task must return an object");
            await addNewRecord(reportFile, { id: user.id, address: user.address, ...result });
          }

          // handling delay
          if (delayspec && (j < tasks.length - 1 || i < ids.length - 1)) {
            let sec = parseFloat(delayspec as string);
            if (!isNaN(sec)) {
              if (sec > 0) await delay(sec * 1000);
            } else if (typeof delayspec == "string" && delayspec.startsWith("~")) {
              const avg = parseFloat(delayspec.substring(1));
              if (!isNaN(avg) && avg > 0) {
                const min = Math.floor(avg / 2);
                const max = Math.floor(avg * 2) - min;
                await delay(randomInRange(min, max) * 1000);
              }
            }
          }
        } catch (error) {
          console.warn(error);
          break;
        }
      }
    }
  }
}
