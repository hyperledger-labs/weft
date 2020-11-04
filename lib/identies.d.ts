export default class Identities {
    private walletpath;
    private profile;
    private is14Wallet;
    constructor(walletpath: string, is14Wallet?: boolean, profile?: any);
    list(): Promise<void>;
    migrateWallet(walletToPath: string, target14: boolean): Promise<void>;
    copyTo(label: string, walletToPath: string, target14?: boolean): Promise<void>;
    private getWallet;
    importToWallet(jsonIdentity: string, mspid?: string): Promise<void>;
    exportFromWallet(name: string, jsonfile: string): Promise<void>;
    enroll(name: string, enrollid: string, enrollpwd: string): Promise<void>;
    register(enrollid: string, adminUser: string, affiliation?: string): Promise<string>;
}
