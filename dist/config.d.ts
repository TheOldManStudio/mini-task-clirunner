import { Chain } from "./index";
export type Config = {
    shuffleId: boolean;
    chain: string | number | "auto";
    taskDefDir: string;
    accountFile: string;
    reportDir: string;
    taskTimeout: number;
    force: boolean;
    chains: {
        [chain: number | string]: Chain;
    };
    deployed: {
        [chain: number | string]: {
            [name: string]: string;
        };
    };
};
export declare const loadConfig: () => Config;
export declare const getChainInfo: (chain: string | number) => Chain;
export declare const getDeployedContracts: (chain: string | number) => {
    [name: string]: string;
};
