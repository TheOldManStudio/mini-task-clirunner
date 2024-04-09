"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeployedContracts = exports.getChainInfo = exports.loadConfig = void 0;
const fast_glob_1 = __importDefault(require("fast-glob"));
const error_1 = require("./error");
const loadConfig = () => {
    const configFile = "./taskconfig.json";
    const cwd = process.cwd();
    const pat = `${cwd}/${configFile}`;
    const files = fast_glob_1.default.sync(pat);
    // console.log(pat, files, process.cwd());
    if ((files === null || files === void 0 ? void 0 : files.length) != 1) {
        throw new error_1.ConfigFileNotExistsError();
    }
    let configObj = require(files[0]);
    configObj = configObj || {};
    configObj.shuffleId = configObj.shuffleId || true;
    configObj.taskDefDir = configObj.taskDefDir || "./src/tasks";
    configObj.accountFile = configObj.accountFile || "./accounts.csv";
    configObj.reportDir = configObj.reportDir || ".";
    configObj.taskTimeout = 10 * 60000; // 10 mins
    configObj.chains = configObj.chains || {};
    configObj.deployed = configObj.deployed || {};
    configObj.chain = configObj.chain || "auto";
    cached = configObj;
    return cached;
};
exports.loadConfig = loadConfig;
const getChainInfo = (chain) => {
    if (!cached)
        (0, exports.loadConfig)();
    return cached.chains[chain];
};
exports.getChainInfo = getChainInfo;
const getDeployedContracts = (chain) => {
    if (!cached)
        (0, exports.loadConfig)();
    return cached.deployed[chain];
};
exports.getDeployedContracts = getDeployedContracts;
let cached;
