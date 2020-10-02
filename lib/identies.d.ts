export default class Identities {
    private walletpath;
    private profile;
    constructor(walletpath: string, profile?: any);
    list(): Promise<void>;
    importToWallet(jsonIdentity: string, mspid?: string, compat?: boolean): Promise<void>;
    enroll(name: string, enrollid: string, enrollpwd: string): Promise<void>;
}
