"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFileNotExistsError = exports.InvalidTaskArgsError = exports.NoTaskDefinedError = exports.TaskFileNotFoundError = void 0;
class TaskFileNotFoundError extends Error {
}
exports.TaskFileNotFoundError = TaskFileNotFoundError;
class NoTaskDefinedError extends Error {
}
exports.NoTaskDefinedError = NoTaskDefinedError;
class InvalidTaskArgsError extends Error {
}
exports.InvalidTaskArgsError = InvalidTaskArgsError;
class ConfigFileNotExistsError extends Error {
}
exports.ConfigFileNotExistsError = ConfigFileNotExistsError;
