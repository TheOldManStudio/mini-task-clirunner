import fs from "fs";

import _ from "lodash";
import { parse } from "csv-parse/sync";
import { createObjectCsvWriter } from "csv-writer";
import { TaskResult } from "task";

export const readRecords = (file: string) => {
  if (!fs.existsSync(file)) return [];

  return parse(fs.readFileSync(file), {
    columns: true,
    bom: true,
    skip_empty_lines: true,
  });
};

export const findRecordById = (file: string, id: number) => {
  const records = readRecords(file);

  const record = _.find(records, { id });

  return record;
};

export const persistRecords = async (file: string, header: any, records: TaskResult[]) => {
  // persist records
  const sorted = _.sortBy(records, (u) => parseInt(u.id));

  // writer
  const csvWriter = createObjectCsvWriter({
    path: file,
    header,
    append: false,
  });
  await csvWriter.writeRecords(sorted);
};

export const addNewRecord = async (file: string, newRecord: TaskResult) => {
  const all = readRecords(file);

  all.push(newRecord);

  const csvHeader = makeCsvHeader(newRecord);
  await persistRecords(file, csvHeader, all);
};

export const removeRecord = async (file: string, predicate: (item: TaskResult) => boolean) => {
  const all = readRecords(file);

  if (!all) return;

  const length = all.length;
  if (length <= 0) return;

  const removed = _.remove(all, predicate);
  if (removed.length < 1 || all.length == length) return;

  const csvHeader = makeCsvHeader(removed[0]);

  await persistRecords(file, csvHeader, all);
};

export const makeCsvHeader = (obj: any) => {
  const keys = Object.keys(obj);
  return keys.map((key) => ({ id: key, title: key }));
};
