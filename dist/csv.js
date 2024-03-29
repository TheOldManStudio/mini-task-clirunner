"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCsvHeader = exports.removeRecord = exports.addNewRecord = exports.persistRecords = exports.findRecordById = exports.readRecords = void 0;
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const sync_1 = require("csv-parse/sync");
const csv_writer_1 = require("csv-writer");
const readRecords = (file) => {
    if (!fs_1.default.existsSync(file))
        return [];
    return (0, sync_1.parse)(fs_1.default.readFileSync(file), {
        columns: true,
        bom: true,
        skip_empty_lines: true,
    });
};
exports.readRecords = readRecords;
const findRecordById = (file, id) => {
    const records = (0, exports.readRecords)(file);
    const record = lodash_1.default.find(records, { id });
    return record;
};
exports.findRecordById = findRecordById;
const persistRecords = (file, header, records) => __awaiter(void 0, void 0, void 0, function* () {
    // persist records
    const sorted = lodash_1.default.sortBy(records, (u) => parseInt(u.id));
    // writer
    const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
        path: file,
        header,
        append: false,
    });
    yield csvWriter.writeRecords(sorted);
});
exports.persistRecords = persistRecords;
const addNewRecord = (file, newRecord) => __awaiter(void 0, void 0, void 0, function* () {
    const all = (0, exports.readRecords)(file);
    all.push(newRecord);
    const csvHeader = (0, exports.makeCsvHeader)(newRecord);
    yield (0, exports.persistRecords)(file, csvHeader, all);
});
exports.addNewRecord = addNewRecord;
const removeRecord = (file, predicate) => __awaiter(void 0, void 0, void 0, function* () {
    const all = (0, exports.readRecords)(file);
    if (!all)
        return;
    const length = all.length;
    if (length <= 0)
        return;
    const removed = lodash_1.default.remove(all, predicate);
    if (removed.length < 1 || all.length == length)
        return;
    const csvHeader = (0, exports.makeCsvHeader)(removed[0]);
    yield (0, exports.persistRecords)(file, csvHeader, all);
});
exports.removeRecord = removeRecord;
const makeCsvHeader = (obj) => {
    const keys = Object.keys(obj);
    return keys.map((key) => ({ id: key, title: key }));
};
exports.makeCsvHeader = makeCsvHeader;
