declare type callbackFn = (v: any) => void;
export interface EnvVars {
    [org: string]: {
        mspid: string;
        peers: string[];
        ids: {
            [id: string]: string;
        };
    };
}
export declare class MicrofabProcessor {
    processFile(configFile: string, gatewaypath: string, walletpath: string, cryptopath: string): Promise<void>;
    process({ config, gatewaypath, walletpath, cryptopath, }: {
        config: any;
        gatewaypath: string;
        walletpath: string;
        cryptopath: string;
    }): Promise<EnvVars>;
    asyncForEach(array: any, callback: callbackFn): Promise<void>;
}
export {};
