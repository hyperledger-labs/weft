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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
    importToWallet(jsonIdentity) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletPath = path.resolve(this.walletpath);
            const wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
            const id = JSON.parse(jsonIdentity);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaWRlbnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsMkNBQTZCO0FBQzdCLG1EQUF5QztBQUN6Qyx3RUFBZ0Q7QUFDaEQsK0JBQTRCO0FBQzVCLE1BQXFCLFVBQVU7SUFJM0IsWUFBbUIsVUFBa0IsRUFBRSxPQUFhO1FBQ2hELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFFSyxJQUFJOztZQUNOLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sTUFBTSxHQUFHLE1BQU0sd0JBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM3RCxDQUFDLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBUyxFQUFFLEVBQUU7Z0JBQ3hDLFNBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtJQUVLLGNBQWMsQ0FBQyxZQUFvQjs7WUFFckMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDakQsTUFBTSxNQUFNLEdBQUcsTUFBTSx3QkFBTyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRTdELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFHcEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJ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QUFFLENBQUMsQ0FBQztZQUN4RCxNQUFNLFVBQVUsR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDNUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QixNQUFNLFlBQVksR0FBRztnQkFDakIsV0FBVyxFQUFFO29CQUNULFdBQVcsRUFBRSxVQUFVLENBQUMsV0FBVztvQkFDbkMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO2lCQUN2QztnQkFDRCxLQUFLLEVBQUUsUUFBUTtnQkFDZixJQUFJLEVBQUUsT0FBTzthQUNoQixDQUFDO1lBQ0YsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQUE7Q0FDSjtBQTlGRCw2QkE4RkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFdhbGxldHMgfSBmcm9tICdmYWJyaWMtbmV0d29yayc7XG5pbXBvcnQgRmFicmljQ0FTZXJ2aWNlcyBmcm9tICdmYWJyaWMtY2EtY2xpZW50JztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4vbG9nJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElkZW50aXRpZXMge1xuICAgIHByaXZhdGUgd2FsbGV0cGF0aDogc3RyaW5nO1xuICAgIHByaXZhdGUgcHJvZmlsZTogYW55O1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHdhbGxldHBhdGg6IHN0cmluZywgcHJvZmlsZT86IGFueSkge1xuICAgICAgICB0aGlzLndhbGxldHBhdGggPSB3YWxsZXRwYXRoO1xuICAgICAgICB0aGlzLnByb2ZpbGUgPSBwcm9maWxlO1xuICAgIH1cblxuICAgIGFzeW5jIGxpc3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSBwYXRoLnJlc29sdmUodGhpcy53YWxsZXRwYXRoKTtcbiAgICAgICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgV2FsbGV0cy5uZXdGaWxlU3lzdGVtV2FsbGV0KHdhbGxldFBhdGgpO1xuICAgICAgICAoYXdhaXQgd2FsbGV0Lmxpc3QoKSkuZm9yRWFjaCgoczogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBsb2coeyB2YWw6IGAke3N9YCB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgaW1wb3J0VG9XYWxsZXQoanNvbklkZW50aXR5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IGZpbGUgc3lzdGVtIGJhc2VkIHdhbGxldCBmb3IgbWFuYWdpbmcgaWRlbnRpdGllcy5cbiAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHBhdGgucmVzb2x2ZSh0aGlzLndhbGxldHBhdGgpO1xuICAgICAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBXYWxsZXRzLm5ld0ZpbGVTeXN0ZW1XYWxsZXQod2FsbGV0UGF0aCk7XG5cbiAgICAgICAgY29uc3QgaWQgPSBKU09OLnBhcnNlKGpzb25JZGVudGl0eSk7XG5cbiAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlJ3ZlIGFscmVhZHkgZ290IHRoZSB1c2VyLlxuICAgICAgICBjb25zdCB1c2VySWRlbnRpdHkgPSBhd2FpdCB3YWxsZXQuZ2V0KGlkLm5hbWUpO1xuICAgICAgICBpZiAodXNlcklkZW50aXR5KSB7XG4gICAgICAgICAgICBsb2coeyBtc2c6IGBBbiBpZGVudGl0eSBmb3IgdGhlIHVzZXIgXCIke2lkLm5hbWV9XCIgYWxyZWFkeSBleGlzdHMgaW4gdGhlIHdhbGxldGAsIGVycm9yOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2VydGlmaWNhdGUgPSBCdWZmZXIuZnJvbShpZC5jZXJ0LCAnYmFzZTY0JykudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgcHJpdmF0ZUtleSA9IEJ1ZmZlci5mcm9tKGlkLnByaXZhdGVfa2V5LCAnYmFzZTY0JykudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgaWRlbnRpdHkgPSB7XG4gICAgICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgICAgICAgIGNlcnRpZmljYXRlLFxuICAgICAgICAgICAgICAgIHByaXZhdGVLZXksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbXNwSWQ6IGlkLm1zcF9pZCxcbiAgICAgICAgICAgIHR5cGU6ICdYLjUwOScsXG4gICAgICAgIH07XG5cbiAgICAgICAgYXdhaXQgd2FsbGV0LnB1dChpZC5uYW1lLCBpZGVudGl0eSk7XG5cbiAgICAgICAgbG9nKHsgbXNnOiBgQWRkZWQgaWRlbnRpdHkgdW5kZXIgbGFiZWwgJHtpZC5uYW1lfSB0byB0aGUgd2FsbGV0IGF0ICR7d2FsbGV0UGF0aH1gIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGVucm9sbChuYW1lOiBzdHJpbmcsIGVucm9sbGlkOiBzdHJpbmcsIGVucm9sbHB3ZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBmaWxlIHN5c3RlbSBiYXNlZCB3YWxsZXQgZm9yIG1hbmFnaW5nIGlkZW50aXRpZXMuXG4gICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSBwYXRoLnJlc29sdmUodGhpcy53YWxsZXRwYXRoKTtcbiAgICAgICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgV2FsbGV0cy5uZXdGaWxlU3lzdGVtV2FsbGV0KHdhbGxldFBhdGgpO1xuXG4gICAgICAgIC8vIGdldCB0aGUgZ2F0ZXdheSBwcm9maWxlXG5cbiAgICAgICAgY29uc3Qgb3JnTmFtZSA9IHRoaXMucHJvZmlsZS5jbGllbnQub3JnYW5pemF0aW9uO1xuICAgICAgICBjb25zb2xlLmxvZyhgVXNpbmcgdGhlIG9yZ2FuaXphdGlvbiA6ICR7b3JnTmFtZX1gKTtcblxuICAgICAgICBjb25zdCBvcmdtc3BpZCA9IHRoaXMucHJvZmlsZS5vcmdhbml6YXRpb25zW29yZ05hbWVdLm1zcGlkO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBDQSBjbGllbnQgZm9yIGludGVyYWN0aW5nIHdpdGggdGhlIENBLlxuICAgICAgICBjb25zdCBjYXMgPSB0aGlzLnByb2ZpbGUub3JnYW5pemF0aW9uc1tvcmdOYW1lXS5jZXJ0aWZpY2F0ZUF1dGhvcml0aWVzO1xuXG4gICAgICAgIGxldCBjYW5hbWU7XG4gICAgICAgIGlmIChjYXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIENBcyBsaXN0ZWQgaW4gZ2F0ZXdheScpO1xuICAgICAgICB9IGVsc2UgaWYgKGNhcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIGNhbmFtZSA9IGNhc1swXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYUluZm8gPSB0aGlzLnByb2ZpbGUuY2VydGlmaWNhdGVBdXRob3JpdGllc1tjYW5hbWVdO1xuXG4gICAgICAgIGNvbnN0IGNhVExTQ0FDZXJ0cyA9IGNhSW5mby50bHNDQUNlcnRzLnBlbTtcbiAgICAgICAgY29uc29sZS5sb2coJ0NyZWFnaW5nIG5ldyBGYWJyaWNDQVNlcnZpY2VzJyk7XG4gICAgICAgIGNvbnN0IGNhID0gbmV3IEZhYnJpY0NBU2VydmljZXMoY2FJbmZvLnVybCwgeyB0cnVzdGVkUm9vdHM6IGNhVExTQ0FDZXJ0cywgdmVyaWZ5OiBmYWxzZSB9LCBjYUluZm8uY2FOYW1lKTtcbiAgICAgICAgY29uc29sZS5sb2coJ2NyZWF0ZWQgc2VydmljZXMnKTtcbiAgICAgICAgY29uc3QgdXNlckV4aXN0cyA9IGF3YWl0IHdhbGxldC5nZXQobmFtZSk7XG4gICAgICAgIGlmICh1c2VyRXhpc3RzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQW4gaWRlbnRpdHkgZm9yIHRoZSBjbGllbnQgdXNlciAke25hbWV9IGFscmVhZHkgZXhpc3RzIGluIHRoZSB3YWxsZXRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVucm9sbCB0aGUgYWRtaW4gdXNlciwgYW5kIGltcG9ydCB0aGUgbmV3IGlkZW50aXR5IGludG8gdGhlIHdhbGxldC5cbiAgICAgICAgY29uc29sZS5sb2coYGNhbGxpbmcgZW5yb2xsICR7ZW5yb2xsaWR9ICAke2Vucm9sbHB3ZH1gKTtcbiAgICAgICAgY29uc3QgZW5yb2xsbWVudCA9IGF3YWl0IGNhLmVucm9sbCh7IGVucm9sbG1lbnRJRDogZW5yb2xsaWQsIGVucm9sbG1lbnRTZWNyZXQ6IGVucm9sbHB3ZCB9KTtcbiAgICAgICAgY29uc29sZS5sb2coJ2Vycm9ybGVkJyk7XG4gICAgICAgIGNvbnN0IHg1MDlJZGVudGl0eSA9IHtcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgICAgICAgY2VydGlmaWNhdGU6IGVucm9sbG1lbnQuY2VydGlmaWNhdGUsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZUtleTogZW5yb2xsbWVudC5rZXkudG9CeXRlcygpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1zcElkOiBvcmdtc3BpZCxcbiAgICAgICAgICAgIHR5cGU6ICdYLjUwOScsXG4gICAgICAgIH07XG4gICAgICAgIGF3YWl0IHdhbGxldC5wdXQobmFtZSwgeDUwOUlkZW50aXR5KTtcbiAgICB9XG59XG4iXX0=