import { TaskConfig } from "./config";
import { Account } from "./index";
/**
 * @dev attributes of config are not mutable
 */
export type AutoChainHandler = (user: Account, config: TaskConfig) => Promise<string>;
export declare class TaskCliRunner {
    private hanlder?;
    setAutoChainHandler(handler: AutoChainHandler): void;
    run(): Promise<void>;
}
