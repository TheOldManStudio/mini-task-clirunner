import glob from "fast-glob";

import { ConfigFileNotExistsError } from "./error";
import { Chain } from "./index";

export type TaskConfig = {
  shuffleId: boolean;
  chain: string | number | "auto";
  taskDefDir: string;
  accountFile: string;
  reportDir: string;
  taskTimeout: number;
  force: boolean;

  chains: { [chain: number | string]: Chain };
  deployed: { [chain: number | string]: { [name: string]: string } };
};

export const loadConfig = (): TaskConfig => {
  const configFile = "./taskconfig.json";

  const cwd = process.cwd();
  const pat = `${cwd}/${configFile}`;

  const files = glob.sync(pat);
  // console.log(pat, files, process.cwd());

  if (files?.length != 1) {
    throw new ConfigFileNotExistsError();
  }

  let configObj = require(files[0]);
  configObj = configObj || {};

  configObj.shuffleId = configObj.shuffleId || true;
  configObj.force = false;

  configObj.taskDefDir = configObj.taskDefDir || "./src/tasks";
  configObj.accountFile = configObj.accountFile || "./accounts.csv";

  configObj.reportDir = configObj.reportDir || ".";

  configObj.taskTimeout = configObj.taskTimeout || 10 * 60000; // 10 mins

  configObj.chains = configObj.chains || {};
  configObj.deployed = configObj.deployed || {};

  if (!configObj.chain) {
    // defaul to the first of defined chains.
    const keys = Object.keys(configObj.chains);
    if (keys.length >= 0) configObj.chain = keys[0];
  }

  cached = configObj as TaskConfig;

  return cached;
};

export const getChainInfo = (chain: string | number) => {
  if (!cached) loadConfig();
  return cached.chains[chain];
};

export const getDeployedContracts = (chain: string | number) => {
  if (!cached) loadConfig();
  return cached.deployed[chain];
};

let cached: TaskConfig;
