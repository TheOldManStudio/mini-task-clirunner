import { Account, Chain } from "index";
export type TaskResult = {
    [key: string]: any;
};
export type Arg = {
    [name: string]: string | number;
};
export type Context = {
    chain: string | number;
    chainObj: Chain;
    deployedContracts: {
        [name: string]: string;
    };
    readTaskRecord: (taskId: string | number) => Promise<TaskResult>;
    users: Account[];
};
export type TaskAction = (user: Account, ctx: Context, args: Arg) => Promise<TaskResult>;
export declare class Task {
    id: number;
    name: string | undefined;
    delayspec: string | number;
    argspec: string;
    func: TaskAction;
    static tasklist: Task[];
    private constructor();
    static createTask(id: number, name?: string): Task;
    cooldown(delay: string | number): this;
    /**
     *
     * @param {string} spec
     * @dev <name> - required
     * @dev [name] - optional
     * @returns
     */
    args(spec: string): this;
    action(func: TaskAction): this;
}
declare const _default: typeof Task.createTask;
export default _default;
