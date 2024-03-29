"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
class Task {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    static createTask(id, name) {
        return new Task(id, name);
    }
    cooldown(delay) {
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
    args(spec) {
        this.argspec = spec;
        return this;
    }
    action(func) {
        if (!func) {
            throw new Error("task needs an aysnc func");
        }
        this.func = func;
        Task.tasklist.push(Object.assign({}, this));
        return this;
    }
}
exports.Task = Task;
Task.tasklist = [];
exports.default = Task.createTask;
