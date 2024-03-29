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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeployedContracts = exports.getChainInfo = exports.loadConfig = void 0;
const async_glob_1 = require("./async_glob");
const error_1 = require("./error");
const loadConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    const configFile = "./taskconfig.json";
    const cwd = process.cwd();
    const pat = `${cwd}/${configFile}`;
    const files = yield (0, async_glob_1.asyncGlob)(pat);
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
    configObj.chains = configObj.chains || {};
    configObj.deployed = configObj.deployed || {};
    configObj.chain = configObj.chain || "auto";
    cached = configObj;
    return cached;
});
exports.loadConfig = loadConfig;
const getChainInfo = (chain) => {
    if (!cached)
        throw Error("");
    return cached.chains[chain];
};
exports.getChainInfo = getChainInfo;
const getDeployedContracts = (chain) => {
    if (!cached)
        throw Error("");
    return cached.deployed[chain];
};
exports.getDeployedContracts = getDeployedContracts;
let cached;
