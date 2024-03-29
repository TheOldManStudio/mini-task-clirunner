import { TaskResult } from "task";
export declare const readRecords: (file: string) => any;
export declare const findRecordById: (file: string, id: number) => any;
export declare const persistRecords: (file: string, header: any, records: TaskResult[]) => Promise<void>;
export declare const addNewRecord: (file: string, newRecord: TaskResult) => Promise<void>;
export declare const removeRecord: (file: string, predicate: (item: TaskResult) => boolean) => Promise<void>;
export declare const makeCsvHeader: (obj: any) => {
    id: string;
    title: string;
}[];
