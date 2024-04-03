import { Account, Chain } from "index";

export type TaskResult = { [key: string]: any };

export type Arg = { [name: string]: string | number };

export type Context = {
  chain: string | number;
  chainObj: Chain;

  deployedContracts: { [name: string]: string };

  readTaskRecordById: (taskId: string | number) => Promise<TaskResult>;

  users: Account[];

  id: number; // task id
  name: string;
};

export type TaskAction = (user: Account, ctx: Context, args: Arg) => Promise<TaskResult>;

export class Task {
  public id: number;
  public name: string | undefined;
  public delayspec?: string | number;
  public argspec?: string;

  public func: TaskAction;

  public static tasklist: Task[] = [];

  private constructor(id: number, name?: string) {
    this.id = id;
    this.name = name;
  }

  static createTask(id: number, name?: string) {
    return new Task(id, name);
  }

  cooldown(delay: string | number) {
    this.delayspec = delay;
    return this;
  }

  /**
   *
   * @param {string} spec
   * @dev <name> - required
   * @dev [name] - optional
   * @returns
   */
  args(spec: string) {
    this.argspec = spec;
    return this;
  }

  action(func: TaskAction) {
    if (!func) {
      throw new Error("task needs an aysnc func");
    }

    this.func = func;

    Task.tasklist.push({ ...this });

    return this;
  }
}

export default Task.createTask;
