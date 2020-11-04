"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const path = __importStar(require("path"));
const WalletMigration = __importStar(require("fabric-wallet-migration"));
const fabric_network_1 = require("fabric-network");
const fabric_ca_client_1 = __importDefault(require("fabric-ca-client"));
const log_1 = require("./log");
const fs_1 = require("fs");
const userutils_1 = require("./userutils");
class Identities {
    constructor(walletpath, is14Wallet = false, profile) {
        this.walletpath = walletpath;
        this.profile = profile;
        this.is14Wallet = is14Wallet;
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.getWallet(this.walletpath, this.is14Wallet);
            (yield wallet.list()).forEach((s) => {
                log_1.log({ val: `${s}` });
            });
        });
    }
    migrateWallet(walletToPath, target14) {
        return __awaiter(this, void 0, void 0, function* () {
            if (target14 === this.is14Wallet) {
                throw new Error('Unable to migrated from same versions');
            }
            const walletTo = yield this.getWallet(userutils_1.resolveWalletPath(walletToPath, true), target14);
            const walletFrom = yield this.getWallet(userutils_1.resolveWalletPath(this.walletpath, false), !target14);
            const identityLabels = yield walletFrom.list();
            for (const label of identityLabels) {
                const identity = yield walletFrom.get(label);
                if (identity) {
                    yield walletTo.put(label, identity);
                }
            }
        });
    }
    copyTo(label, walletToPath, target14 = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletFrom = yield this.getWallet(userutils_1.resolveWalletPath(this.walletpath, false));
            const walletTo = yield this.getWallet(userutils_1.resolveWalletPath(walletToPath, false), target14);
            const identity = yield walletFrom.get(label);
            if (identity) {
                yield walletTo.put(label, identity);
            }
        });
    }
    getWallet(walletPath, compat) {
        return __awaiter(this, void 0, void 0, function* () {
            let wallet;
            if (compat) {
                const walletStore = yield WalletMigration.newFileSystemWalletStore(walletPath);
                wallet = new fabric_network_1.Wallet(walletStore);
            }
            else {
                wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
            }
            return wallet;
        });
    }
    importToWallet(jsonIdentity, mspid) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletPath = path.resolve(this.walletpath);
            const wallet = yield this.getWallet(this.walletpath, this.is14Wallet);
            const id = JSON.parse(jsonIdentity);
            if (!id.msp_id) {
                id.msp_id = mspid;
            }
            const userIdentity = yield wallet.get(id.name);
            if (userIdentity) {
                throw new Error(`An identity for the user "${id.name}" already exists in the wallet`);
            }
            const certificate = Buffer.from(id.cert, 'base64').toString();
            const privateKey = Buffer.from(id.private_key, 'base64').toString();
            const identity = {
                credentials: {
                    certificate,
                    privateKey,
                },
                mspId: id.msp_id,
                type: 'X.509',
            };
            yield wallet.put(id.name, identity);
            log_1.log({ msg: `Added identity under label ${id.name} to the wallet at ${walletPath}` });
        });
    }
    exportFromWallet(name, jsonfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.getWallet(this.walletpath, this.is14Wallet);
            const userIdentity = yield wallet.get(name);
            if (!userIdentity) {
                log_1.log({ msg: `An identity for the user "${name}" does not exist in the wallet`, error: true });
                return;
            }
            const cert = userIdentity.credentials.certificate;
            const privateKey = userIdentity.credentials.privateKey;
            const jsonId = {
                name,
                cert: Buffer.from(cert).toString('base64'),
                private_key: Buffer.from(privateKey).toString('base64'),
            };
            fs_1.writeFileSync(path.resolve(jsonfile), JSON.stringify(jsonId));
            log_1.log({ msg: `Exported identity under name ${name} to the JSON file ${jsonfile}` });
        });
    }
    enroll(name, enrollid, enrollpwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.getWallet(this.walletpath, this.is14Wallet);
            if (!this.profile) {
                throw new Error('Gateway connection profile has not been specified');
            }
            const orgName = this.profile.client.organization;
            log_1.log({ msg: `Using the organization : ${orgName}` });
            const orgmspid = this.profile.organizations[orgName].mspid;
            const cas = this.profile.organizations[orgName].certificateAuthorities;
            let caname;
            if (cas.length === 0) {
                throw new Error('No CAs listed in gateway');
            }
            else if (cas.length === 1) {
                caname = cas[0];
            }
            const caInfo = this.profile.certificateAuthorities[caname];
            let ca;
            if (caInfo.tlsCACerts) {
                const caTLSCACerts = caInfo.tlsCACerts.pem;
                ca = new fabric_ca_client_1.default(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
            }
            else {
                ca = new fabric_ca_client_1.default(caInfo.url);
            }
            const userExists = yield wallet.get(name);
            if (userExists) {
                throw new Error(`An identity for the client user ${name} already exists in the wallet`);
            }
            const enrollment = yield ca.enroll({ enrollmentID: enrollid, enrollmentSecret: enrollpwd });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: orgmspid,
                type: 'X.509',
            };
            yield wallet.put(name, x509Identity);
        });
    }
    register(enrollid, adminUser, affiliation = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.getWallet(this.walletpath, this.is14Wallet);
            if (!this.profile) {
                throw new Error('Gateway connection profile has not been specified');
            }
            const orgName = this.profile.client.organization;
            log_1.log({ msg: `Using the organization : ${orgName}` });
            const cas = this.profile.organizations[orgName].certificateAuthorities;
            let caname;
            if (cas.length === 0) {
                throw new Error('No CAs listed in gateway');
            }
            else if (cas.length === 1) {
                caname = cas[0];
            }
            const adminIdentity = yield wallet.get(adminUser);
            if (!adminIdentity) {
                const msg = `An identity for the admin user "${adminUser}" does not exist in the wallet`;
                log_1.log({ msg, error: true });
                throw new Error(msg);
            }
            const caInfo = this.profile.certificateAuthorities[caname];
            let ca;
            if (caInfo.tlsCACerts) {
                const caTLSCACerts = caInfo.tlsCACerts.pem;
                ca = new fabric_ca_client_1.default(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
            }
            else {
                ca = new fabric_ca_client_1.default(caInfo.url);
            }
            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUserCtx = yield provider.getUserContext(adminIdentity, adminUser);
            const secret = yield ca.register({
                affiliation,
                enrollmentID: enrollid,
                role: 'client',
            }, adminUserCtx);
            return secret;
        });
    }
}
exports.default = Identities;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaWRlbnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsMkNBQTZCO0FBQzdCLHlFQUEyRDtBQUMzRCxtREFBaUQ7QUFDakQsd0VBQWdEO0FBQ2hELCtCQUE0QjtBQUM1QiwyQkFBbUM7QUFDbkMsMkNBQWdEO0FBUWhELE1BQXFCLFVBQVU7SUFXM0IsWUFBbUIsVUFBa0IsRUFBRSxVQUFVLEdBQUcsS0FBSyxFQUFFLE9BQWE7UUFDcEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUtLLElBQUk7O1lBQ04sTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RFLENBQUMsTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFTLEVBQUUsRUFBRTtnQkFDeEMsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0lBS0ssYUFBYSxDQUFDLFlBQW9CLEVBQUUsUUFBaUI7O1lBQ3ZELElBQUksUUFBUSxLQUFLLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQzlCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQzthQUM1RDtZQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyw2QkFBaUIsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxD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LE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO2dCQUMzQyxFQUFFLEdBQUcsSUFBSSwwQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3ZHO2lCQUFNO2dCQUNILEVBQUUsR0FBRyxJQUFJLDBCQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN6QztZQUdELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUUsTUFBTSxZQUFZLEdBQUcsTUFBTSxRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUU3RSxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQzVCO2dCQUNJLFdBQVc7Z0JBQ1gsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxRQUFRO2FBQ2pCLEVBQ0QsWUFBWSxDQUNmLENBQUM7WUFFRixPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO0tBQUE7Q0FDSjtBQWpSRCw2QkFpUkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIFdhbGxldE1pZ3JhdGlvbiBmcm9tICdmYWJyaWMtd2FsbGV0LW1pZ3JhdGlvbic7XG5pbXBvcnQgeyBXYWxsZXRzLCBXYWxsZXQgfSBmcm9tICdmYWJyaWMtbmV0d29yayc7XG5pbXBvcnQgRmFicmljQ0FTZXJ2aWNlcyBmcm9tICdmYWJyaWMtY2EtY2xpZW50JztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4vbG9nJztcbmltcG9ydCB7IHdyaXRlRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyByZXNvbHZlV2FsbGV0UGF0aCB9IGZyb20gJy4vdXNlcnV0aWxzJztcblxuLyoqXG4gKiBDbGFzcyB0byBoZWxwIG1hbmFnZSB0aGUgdHJhbnNpdGlvbiBiZXR3ZWVuIElCUCBhbmQgQXBwbGljYXRpb24gV2FsbGV0IGlkZW50aXRpZXNcbiAqXG4gKiBBbHNvIGNhbiBtYW5hZ2VkIHdpdGggdGhlIGhlbHAgb2YgdGhlIGZhYnJpYy13YWxsZXQtbWlncmF0aW9uIG1vZHVsZSwgY29weWluZyBiZXR3ZWVuXG4gKiB2MS40IFNESyBhbmQgdjIuMiBTREsgd2FsbGV0c1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJZGVudGl0aWVzIHtcbiAgICBwcml2YXRlIHdhbGxldHBhdGg6IHN0cmluZztcbiAgICBwcml2YXRlIHByb2ZpbGU6IGFueTtcbiAgICBwcml2YXRlIGlzMTRXYWxsZXQ6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2UgdG8gcGVyZm9ybSB3b3JrLlxuICAgICAqXG4gICAgICogQHBhcmFtIHdhbGxldHBhdGggV2FsbGV0IHBhdGhcbiAgICAgKiBAcGFyYW0gcHJvZmlsZSBPcHRpb25hbCBjb25uZWN0aW9uIHByb2ZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgY29uc3RydWN0b3Iod2FsbGV0cGF0aDogc3RyaW5nLCBpczE0V2FsbGV0ID0gZmFsc2UsIHByb2ZpbGU/OiBhbnkpIHtcbiAgICAgICAgdGhpcy53YWxsZXRwYXRoID0gd2FsbGV0cGF0aDtcbiAgICAgICAgdGhpcy5wcm9maWxlID0gcHJvZmlsZTtcbiAgICAgICAgdGhpcy5pczE0V2FsbGV0ID0gaXMxNFdhbGxldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMaXN0cyB0aGUgaWRlbnRpdGllcyB0byB0aGUgY29uc29sZS5cbiAgICAgKi9cbiAgICBhc3luYyBsaXN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCB0aGlzLmdldFdhbGxldCh0aGlzLndhbGxldHBhdGgsIHRoaXMuaXMxNFdhbGxldCk7XG4gICAgICAgIChhd2FpdCB3YWxsZXQubGlzdCgpKS5mb3JFYWNoKChzOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGxvZyh7IHZhbDogYCR7c31gIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogTWlncmF0ZXMgZnJvbSB0aGUgY3VycmVudCB3YWxsZXQgdG8gYSBuZXcgZGVzdGluYXRpb24uXG4gICAgICogSXQgaXMgYW4gZXJyb3IgdG8gdHJ5IHRvIG1pZ3JhdGUgZnJvbSB0aGUgc2FtZSB2ZXJzaW9uLlxuICAgICAqL1xuICAgIGFzeW5jIG1pZ3JhdGVXYWxsZXQod2FsbGV0VG9QYXRoOiBzdHJpbmcsIHRhcmdldDE0OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICh0YXJnZXQxNCA9PT0gdGhpcy5pczE0V2FsbGV0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBtaWdyYXRlZCBmcm9tIHNhbWUgdmVyc2lvbnMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdhbGxldFRvID0gYXdhaXQgdGhpcy5nZXRXYWxsZXQocmVzb2x2ZVdhbGxldFBhdGgod2FsbGV0VG9QYXRoLCB0cnVlKSwgdGFyZ2V0MTQpO1xuICAgICAgICBjb25zdCB3YWxsZXRGcm9tID0gYXdhaXQgdGhpcy5nZXRXYWxsZXQocmVzb2x2ZVdhbGxldFBhdGgodGhpcy53YWxsZXRwYXRoLCBmYWxzZSksICF0YXJnZXQxNCk7IC8vIGNob29zZSB0aGUgb3Bwb3NpdGUgZm9yIHRoZSB3YWxsZXQgdHlwZVxuICAgICAgICBjb25zdCBpZGVudGl0eUxhYmVscyA9IGF3YWl0IHdhbGxldEZyb20ubGlzdCgpO1xuICAgICAgICBmb3IgKGNvbnN0IGxhYmVsIG9mIGlkZW50aXR5TGFiZWxzKSB7XG4gICAgICAgICAgICBjb25zdCBpZGVudGl0eSA9IGF3YWl0IHdhbGxldEZyb20uZ2V0KGxhYmVsKTtcbiAgICAgICAgICAgIGlmIChpZGVudGl0eSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHdhbGxldFRvLnB1dChsYWJlbCwgaWRlbnRpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29weSBhIGdpdmVuIGlkZW50aXR5IGZyb20gdGhlIHdhbGxldFxuICAgICAqXG4gICAgICogQHBhcmFtIGxhYmVsIG5hbWUgb2YgdGhlIGlkZW50aXR5IHRvIGNvcHlcbiAgICAgKiBAcGFyYW0gd2FsbGV0VG9QYXRoIHBhdGggb2YgdGhlIGRlc3RpbmF0aW9uIHdhbGxldFxuICAgICAqIEBwYXJhbSB0YXJnZXQxNCB3aGF0IHR5cGUgb2YgdGhlIGRlc3RpbmF0aW9uIHdhbGxldCBpc1xuICAgICAqL1xuICAgIGFzeW5jIGNvcHlUbyhsYWJlbDogc3RyaW5nLCB3YWxsZXRUb1BhdGg6IHN0cmluZywgdGFyZ2V0MTQgPSBmYWxzZSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB3YWxsZXRGcm9tID0gYXdhaXQgdGhpcy5nZXRXYWxsZXQocmVzb2x2ZVdhbGxldFBhdGgodGhpcy53YWxsZXRwYXRoLCBmYWxzZSkpO1xuICAgICAgICBjb25zdCB3YWxsZXRUbyA9IGF3YWl0IHRoaXMuZ2V0V2FsbGV0KHJlc29sdmVXYWxsZXRQYXRoKHdhbGxldFRvUGF0aCwgZmFsc2UpLCB0YXJnZXQxNCk7XG4gICAgICAgIGNvbnN0IGlkZW50aXR5ID0gYXdhaXQgd2FsbGV0RnJvbS5nZXQobGFiZWwpO1xuICAgICAgICBpZiAoaWRlbnRpdHkpIHtcbiAgICAgICAgICAgIGF3YWl0IHdhbGxldFRvLnB1dChsYWJlbCwgaWRlbnRpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYSBwYXRoIGNyZWF0ZSBhIG5ldyB3YWxsZXRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB3YWxsZXRQYXRoXG4gICAgICogQHBhcmFtIGNvbXBhdFxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgZ2V0V2FsbGV0KHdhbGxldFBhdGg6IHN0cmluZywgY29tcGF0PzogYm9vbGVhbik6IFByb21pc2U8V2FsbGV0PiB7XG4gICAgICAgIGxldCB3YWxsZXQ7XG4gICAgICAgIGlmIChjb21wYXQpIHtcbiAgICAgICAgICAgIGNvbnN0IHdhbGxldFN0b3JlID0gYXdhaXQgV2FsbGV0TWlncmF0aW9uLm5ld0ZpbGVTeXN0ZW1XYWxsZXRTdG9yZSh3YWxsZXRQYXRoKTtcbiAgICAgICAgICAgIHdhbGxldCA9IG5ldyBXYWxsZXQod2FsbGV0U3RvcmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2FsbGV0ID0gYXdhaXQgV2FsbGV0cy5uZXdGaWxlU3lzdGVtV2FsbGV0KHdhbGxldFBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3YWxsZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW1wb3J0IGEgSlNPTiBzdHJpbmcgaWRlbnRpdHkgdG8gdGhlIGFwcGxpY2F0aW9uIHdhbGxldFxuICAgICAqXG4gICAgICogSWYgdGhlIGlkZW50aXR5IGlzIGFscmVhZHkgaW4gdGhlIHdhbGxldCBhbmQgZXJyb3IgaXMgdGhyb3duLlxuICAgICAqXG4gICAgICogQHBhcmFtIGpzb25JZGVudGl0eSBKU09OIGZvcm1hdCBzdHJpbmcgZnJvbSBJQlBcbiAgICAgKiBAcGFyYW0gbXNwaWQgIE1TUElEIHRvIGFkZCB0byB0aGUgaWRlbnRpdHkgaWYgbmVlZGVkXG4gICAgICogQHBhcmFtIGNvbXBhdCBpcyB0aGVcbiAgICAgKi9cbiAgICBhc3luYyBpbXBvcnRUb1dhbGxldChqc29uSWRlbnRpdHk6IHN0cmluZywgbXNwaWQ/OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IGZpbGUgc3lzdGVtIGJhc2VkIHdhbGxldCBmb3IgbWFuYWdpbmcgaWRlbnRpdGllcy5cbiAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHBhdGgucmVzb2x2ZSh0aGlzLndhbGxldHBhdGgpO1xuICAgICAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCB0aGlzLmdldFdhbGxldCh0aGlzLndhbGxldHBhdGgsIHRoaXMuaXMxNFdhbGxldCk7XG5cbiAgICAgICAgY29uc3QgaWQgPSBKU09OLnBhcnNlKGpzb25JZGVudGl0eSk7XG5cbiAgICAgICAgaWYgKCFpZC5tc3BfaWQpIHtcbiAgICAgICAgICAgIGlkLm1zcF9pZCA9IG1zcGlkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlJ3ZlIGFscmVhZHkgZ290IHRoZSB1c2VyLlxuICAgICAgICBjb25zdCB1c2VySWRlbnRpdHkgPSBhd2FpdCB3YWxsZXQuZ2V0KGlkLm5hbWUpO1xuICAgICAgICBpZiAodXNlcklkZW50aXR5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFuIGlkZW50aXR5IGZvciB0aGUgdXNlciBcIiR7aWQubmFtZX1cIiBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgd2FsbGV0YCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjZXJ0aWZpY2F0ZSA9IEJ1ZmZlci5mcm9tKGlkLmNlcnQsICdiYXNlNjQnKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBwcml2YXRlS2V5ID0gQnVmZmVyLmZyb20oaWQucHJpdmF0ZV9rZXksICdiYXNlNjQnKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBpZGVudGl0eSA9IHtcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgICAgICAgY2VydGlmaWNhdGUsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZUtleSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtc3BJZDogaWQubXNwX2lkLFxuICAgICAgICAgICAgdHlwZTogJ1guNTA5JyxcbiAgICAgICAgfTtcblxuICAgICAgICBhd2FpdCB3YWxsZXQucHV0KGlkLm5hbWUsIGlkZW50aXR5KTtcblxuICAgICAgICBsb2coeyBtc2c6IGBBZGRlZCBpZGVudGl0eSB1bmRlciBsYWJlbCAke2lkLm5hbWV9IHRvIHRoZSB3YWxsZXQgYXQgJHt3YWxsZXRQYXRofWAgfSk7XG4gICAgfVxuXG4gICAgLyoqIFRha2UgYW4gaWRlbnRpdHkgZnJvbSB0aGUgYXBwbGljYWJsZSB3YWxsZXQgYW5kIGNyZWF0ZSBhIEpTT04gZmlsZSBzdWl0YWJsZSBmb3IgSUJQXG4gICAgICogQW4gZXJyb3IgaXMgdGhyb3duIGlmIHRoZSBuYW1lIGlzIG5vdCBpbiB0aGUgd2FsbGV0XG4gICAgICpcbiAgICAgKiBUaGUgZGVzdGluYXRpb24gbXVzdCBiZSB3cnRpZWFibGUgYW5kIHdpbGwgYmUgb3ZlcndyaXR0ZW5cbiAgICAgKlxuICAgICAqL1xuXG4gICAgYXN5bmMgZXhwb3J0RnJvbVdhbGxldChuYW1lOiBzdHJpbmcsIGpzb25maWxlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgdGhpcy5nZXRXYWxsZXQodGhpcy53YWxsZXRwYXRoLCB0aGlzLmlzMTRXYWxsZXQpO1xuXG4gICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSd2ZSBhbHJlYWR5IGdvdCB0aGUgdXNlci5cbiAgICAgICAgY29uc3QgdXNlcklkZW50aXR5ID0gYXdhaXQgd2FsbGV0LmdldChuYW1lKTtcbiAgICAgICAgaWYgKCF1c2VySWRlbnRpdHkpIHtcbiAgICAgICAgICAgIGxvZyh7IG1zZzogYEFuIGlkZW50aXR5IGZvciB0aGUgdXNlciBcIiR7bmFtZX1cIiBkb2VzIG5vdCBleGlzdCBpbiB0aGUgd2FsbGV0YCwgZXJyb3I6IHRydWUgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjZXJ0ID0gKHVzZXJJZGVudGl0eSBhcyBhbnkpLmNyZWRlbnRpYWxzLmNlcnRpZmljYXRlO1xuICAgICAgICBjb25zdCBwcml2YXRlS2V5ID0gKHVzZXJJZGVudGl0eSBhcyBhbnkpLmNyZWRlbnRpYWxzLnByaXZhdGVLZXk7XG4gICAgICAgIGNvbnN0IGpzb25JZCA9IHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBjZXJ0OiBCdWZmZXIuZnJvbShjZXJ0KS50b1N0cmluZygnYmFzZTY0JyksXG4gICAgICAgICAgICBwcml2YXRlX2tleTogQnVmZmVyLmZyb20ocHJpdmF0ZUtleSkudG9TdHJpbmcoJ2Jhc2U2NCcpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHdyaXRlRmlsZVN5bmMocGF0aC5yZXNvbHZlKGpzb25maWxlKSwgSlNPTi5zdHJpbmdpZnkoanNvbklkKSk7XG5cbiAgICAgICAgbG9nKHsgbXNnOiBgRXhwb3J0ZWQgaWRlbnRpdHkgdW5kZXIgbmFtZSAke25hbWV9IHRvIHRoZSBKU09OIGZpbGUgJHtqc29uZmlsZX1gIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVudHJvbGwgdGhlIGlkIHNwZWNpZmllZCwgd2l0aCB0aGUgZW5yb2xsIHBhc3N3b3JkIHNwZWNpZmllZCwgYW5kIGFkZCBpdCB0byB0aGVcbiAgICAgKiB3YWxsZXQgdW5kZXIgbmFtZVxuICAgICAqXG4gICAgICogVGhpcyByZXF1aXJlcyB0aGlzIEluZGVudGl0aWVzIG9iamVjdCB0byBoYXZlIGJlZW4gY3JlYXRlZCB3aXRoIGEgY29ubmVjdGlvbiBwcm9maWxlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbmFtZSBsYWJlbCB0byBhZGQgdGhlIGlkZW50aXR5IHVuZGVyXG4gICAgICogQHBhcmFtIGVucm9sbGlkICBlbnJvbGwgaWRcbiAgICAgKiBAcGFyYW0gZW5yb2xscHdkICBlbnJvbGwgcGFzc3dvcmRcbiAgICAgKi9cbiAgICBhc3luYyBlbnJvbGwobmFtZTogc3RyaW5nLCBlbnJvbGxpZDogc3RyaW5nLCBlbnJvbGxwd2Q6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCB0aGlzLmdldFdhbGxldCh0aGlzLndhbGxldHBhdGgsIHRoaXMuaXMxNFdhbGxldCk7XG4gICAgICAgIC8vIGdldCB0aGUgZ2F0ZXdheSBwcm9maWxlXG5cbiAgICAgICAgaWYgKCF0aGlzLnByb2ZpbGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignR2F0ZXdheSBjb25uZWN0aW9uIHByb2ZpbGUgaGFzIG5vdCBiZWVuIHNwZWNpZmllZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb3JnTmFtZSA9IHRoaXMucHJvZmlsZS5jbGllbnQub3JnYW5pemF0aW9uO1xuICAgICAgICBsb2coeyBtc2c6IGBVc2luZyB0aGUgb3JnYW5pemF0aW9uIDogJHtvcmdOYW1lfWAgfSk7XG5cbiAgICAgICAgY29uc3Qgb3JnbXNwaWQgPSB0aGlzLnByb2ZpbGUub3JnYW5pemF0aW9uc1tvcmdOYW1lXS5tc3BpZDtcblxuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgQ0EgY2xpZW50IGZvciBpbnRlcmFjdGluZyB3aXRoIHRoZSBDQS5cbiAgICAgICAgY29uc3QgY2FzID0gdGhpcy5wcm9maWxlLm9yZ2FuaXphdGlvbnNbb3JnTmFtZV0uY2VydGlmaWNhdGVBdXRob3JpdGllcztcblxuICAgICAgICBsZXQgY2FuYW1lO1xuICAgICAgICBpZiAoY2FzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBDQXMgbGlzdGVkIGluIGdhdGV3YXknKTtcbiAgICAgICAgfSBlbHNlIGlmIChjYXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBjYW5hbWUgPSBjYXNbMF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2FJbmZvID0gdGhpcy5wcm9maWxlLmNlcnRpZmljYXRlQXV0aG9yaXRpZXNbY2FuYW1lXTtcblxuICAgICAgICBsZXQgY2E7XG4gICAgICAgIGlmIChjYUluZm8udGxzQ0FDZXJ0cykge1xuICAgICAgICAgICAgY29uc3QgY2FUTFNDQUNlcnRzID0gY2FJbmZvLnRsc0NBQ2VydHMucGVtO1xuICAgICAgICAgICAgY2EgPSBuZXcgRmFicmljQ0FTZXJ2aWNlcyhjYUluZm8udXJsLCB7IHRydXN0ZWRSb290czogY2FUTFNDQUNlcnRzLCB2ZXJpZnk6IGZhbHNlIH0sIGNhSW5mby5jYU5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2EgPSBuZXcgRmFicmljQ0FTZXJ2aWNlcyhjYUluZm8udXJsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXJFeGlzdHMgPSBhd2FpdCB3YWxsZXQuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAodXNlckV4aXN0cykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBbiBpZGVudGl0eSBmb3IgdGhlIGNsaWVudCB1c2VyICR7bmFtZX0gYWxyZWFkeSBleGlzdHMgaW4gdGhlIHdhbGxldGApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW5yb2xsIHRoZSBhZG1pbiB1c2VyLCBhbmQgaW1wb3J0IHRoZSBuZXcgaWRlbnRpdHkgaW50byB0aGUgd2FsbGV0LlxuICAgICAgICBjb25zdCBlbnJvbGxtZW50ID0gYXdhaXQgY2EuZW5yb2xsKHsgZW5yb2xsbWVudElEOiBlbnJvbGxpZCwgZW5yb2xsbWVudFNlY3JldDogZW5yb2xscHdkIH0pO1xuICAgICAgICBjb25zdCB4NTA5SWRlbnRpdHkgPSB7XG4gICAgICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgICAgICAgIGNlcnRpZmljYXRlOiBlbnJvbGxtZW50LmNlcnRpZmljYXRlLFxuICAgICAgICAgICAgICAgIHByaXZhdGVLZXk6IGVucm9sbG1lbnQua2V5LnRvQnl0ZXMoKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtc3BJZDogb3JnbXNwaWQsXG4gICAgICAgICAgICB0eXBlOiAnWC41MDknLFxuICAgICAgICB9O1xuICAgICAgICBhd2FpdCB3YWxsZXQucHV0KG5hbWUsIHg1MDlJZGVudGl0eSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIGEgbmV3IHVzZXIgdW5kZXIgdGhlIGVucm9sbCBpZCBnaXZlblxuICAgICAqIFRoZSBjb25uZWN0aW9uIHByb2ZpbGUgaXMgcmVxdWlyZWQgZm9yIHRoaXMgZnVuY3Rpb24sIGFuZCBlcnJvciBpcyB0aHJvd24gaWYgbm90IHByZXNlbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbnJvbGxpZFxuICAgICAqIEBwYXJhbSBhZG1pblVzZXJcbiAgICAgKiBAcGFyYW0gYWZmaWxpYXRpb25cbiAgICAgKlxuICAgICAqIEByZXR1cm4gdGhlIGVucm9sbHB3ZFxuICAgICAqL1xuICAgIGFzeW5jIHJlZ2lzdGVyKGVucm9sbGlkOiBzdHJpbmcsIGFkbWluVXNlcjogc3RyaW5nLCBhZmZpbGlhdGlvbiA9ICcnKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgdGhpcy5nZXRXYWxsZXQodGhpcy53YWxsZXRwYXRoLCB0aGlzLmlzMTRXYWxsZXQpO1xuICAgICAgICAvLyBnZXQgdGhlIGdhdGV3YXkgcHJvZmlsZVxuXG4gICAgICAgIGlmICghdGhpcy5wcm9maWxlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0dhdGV3YXkgY29ubmVjdGlvbiBwcm9maWxlIGhhcyBub3QgYmVlbiBzcGVjaWZpZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9yZ05hbWUgPSB0aGlzLnByb2ZpbGUuY2xpZW50Lm9yZ2FuaXphdGlvbjtcbiAgICAgICAgbG9nKHsgbXNnOiBgVXNpbmcgdGhlIG9yZ2FuaXphdGlvbiA6ICR7b3JnTmFtZX1gIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBDQSBjbGllbnQgZm9yIGludGVyYWN0aW5nIHdpdGggdGhlIENBLlxuICAgICAgICBjb25zdCBjYXMgPSB0aGlzLnByb2ZpbGUub3JnYW5pemF0aW9uc1tvcmdOYW1lXS5jZXJ0aWZpY2F0ZUF1dGhvcml0aWVzO1xuXG4gICAgICAgIGxldCBjYW5hbWU7XG4gICAgICAgIGlmIChjYXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIENBcyBsaXN0ZWQgaW4gZ2F0ZXdheScpO1xuICAgICAgICB9IGVsc2UgaWYgKGNhcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIGNhbmFtZSA9IGNhc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSd2ZSBhbHJlYWR5IGVucm9sbGVkIHRoZSBhZG1pbiB1c2VyLlxuICAgICAgICBjb25zdCBhZG1pbklkZW50aXR5ID0gYXdhaXQgd2FsbGV0LmdldChhZG1pblVzZXIpO1xuICAgICAgICBpZiAoIWFkbWluSWRlbnRpdHkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBBbiBpZGVudGl0eSBmb3IgdGhlIGFkbWluIHVzZXIgXCIke2FkbWluVXNlcn1cIiBkb2VzIG5vdCBleGlzdCBpbiB0aGUgd2FsbGV0YDtcbiAgICAgICAgICAgIGxvZyh7IG1zZywgZXJyb3I6IHRydWUgfSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYUluZm8gPSB0aGlzLnByb2ZpbGUuY2VydGlmaWNhdGVBdXRob3JpdGllc1tjYW5hbWVdO1xuICAgICAgICBsZXQgY2E7XG4gICAgICAgIGlmIChjYUluZm8udGxzQ0FDZXJ0cykge1xuICAgICAgICAgICAgY29uc3QgY2FUTFNDQUNlcnRzID0gY2FJbmZvLnRsc0NBQ2VydHMucGVtO1xuICAgICAgICAgICAgY2EgPSBuZXcgRmFicmljQ0FTZXJ2aWNlcyhjYUluZm8udXJsLCB7IHRydXN0ZWRSb290czogY2FUTFNDQUNlcnRzLCB2ZXJpZnk6IGZhbHNlIH0sIGNhSW5mby5jYU5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2EgPSBuZXcgRmFicmljQ0FTZXJ2aWNlcyhjYUluZm8udXJsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGJ1aWxkIGEgdXNlciBvYmplY3QgZm9yIGF1dGhlbnRpY2F0aW5nIHdpdGggdGhlIENBXG4gICAgICAgIGNvbnN0IHByb3ZpZGVyID0gd2FsbGV0LmdldFByb3ZpZGVyUmVnaXN0cnkoKS5nZXRQcm92aWRlcihhZG1pbklkZW50aXR5LnR5cGUpO1xuICAgICAgICBjb25zdCBhZG1pblVzZXJDdHggPSBhd2FpdCBwcm92aWRlci5nZXRVc2VyQ29udGV4dChhZG1pbklkZW50aXR5LCBhZG1pblVzZXIpO1xuICAgICAgICAvLyBSZWdpc3RlciB0aGUgdXNlciwgZW5yb2xsIHRoZSB1c2VyLCBhbmQgaW1wb3J0IHRoZSBuZXcgaWRlbnRpdHkgaW50byB0aGUgd2FsbGV0LlxuICAgICAgICBjb25zdCBzZWNyZXQgPSBhd2FpdCBjYS5yZWdpc3RlcihcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhZmZpbGlhdGlvbixcbiAgICAgICAgICAgICAgICBlbnJvbGxtZW50SUQ6IGVucm9sbGlkLFxuICAgICAgICAgICAgICAgIHJvbGU6ICdjbGllbnQnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFkbWluVXNlckN0eCxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gc2VjcmV0O1xuICAgIH1cbn1cbiJdfQ==