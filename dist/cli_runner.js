"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCliRunner = void 0;
const lodash_1 = __importDefault(require("lodash"));
const yargs_1 = __importDefault(require("yargs/yargs"));
const safe_1 = require("@colors/colors/safe");
const fast_glob_1 = __importDefault(require("fast-glob"));
const id_parser_1 = require("./id_parser");
const csv_1 = require("./csv");
const error_1 = require("./error");
const delay_1 = require("./delay");
const random_1 = require("./random");
const task_1 = require("./task");
const config_1 = require("./config");
const buildRecordFilePath = (reportDir, taskId) => `${reportDir}/task_${taskId}.csv`;
const readTaskRecord = (reportDir, userId, taskId) => __awaiter(void 0, void 0, void 0, function* () {
    const reportFile = buildRecordFilePath(reportDir, taskId);
    return (0, csv_1.findRecordById)(reportFile, userId);
});
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
class TaskCliRunner {
    setAutoChainHandler(handler) {
        this.hanlder = handler;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = (0, config_1.loadConfig)();
            const argv = yield (0, yargs_1.default)(process.argv.slice(2)).option("force", { type: "boolean" }).parse();
            if (argv.hasOwnProperty("chain")) {
                config.chain = argv.chain;
            }
            if (argv.hasOwnProperty("shuffle")) {
                config.shuffleId = argv.shuffle;
            }
            if (argv.hasOwnProperty("force")) {
                config.force = true;
            }
            let { chain, shuffleId, force, accountFile, taskDefDir, reportDir, taskTimeout } = config;
            if (!chain)
                throw new Error("no chain specified.");
            if (argv._.length < 2) {
                usage();
                return;
            }
            const taskFileName = argv._[0];
            if (!taskFileName)
                throw new error_1.TaskFileNotFoundError();
            const cwd = process.cwd();
            const pat = `${cwd}/${taskDefDir}/${taskFileName}*.js`;
            const files = yield fast_glob_1.default.async(pat);
            // console.log(pat, files, process.cwd());
            if ((files === null || files === void 0 ? void 0 : files.length) != 1) {
                throw new error_1.TaskFileNotFoundError(taskFileName);
            }
            const path = files[0];
            task_1.Task.tasklist = [];
            require(path);
            const tasks = task_1.Task.tasklist;
            if (tasks.length <= 0)
                throw new error_1.NoTaskDefinedError();
            console.log(`Task: ${path}`);
            // id list
            let ids = [];
            try {
                ids = (0, id_parser_1.parseIds)(argv._[1].toString());
            }
            catch (e) { }
            if (ids.length == 0) {
                idlistUsage();
                return;
            }
            // randomize ids
            if (shuffleId)
                ids = lodash_1.default.shuffle(ids);
            // remaining args to task
            let taskArgs = [];
            if (argv._.length > 2)
                taskArgs = argv._.slice(2);
            // chain info
            if (chain == "auto") {
                if (!this.hanlder)
                    throw Error("must implement AutoChainHandler to use auto");
                console.log(`Chain: ${(0, safe_1.green)(chain)}`);
            }
            else {
                const chainObj = (0, config_1.getChainInfo)(chain);
                if (!chainObj)
                    throw new Error(`undefined chain ${chain}`);
                console.log(`Chain: ${(0, safe_1.green)(chainObj.chain)}`);
            }
            // read all accounts
            const users = (0, csv_1.readRecords)(accountFile);
            for (let i = 0; i < ids.length; i++) {
                const user = lodash_1.default.find(users, { id: ids[i] });
                if (!user) {
                    console.log(`no account found by id: ${ids[i]}`);
                    continue;
                }
                console.log();
                console.log((0, safe_1.green)(`[${i + 1}/${ids.length}]`), (0, safe_1.yellow)(`#${user.id}, ${user.address}`));
                // run middleware
                let effectiveChain = chain;
                if (this.hanlder) {
                    try {
                        const cloneConfig = Object.assign({}, config);
                        const cloneUser = Object.assign({}, user);
                        effectiveChain = yield this.hanlder(cloneUser, cloneConfig);
                        if (!(0, config_1.getChainInfo)(effectiveChain))
                            throw new Error(`undefined chain ${effectiveChain}`);
                    }
                    catch (error) {
                        console.log((0, safe_1.red)(error));
                        continue;
                    }
                }
                // context
                const chainObj = (0, config_1.getChainInfo)(effectiveChain);
                const deployedContracts = (0, config_1.getDeployedContracts)(effectiveChain);
                const context = {
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
                            console.log((0, safe_1.yellow)(`-->subtask #${id}: ${name || ""}`));
                        }
                        const reportFile = buildRecordFilePath(reportDir, id);
                        if (!force && (0, csv_1.findRecordById)(reportFile, user.id)) {
                            console.log("already", (0, safe_1.green)("done"));
                            continue;
                        }
                        // context
                        context.chain = effectiveChain;
                        context.chainObj = chainObj;
                        context.deployedContracts = deployedContracts;
                        if (taskDefinedChain) {
                            const taskChainObj = (0, config_1.getChainInfo)(taskDefinedChain);
                            const taskDeployedContracts = (0, config_1.getDeployedContracts)(taskDefinedChain);
                            if (!taskChainObj) {
                                console.log((0, safe_1.red)(`task defined chain not defined: ${taskDefinedChain}`));
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
                            parsedArgs = (0, yargs_1.default)(taskArgs.map((a) => a.toString()))
                                .command(`* ${argspec}`, false)
                                .parse();
                        }
                        let timeoutId;
                        const timeoutErr = "timeout";
                        const timeout = (millis) => new Promise((resolve, reject) => {
                            timeoutId = setTimeout(reject, millis, timeoutErr);
                        });
                        try {
                            let result = yield Promise.race([timeout(taskTimeout), func(user, context, parsedArgs)]);
                            // persist result
                            if (result) {
                                if (typeof result != "object")
                                    throw new Error("result should be a key-value object {}");
                                yield (0, csv_1.addNewRecord)(reportFile, Object.assign({ id: user.id, address: user.address }, result));
                            }
                            console.log((0, safe_1.green)("done"));
                        }
                        catch (e) {
                            if (e == timeoutErr) {
                                console.log((0, safe_1.red)(e));
                            }
                            else {
                                throw e;
                            }
                        }
                        finally {
                            if (timeoutId)
                                clearTimeout(timeoutId);
                        }
                        // handling delay
                        if (delayspec && (j < tasks.length - 1 || i < ids.length - 1)) {
                            let sec = parseFloat(delayspec);
                            if (!isNaN(sec)) {
                                if (sec > 0)
                                    yield (0, delay_1.delay)(sec * 1000);
                            }
                            else if (typeof delayspec == "string" && delayspec.startsWith("~")) {
                                const avg = parseFloat(delayspec.substring(1));
                                if (!isNaN(avg) && avg > 0) {
                                    const min = Math.floor(avg / 2);
                                    const max = Math.floor(avg * 2) - min;
                                    yield (0, delay_1.delay)((0, random_1.randomInRange)(min, max) * 1000);
                                }
                            }
                        }
                    }
                    catch (error) {
                        console.warn(error);
                        break;
                    }
                }
            }
        });
    }
}
exports.TaskCliRunner = TaskCliRunner;
