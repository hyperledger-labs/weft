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
    importToWallet(jsonIdentity, mspid) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletPath = path.resolve(this.walletpath);
            const wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaWRlbnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsMkNBQTZCO0FBQzdCLG1EQUF5QztBQUN6Qyx3RUFBZ0Q7QUFDaEQsK0JBQTRCO0FBQzVCLE1BQXFCLFVBQVU7SUFJM0IsWUFBbUIsVUFBa0IsRUFBRSxPQUFhO1FBQ2hELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFFSyxJQUFJOztZQUNOLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sTUFBTSxHQUFHLE1BQU0sd0JBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM3RCxDQUFDLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBUyxFQUFFLEVBQUU7Z0JBQ3hDLFNBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtJQUVLLGNBQWMsQ0FBQyxZQUFvQixFQUFFLEtBQWM7O1lBRXJELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sTUFBTSxHQUFHLE1BQU0sd0JBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUU3RCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXBDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFO2dCQUNaLEVBQUUsQ0FB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SUFBSSwrQkFBK0IsQ0FBQyxDQUFDO2dCQUNwRixPQUFPO2FBQ1Y7WUFHRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixRQUFRLEtBQUssU0FBUyxFQUFFLENBQUMsQ0FBQztZQUN4RCxNQUFNLFVBQVUsR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDNUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QixNQUFNLFlBQVksR0FBRztnQkFDakIsV0FBVyxFQUFFO29CQUNULFdBQVcsRUFBRSxVQUFVLENBQUMsV0FBVztvQkFDbkMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO2lCQUN2QztnQkFDRCxLQUFLLEVBQUUsUUFBUTtnQkFDZixJQUFJLEVBQUUsT0FBTzthQUNoQixDQUFDO1lBQ0YsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQUE7Q0FDSjtBQWxHRCw2QkFrR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFdhbGxldHMgfSBmcm9tICdmYWJyaWMtbmV0d29yayc7XG5pbXBvcnQgRmFicmljQ0FTZXJ2aWNlcyBmcm9tICdmYWJyaWMtY2EtY2xpZW50JztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4vbG9nJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElkZW50aXRpZXMge1xuICAgIHByaXZhdGUgd2FsbGV0cGF0aDogc3RyaW5nO1xuICAgIHByaXZhdGUgcHJvZmlsZTogYW55O1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHdhbGxldHBhdGg6IHN0cmluZywgcHJvZmlsZT86IGFueSkge1xuICAgICAgICB0aGlzLndhbGxldHBhdGggPSB3YWxsZXRwYXRoO1xuICAgICAgICB0aGlzLnByb2ZpbGUgPSBwcm9maWxlO1xuICAgIH1cblxuICAgIGFzeW5jIGxpc3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSBwYXRoLnJlc29sdmUodGhpcy53YWxsZXRwYXRoKTtcbiAgICAgICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgV2FsbGV0cy5uZXdGaWxlU3lzdGVtV2FsbGV0KHdhbGxldFBhdGgpO1xuICAgICAgICAoYXdhaXQgd2FsbGV0Lmxpc3QoKSkuZm9yRWFjaCgoczogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBsb2coeyB2YWw6IGAke3N9YCB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgaW1wb3J0VG9XYWxsZXQoanNvbklkZW50aXR5OiBzdHJpbmcsIG1zcGlkPzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBmaWxlIHN5c3RlbSBiYXNlZCB3YWxsZXQgZm9yIG1hbmFnaW5nIGlkZW50aXRpZXMuXG4gICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSBwYXRoLnJlc29sdmUodGhpcy53YWxsZXRwYXRoKTtcbiAgICAgICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgV2FsbGV0cy5uZXdGaWxlU3lzdGVtV2FsbGV0KHdhbGxldFBhdGgpO1xuXG4gICAgICAgIGNvbnN0IGlkID0gSlNPTi5wYXJzZShqc29uSWRlbnRpdHkpO1xuXG4gICAgICAgIGlmICghaWQubXNwX2lkKSB7XG4gICAgICAgICAgICBpZC5tc3BfaWQgPSBtc3BpZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSd2ZSBhbHJlYWR5IGdvdCB0aGUgdXNlci5cbiAgICAgICAgY29uc3QgdXNlcklkZW50aXR5ID0gYXdhaXQgd2FsbGV0LmdldChpZC5uYW1lKTtcbiAgICAgICAgaWYgKHVzZXJJZGVudGl0eSkge1xuICAgICAgICAgICAgbG9nKHsgbXNnOiBgQW4gaWRlbnRpdHkgZm9yIHRoZSB1c2VyIFwiJHtpZC5uYW1lfVwiIGFscmVhZHkgZXhpc3RzIGluIHRoZSB3YWxsZXRgLCBlcnJvcjogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNlcnRpZmljYXRlID0gQnVmZmVyLmZyb20oaWQuY2VydCwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBCdWZmZXIuZnJvbShpZC5wcml2YXRlX2tleSwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGlkZW50aXR5ID0ge1xuICAgICAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAgICAgICBjZXJ0aWZpY2F0ZSxcbiAgICAgICAgICAgICAgICBwcml2YXRlS2V5LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1zcElkOiBpZC5tc3BfaWQsXG4gICAgICAgICAgICB0eXBlOiAnWC41MDknLFxuICAgICAgICB9O1xuXG4gICAgICAgIGF3YWl0IHdhbGxldC5wdXQoaWQubmFtZSwgaWRlbnRpdHkpO1xuXG4gICAgICAgIGxvZyh7IG1zZzogYEFkZGVkIGlkZW50aXR5IHVuZGVyIGxhYmVsICR7aWQubmFtZX0gdG8gdGhlIHdhbGxldCBhdCAke3dhbGxldFBhdGh9YCB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBlbnJvbGwobmFtZTogc3RyaW5nLCBlbnJvbGxpZDogc3RyaW5nLCBlbnJvbGxwd2Q6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgZmlsZSBzeXN0ZW0gYmFzZWQgd2FsbGV0IGZvciBtYW5hZ2luZyBpZGVudGl0aWVzLlxuICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMud2FsbGV0cGF0aCk7XG4gICAgICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IFdhbGxldHMubmV3RmlsZVN5c3RlbVdhbGxldCh3YWxsZXRQYXRoKTtcblxuICAgICAgICAvLyBnZXQgdGhlIGdhdGV3YXkgcHJvZmlsZVxuXG4gICAgICAgIGNvbnN0IG9yZ05hbWUgPSB0aGlzLnByb2ZpbGUuY2xpZW50Lm9yZ2FuaXphdGlvbjtcbiAgICAgICAgY29uc29sZS5sb2coYFVzaW5nIHRoZSBvcmdhbml6YXRpb24gOiAke29yZ05hbWV9YCk7XG5cbiAgICAgICAgY29uc3Qgb3JnbXNwaWQgPSB0aGlzLnByb2ZpbGUub3JnYW5pemF0aW9uc1tvcmdOYW1lXS5tc3BpZDtcblxuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgQ0EgY2xpZW50IGZvciBpbnRlcmFjdGluZyB3aXRoIHRoZSBDQS5cbiAgICAgICAgY29uc3QgY2FzID0gdGhpcy5wcm9maWxlLm9yZ2FuaXphdGlvbnNbb3JnTmFtZV0uY2VydGlmaWNhdGVBdXRob3JpdGllcztcblxuICAgICAgICBsZXQgY2FuYW1lO1xuICAgICAgICBpZiAoY2FzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBDQXMgbGlzdGVkIGluIGdhdGV3YXknKTtcbiAgICAgICAgfSBlbHNlIGlmIChjYXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBjYW5hbWUgPSBjYXNbMF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2FJbmZvID0gdGhpcy5wcm9maWxlLmNlcnRpZmljYXRlQXV0aG9yaXRpZXNbY2FuYW1lXTtcblxuICAgICAgICBjb25zdCBjYVRMU0NBQ2VydHMgPSBjYUluZm8udGxzQ0FDZXJ0cy5wZW07XG4gICAgICAgIGNvbnNvbGUubG9nKCdDcmVhZ2luZyBuZXcgRmFicmljQ0FTZXJ2aWNlcycpO1xuICAgICAgICBjb25zdCBjYSA9IG5ldyBGYWJyaWNDQVNlcnZpY2VzKGNhSW5mby51cmwsIHsgdHJ1c3RlZFJvb3RzOiBjYVRMU0NBQ2VydHMsIHZlcmlmeTogZmFsc2UgfSwgY2FJbmZvLmNhTmFtZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjcmVhdGVkIHNlcnZpY2VzJyk7XG4gICAgICAgIGNvbnN0IHVzZXJFeGlzdHMgPSBhd2FpdCB3YWxsZXQuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAodXNlckV4aXN0cykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYEFuIGlkZW50aXR5IGZvciB0aGUgY2xpZW50IHVzZXIgJHtuYW1lfSBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgd2FsbGV0YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbnJvbGwgdGhlIGFkbWluIHVzZXIsIGFuZCBpbXBvcnQgdGhlIG5ldyBpZGVudGl0eSBpbnRvIHRoZSB3YWxsZXQuXG4gICAgICAgIGNvbnNvbGUubG9nKGBjYWxsaW5nIGVucm9sbCAke2Vucm9sbGlkfSAgJHtlbnJvbGxwd2R9YCk7XG4gICAgICAgIGNvbnN0IGVucm9sbG1lbnQgPSBhd2FpdCBjYS5lbnJvbGwoeyBlbnJvbGxtZW50SUQ6IGVucm9sbGlkLCBlbnJvbGxtZW50U2VjcmV0OiBlbnJvbGxwd2QgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcmxlZCcpO1xuICAgICAgICBjb25zdCB4NTA5SWRlbnRpdHkgPSB7XG4gICAgICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgICAgICAgIGNlcnRpZmljYXRlOiBlbnJvbGxtZW50LmNlcnRpZmljYXRlLFxuICAgICAgICAgICAgICAgIHByaXZhdGVLZXk6IGVucm9sbG1lbnQua2V5LnRvQnl0ZXMoKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtc3BJZDogb3JnbXNwaWQsXG4gICAgICAgICAgICB0eXBlOiAnWC41MDknLFxuICAgICAgICB9O1xuICAgICAgICBhd2FpdCB3YWxsZXQucHV0KG5hbWUsIHg1MDlJZGVudGl0eSk7XG4gICAgfVxufVxuIl19