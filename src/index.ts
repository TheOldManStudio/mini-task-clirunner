export type Account = {
  id: number;
  address: string;
  privkey: string;
  phrase?: string;
  fund?: number;
  type?: string;
};

export type Chain = {
  chainId: string | number;
  coin: string;
  chain: string;
  network: string;
  rpc: string;
};

export { Context, Arg, Task, TaskAction, TaskResult } from "./task";
export { TaskCliRunner, AutoChainHandler } from "./cli_runner";
export { getChainInfo, getDeployedContracts, TaskConfig } from "./config";
export { addNewRecord, readRecords, removeRecord, persistRecords } from "./csv";
export { parseIds } from "./id_parser";
export { PluginError } from "./error";
export { randomInRange } from "./random";

import task from "./task";
export default task;
