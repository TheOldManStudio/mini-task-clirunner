import _ from "lodash";
import yargs from "yargs/yargs";
import { green, red, yellow } from "@colors/colors/safe";
import glob from "fast-glob";

import { parseIds } from "./id_parser";
import { addNewRecord, readRecords, findRecordById } from "./csv";
import { NoTaskDefinedError, TaskFileNotFoundError } from "./error";

import { delay } from "./delay";
import { randomInRange } from "./random";

import { Task } from "./task";
import { TaskConfig, getChainInfo, getDeployedContracts, loadConfig } from "./config";

import { Account, Chain, Context } from "./index";

//
/**
 * @dev attributes of config are not mutable
 */
export type AutoChainHandler = (user: Account, config: TaskConfig) => Promise<string>;

const buildRecordFilePath = (reportDir: string, taskId: number) => `${reportDir}/task_${taskId}.csv`;

const readTaskRecord = async (reportDir: string, userId: number, taskId: number) => {
  const reportFile = buildRecordFilePath(reportDir, taskId);
  return findRecordById(reportFile, userId);
};

const usage = () => {
  console.log("Usage:");
  console.log("yarn task <task-name> <account-id-list> [task-specific-args...]");
  console.log("options:");
  console.log("    --no-shuffle     no ID shuffle");
  console.log("    --chain <chain>  chain identifier defined in taskconfig.json");
  console.log("    --force          force run task even if there was already an instance");
};

const idlistUsage = () => {
  console.log("ID list usage");
  console.log("    Comma seperated: 1,3,5,100");
  console.log("    Range:           1-100");
  console.log("    Composite:       2,5,7,10-100");
  console.log("Note: no space character allowed");
};

export class TaskCliRunner {
  private hanlder?: AutoChainHandler;

  public setAutoChainHandler(handler: AutoChainHandler) {
    this.hanlder = handler;
  }

  public async run() {
    const config = loadConfig();

    const argv = await yargs(process.argv.slice(2)).option("force", { type: "boolean" }).parse();

    if (argv.hasOwnProperty("chain")) {
      config.chain = argv.chain as string;
    }

    if (argv.hasOwnProperty("shuffle")) {
      config.shuffleId = argv.shuffle as boolean;
    }

    if (argv.hasOwnProperty("force")) {
      config.force = true;
    }

    let { chain, shuffleId, force, accountFile, taskDefDir, reportDir, taskTimeout } = config;

    if (!chain) throw new Error("no chain specified.");

    if (argv._.length < 2) {
      usage();
      return;
    }

    const taskFileName = argv._[0];
    if (!taskFileName) throw new TaskFileNotFoundError();

    const cwd = process.cwd();
    const pat = `${cwd}/${taskDefDir}/${taskFileName}*.js`;

    const files = await glob.async(pat);
    // console.log(pat, files, process.cwd());

    if (files?.length != 1) {
      throw new TaskFileNotFoundError(taskFileName as string);
    }

    const path = files[0];

    Task.tasklist = [];
    require(path);

    const tasks = Task.tasklist;
    if (tasks.length <= 0) throw new NoTaskDefinedError();

    console.log(`Task: ${path}`);

    // id list
    let ids = [];
    try {
      ids = parseIds(argv._[1].toString());
    } catch (e) {}
    if (ids.length == 0) {
      idlistUsage();
      return;
    }

    // randomize ids
    if (shuffleId) ids = _.shuffle(ids);

    // remaining args to task
    let taskArgs: (string | number)[] = [];
    if (argv._.length > 2) taskArgs = argv._.slice(2);

    // chain info
    if (chain == "auto") {
      if (!this.hanlder) throw Error("must implement AutoChainHandler to use auto");
      console.log(`Chain: ${green(chain)}`);
    } else {
      const chainObj = getChainInfo(chain);
      if (!chainObj) throw new Error(`undefined chain ${chain}`);
      console.log(`Chain: ${green(chainObj.chain)}`);
    }

    // read all accounts
    const users = readRecords(accountFile);

    for (let i = 0; i < ids.length; i++) {
      const user = _.find(users, { id: ids[i] });

      if (!user) {
        console.log(`no account found by id: ${ids[i]}`);
        continue;
      }

      console.log();
      console.log(green(`[${i + 1}/${ids.length}]`), yellow(`#${user.id}, ${user.address}`));

      // run middleware
      let effectiveChain = chain;
      if (this.hanlder) {
        try {
          const cloneConfig = { ...config };
          const cloneUser = { ...user };
          effectiveChain = await this.hanlder(cloneUser, cloneConfig);
          if (!getChainInfo(effectiveChain)) throw new Error(`undefined chain ${effectiveChain}`);
        } catch (error: any) {
          console.log(red(error));
          continue;
        }
      }

      // context

      const chainObj = getChainInfo(effectiveChain);
      const deployedContracts = getDeployedContracts(effectiveChain);

      const context: Partial<Context> = {
        chain: effectiveChain,
        chainObj,
        deployedContracts,
        users,
        readTaskRecordById: readTaskRecord.bind(this, reportDir, user.id),
      };

      for (let j = 0; j < tasks.length; j++) {
        const task = tasks[j];
        try {
          const { id, name, delayspec, argspec, func, chainId: taskDefinedChain } = task;

          if (tasks.length > 1) {
            console.log(yellow(`-->subtask #${id}: ${name || ""}`));
          }

          const reportFile = buildRecordFilePath(reportDir, id);
          if (!force && findRecordById(reportFile, user.id)) {
            console.log("already", green("done"));
            continue;
          }

          // context

          context.chain = effectiveChain;
          context.chainObj = chainObj;
          context.deployedContracts = deployedContracts;

          if (taskDefinedChain) {
            const taskChainObj = getChainInfo(taskDefinedChain);
            const taskDeployedContracts = getDeployedContracts(taskDefinedChain);

            if (!taskChainObj) {
              console.log(red(`task defined chain not defined: ${taskDefinedChain}`));
              break;
            }

            context.chain = taskDefinedChain;
            context.chainObj = taskChainObj;
            context.deployedContracts = taskDeployedContracts;
          }

          context.id = id;
          context.name = name;

          // parse taskArgs
          let parsedArgs = {};
          if (argspec) {
            parsedArgs = yargs(taskArgs.map((a) => a.toString()))
              .command(`* ${argspec}`, false)
              .parse();
          }

          let timeoutId: string | number | NodeJS.Timeout;
          const timeoutErr = "timeout";
          const timeout = (millis: number) =>
            new Promise((resolve, reject) => {
              timeoutId = setTimeout(reject, millis, timeoutErr);
            });

          try {
            let result = await Promise.race([timeout(taskTimeout), func(user, context as Context, parsedArgs)]);

            // persist result
            if (result) {
              if (typeof result != "object") throw new Error("result should be a key-value object {}");
              await addNewRecord(reportFile, { id: user.id, address: user.address, ...result });
            }

            console.log(green("done"));
          } catch (e: any) {
            if (e == timeoutErr) {
              console.log(red(e));
            } else {
              throw e;
            }
          } finally {
            if (timeoutId) clearTimeout(timeoutId);
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
