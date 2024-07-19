import { Config } from "./config";
import { Account } from "./index";
/**
 * @dev return chain identifier. attributes of config are immutable
 */
export type AutoChainHandler = (user: Account, config: Config) => Promise<string>;
export declare class TaskCliRunner {
    private _hanlder?;
    private _config;
    private _run;
    private _failed;
    private _timeoutId;
    constructor();
    setAutoChainHandler(handler: AutoChainHandler): void;
    private _buildRecordFilePath;
    private _readTaskRecord;
    private _graceful;
    private _result;
    private _usage;
    private _idlistUsage;
    private _loadTask;
    run(): Promise<void>;
}
