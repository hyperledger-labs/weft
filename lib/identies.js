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
class Identities {
    constructor(walletpath, profile) {
        this.walletpath = walletpath;
        this.profile = profile;
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const walletPath = path.resolve(this.walletpath);
            const wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
            (yield wallet.list()).forEach((s) => {
                log_1.log({ val: `${s}` });
            });
        });
    }
    importToWallet(jsonIdentity, mspid, compat) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletPath = path.resolve(this.walletpath);
            let wallet;
            if (compat) {
                const walletStore = yield WalletMigration.newFileSystemWalletStore(walletPath);
                wallet = new fabric_network_1.Wallet(walletStore);
            }
            else {
                wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
            }
            const id = JSON.parse(jsonIdentity);
            if (!id.msp_id) {
                id.msp_id = mspid;
            }
            const userIdentity = yield wallet.get(id.name);
            if (userIdentity) {
                log_1.log({ msg: `An identity for the user "${id.name}" already exists in the wallet`, error: true });
                return;
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
    enroll(name, enrollid, enrollpwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletPath = path.resolve(this.walletpath);
            const wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
            const orgName = this.profile.client.organization;
            console.log(`Using the organization : ${orgName}`);
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
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            console.log('Creaging new FabricCAServices');
            const ca = new fabric_ca_client_1.default(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
            console.log('created services');
            const userExists = yield wallet.get(name);
            if (userExists) {
                console.log(`An identity for the client user ${name} already exists in the wallet`);
                return;
            }
            console.log(`calling enroll ${enrollid}  ${enrollpwd}`);
            const enrollment = yield ca.enroll({ enrollmentID: enrollid, enrollmentSecret: enrollpwd });
            console.log('errorled');
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
}
exports.default = Identities;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaWRlbnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsMkNBQTZCO0FBQzdCLHlFQUEyRDtBQUMzRCxtREFBaUQ7QUFDakQsd0VBQWdEO0FBQ2hELCtCQUE0QjtBQUM1QixNQUFxQixVQUFVO0lBSTNCLFlBQW1CLFVBQWtCLEVBQUUsT0FBYTtRQUNoRCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBRUssSUFBSTs7WUFDTixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNqRCxNQUFNLE1BQU0sR0FBRyxNQUFNLHdCQUFPLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0QsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQVMsRUFBRSxFQUFFO2dCQUN4QyxTQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQUE7SUFFSyxjQUFjLENBQUMsWUFBb0IsRUFBRSxLQUFjLEVBQUUsTUFBZ0I7O1lBRXZFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2pELElBQUksTUFBTSxDQUFDO1lBQ1gsSUFBSSxNQUFNLEVBQUU7Z0JBQ1IsTUFBTSxXQUFXLEdBQUcsTUFBTSxlQUFlLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQy9FLE1BQU0sR0FBRyxJQUFJLHVCQUFNLENBQUMsV0FBVyxDQUFD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RUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sVUFBVSxHQUFHLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxJQUFJLFVBQVUsRUFBRTtnQkFDWixPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxJQUFJLCtCQUErQixDQUFDLENBQUM7Z0JBQ3BGLE9BQU87YUFDVjtZQUdELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLFFBQVEsS0FBSyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sVUFBVSxHQUFHLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUM1RixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sWUFBWSxHQUFHO2dCQUNqQixXQUFXLEVBQUU7b0JBQ1QsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXO29CQUNuQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUU7aUJBQ3ZDO2dCQUNELEtBQUssRUFBRSxRQUFRO2dCQUNmLElBQUksRUFBRSxPQUFPO2FBQ2hCLENBQUM7WUFDRixNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3pDLENBQUM7S0FBQTtDQUNKO0FBeEdELDZCQXdHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICovXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgV2FsbGV0TWlncmF0aW9uIGZyb20gJ2ZhYnJpYy13YWxsZXQtbWlncmF0aW9uJztcbmltcG9ydCB7IFdhbGxldHMsIFdhbGxldCB9IGZyb20gJ2ZhYnJpYy1uZXR3b3JrJztcbmltcG9ydCBGYWJyaWNDQVNlcnZpY2VzIGZyb20gJ2ZhYnJpYy1jYS1jbGllbnQnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi9sb2cnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSWRlbnRpdGllcyB7XG4gICAgcHJpdmF0ZSB3YWxsZXRwYXRoOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBwcm9maWxlOiBhbnk7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3Iod2FsbGV0cGF0aDogc3RyaW5nLCBwcm9maWxlPzogYW55KSB7XG4gICAgICAgIHRoaXMud2FsbGV0cGF0aCA9IHdhbGxldHBhdGg7XG4gICAgICAgIHRoaXMucHJvZmlsZSA9IHByb2ZpbGU7XG4gICAgfVxuXG4gICAgYXN5bmMgbGlzdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHBhdGgucmVzb2x2ZSh0aGlzLndhbGxldHBhdGgpO1xuICAgICAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBXYWxsZXRzLm5ld0ZpbGVTeXN0ZW1XYWxsZXQod2FsbGV0UGF0aCk7XG4gICAgICAgIChhd2FpdCB3YWxsZXQubGlzdCgpKS5mb3JFYWNoKChzOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGxvZyh7IHZhbDogYCR7c31gIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBpbXBvcnRUb1dhbGxldChqc29uSWRlbnRpdHk6IHN0cmluZywgbXNwaWQ/OiBzdHJpbmcsIGNvbXBhdD86IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IGZpbGUgc3lzdGVtIGJhc2VkIHdhbGxldCBmb3IgbWFuYWdpbmcgaWRlbnRpdGllcy5cbiAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHBhdGgucmVzb2x2ZSh0aGlzLndhbGxldHBhdGgpO1xuICAgICAgICBsZXQgd2FsbGV0O1xuICAgICAgICBpZiAoY29tcGF0KSB7XG4gICAgICAgICAgICBjb25zdCB3YWxsZXRTdG9yZSA9IGF3YWl0IFdhbGxldE1pZ3JhdGlvbi5uZXdGaWxlU3lzdGVtV2FsbGV0U3RvcmUod2FsbGV0UGF0aCk7XG4gICAgICAgICAgICB3YWxsZXQgPSBuZXcgV2FsbGV0KHdhbGxldFN0b3JlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdhbGxldCA9IGF3YWl0IFdhbGxldHMubmV3RmlsZVN5c3RlbVdhbGxldCh3YWxsZXRQYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlkID0gSlNPTi5wYXJzZShqc29uSWRlbnRpdHkpO1xuXG4gICAgICAgIGlmICghaWQubXNwX2lkKSB7XG4gICAgICAgICAgICBpZC5tc3BfaWQgPSBtc3BpZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSd2ZSBhbHJlYWR5IGdvdCB0aGUgdXNlci5cbiAgICAgICAgY29uc3QgdXNlcklkZW50aXR5ID0gYXdhaXQgd2FsbGV0LmdldChpZC5uYW1lKTtcbiAgICAgICAgaWYgKHVzZXJJZGVudGl0eSkge1xuICAgICAgICAgICAgbG9nKHsgbXNnOiBgQW4gaWRlbnRpdHkgZm9yIHRoZSB1c2VyIFwiJHtpZC5uYW1lfVwiIGFscmVhZHkgZXhpc3RzIGluIHRoZSB3YWxsZXRgLCBlcnJvcjogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNlcnRpZmljYXRlID0gQnVmZmVyLmZyb20oaWQuY2VydCwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBCdWZmZXIuZnJvbShpZC5wcml2YXRlX2tleSwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGlkZW50aXR5ID0ge1xuICAgICAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAgICAgICBjZXJ0aWZpY2F0ZSxcbiAgICAgICAgICAgICAgICBwcml2YXRlS2V5LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1zcElkOiBpZC5tc3BfaWQsXG4gICAgICAgICAgICB0eXBlOiAnWC41MDknLFxuICAgICAgICB9O1xuXG4gICAgICAgIGF3YWl0IHdhbGxldC5wdXQoaWQubmFtZSwgaWRlbnRpdHkpO1xuXG4gICAgICAgIGxvZyh7IG1zZzogYEFkZGVkIGlkZW50aXR5IHVuZGVyIGxhYmVsICR7aWQubmFtZX0gdG8gdGhlIHdhbGxldCBhdCAke3dhbGxldFBhdGh9YCB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBlbnJvbGwobmFtZTogc3RyaW5nLCBlbnJvbGxpZDogc3RyaW5nLCBlbnJvbGxwd2Q6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgZmlsZSBzeXN0ZW0gYmFzZWQgd2FsbGV0IGZvciBtYW5hZ2luZyBpZGVudGl0aWVzLlxuICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMud2FsbGV0cGF0aCk7XG4gICAgICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IFdhbGxldHMubmV3RmlsZVN5c3RlbVdhbGxldCh3YWxsZXRQYXRoKTtcblxuICAgICAgICAvLyBnZXQgdGhlIGdhdGV3YXkgcHJvZmlsZVxuXG4gICAgICAgIGNvbnN0IG9yZ05hbWUgPSB0aGlzLnByb2ZpbGUuY2xpZW50Lm9yZ2FuaXphdGlvbjtcbiAgICAgICAgY29uc29sZS5sb2coYFVzaW5nIHRoZSBvcmdhbml6YXRpb24gOiAke29yZ05hbWV9YCk7XG5cbiAgICAgICAgY29uc3Qgb3JnbXNwaWQgPSB0aGlzLnByb2ZpbGUub3JnYW5pemF0aW9uc1tvcmdOYW1lXS5tc3BpZDtcblxuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgQ0EgY2xpZW50IGZvciBpbnRlcmFjdGluZyB3aXRoIHRoZSBDQS5cbiAgICAgICAgY29uc3QgY2FzID0gdGhpcy5wcm9maWxlLm9yZ2FuaXphdGlvbnNbb3JnTmFtZV0uY2VydGlmaWNhdGVBdXRob3JpdGllcztcblxuICAgICAgICBsZXQgY2FuYW1lO1xuICAgICAgICBpZiAoY2FzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBDQXMgbGlzdGVkIGluIGdhdGV3YXknKTtcbiAgICAgICAgfSBlbHNlIGlmIChjYXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBjYW5hbWUgPSBjYXNbMF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2FJbmZvID0gdGhpcy5wcm9maWxlLmNlcnRpZmljYXRlQXV0aG9yaXRpZXNbY2FuYW1lXTtcblxuICAgICAgICBjb25zdCBjYVRMU0NBQ2VydHMgPSBjYUluZm8udGxzQ0FDZXJ0cy5wZW07XG4gICAgICAgIGNvbnNvbGUubG9nKCdDcmVhZ2luZyBuZXcgRmFicmljQ0FTZXJ2aWNlcycpO1xuICAgICAgICBjb25zdCBjYSA9IG5ldyBGYWJyaWNDQVNlcnZpY2VzKGNhSW5mby51cmwsIHsgdHJ1c3RlZFJvb3RzOiBjYVRMU0NBQ2VydHMsIHZlcmlmeTogZmFsc2UgfSwgY2FJbmZvLmNhTmFtZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjcmVhdGVkIHNlcnZpY2VzJyk7XG4gICAgICAgIGNvbnN0IHVzZXJFeGlzdHMgPSBhd2FpdCB3YWxsZXQuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAodXNlckV4aXN0cykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYEFuIGlkZW50aXR5IGZvciB0aGUgY2xpZW50IHVzZXIgJHtuYW1lfSBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgd2FsbGV0YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbnJvbGwgdGhlIGFkbWluIHVzZXIsIGFuZCBpbXBvcnQgdGhlIG5ldyBpZGVudGl0eSBpbnRvIHRoZSB3YWxsZXQuXG4gICAgICAgIGNvbnNvbGUubG9nKGBjYWxsaW5nIGVucm9sbCAke2Vucm9sbGlkfSAgJHtlbnJvbGxwd2R9YCk7XG4gICAgICAgIGNvbnN0IGVucm9sbG1lbnQgPSBhd2FpdCBjYS5lbnJvbGwoeyBlbnJvbGxtZW50SUQ6IGVucm9sbGlkLCBlbnJvbGxtZW50U2VjcmV0OiBlbnJvbGxwd2QgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcmxlZCcpO1xuICAgICAgICBjb25zdCB4NTA5SWRlbnRpdHkgPSB7XG4gICAgICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgICAgICAgIGNlcnRpZmljYXRlOiBlbnJvbGxtZW50LmNlcnRpZmljYXRlLFxuICAgICAgICAgICAgICAgIHByaXZhdGVLZXk6IGVucm9sbG1lbnQua2V5LnRvQnl0ZXMoKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtc3BJZDogb3JnbXNwaWQsXG4gICAgICAgICAgICB0eXBlOiAnWC41MDknLFxuICAgICAgICB9O1xuICAgICAgICBhd2FpdCB3YWxsZXQucHV0KG5hbWUsIHg1MDlJZGVudGl0eSk7XG4gICAgfVxufVxuIl19