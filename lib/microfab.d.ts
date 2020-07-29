declare type callbackFn = (v: any) => void;
export default class MicrofabProcessor {
    process(configFile: string, gatewaypath: string, walletpath: string, cryptopath: string): Promise<void>;
    asyncForEach(array: any, callback: callbackFn): Promise<void>;
}
export {};
