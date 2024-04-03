import { TaskConfig } from "./config";
import { Account } from "./index";
/**
 * @dev attributes of config are mutable
 */
export type PrerunPlugin = (user: Account, config: TaskConfig) => Promise<void>;
export declare class TaskCliRunner {
    private hanlder?;
    setPrerunPlugin(handler: PrerunPlugin): void;
    run(): Promise<void>;
}
