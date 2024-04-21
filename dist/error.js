"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnNonObjectError = exports.AccountNotFoundError = exports.ChainUndefinedError = exports.ConfigError = exports.ConfigFileNotExistsError = exports.InvalidTaskArgsError = exports.NoTaskDefinedError = exports.TaskFileNotFoundError = void 0;
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
class ConfigError extends Error {
}
exports.ConfigError = ConfigError;
class ChainUndefinedError extends Error {
}
exports.ChainUndefinedError = ChainUndefinedError;
class AccountNotFoundError extends Error {
}
exports.AccountNotFoundError = AccountNotFoundError;
class ReturnNonObjectError extends Error {
}
exports.ReturnNonObjectError = ReturnNonObjectError;
