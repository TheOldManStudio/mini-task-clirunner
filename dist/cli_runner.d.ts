import { Config } from "./config";
import { Account } from "./index";
/**
 * @dev attributes of config are immutable
 */
export type AutoChainHandler = (user: Account, config: Config) => Promise<string>;
export declare class TaskCliRunner {
    private _hanlder?;
    private _config;
    constructor();
    setAutoChainHandler(handler: AutoChainHandler): void;
    private _buildRecordFilePath;
    private _readTaskRecord;
    private _usage;
    private _idlistUsage;
    private _loadTask;
    run(): Promise<void>;
}
