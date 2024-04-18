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
export { TaskContext, TaskArgs, Task, TaskAction, TaskResult } from "./task";
export { TaskCliRunner, AutoChainHandler } from "./cli_runner";
export { getChainInfo, getDeployedContracts, Config } from "./config";
export { addNewRecord, readRecords, removeRecord, persistRecords } from "./csv";
export { parseIds } from "./id_parser";
export { randomInRange } from "./random";
export { delay } from "./delay";
import task from "./task";
export default task;
