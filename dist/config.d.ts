import { Chain } from "./index";
export type TaskConfig = {
    shuffleId: boolean;
    chain: string | number | "auto";
    taskDefDir: string;
    accountFile: string;
    reportDir: string;
    taskTimeout: number;
    chains: {
        [chain: number | string]: Chain;
    };
    deployed: {
        [chain: number | string]: {
            [name: string]: string;
        };
    };
};
export declare const loadConfig: () => TaskConfig;
export declare const getChainInfo: (chain: string | number) => Chain;
export declare const getDeployedContracts: (chain: string | number) => {
    [name: string]: string;
};
