export default class MSP {
    createStructure(cryptoroot: string): void;
    writeId(rootdir: string, jsonIdentity: string, mspid?: string): void;
}
