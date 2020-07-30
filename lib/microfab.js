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
const fs_1 = require("fs");
const mkdirp = __importStar(require("mkdirp"));
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const identies_1 = __importDefault(require("./identies"));
const log_1 = require("./log");
const shell_1 = require("./shell");
class MicrofabProcessor {
    process(configFile, gatewaypath, walletpath, cryptopath) {
        return __awaiter(this, void 0, void 0, function* () {
            let cfgStr = '';
            if (configFile === '-') {
                cfgStr = fs_1.readFileSync(0).toString();
            }
            else {
                const microfabConfig = path.resolve(configFile);
                if (!fs_1.existsSync(microfabConfig)) {
                    throw new Error(`Microfab config json not found at ${microfabConfig}`);
                }
                cfgStr = fs_1.readFileSync(microfabConfig).toString();
            }
            const envvars = {};
            const config = JSON.parse(cfgStr);
            config
                .filter((c) => c.type === 'gateway')
                .forEach((gateway) => {
                const profilePath = path.resolve(gatewaypath, `${sanitize_filename_1.default(gateway.id)}.json`);
                fs_1.writeFileSync(profilePath, JSON.stringify(gateway));
                const org = gateway.client.organization;
                const e = [];
                e.push(`export CORE_PEER_LOCALMSPID=${gateway.organizations[org].mspid}`);
                e.push(`export CORE_PEER_ADDRESS=${gateway.organizations[org].peers[0]}`);
                envvars[org] = e;
            });
            const dockerCmd = [];
            yield this.asyncForEach(config.filter((c) => c.type === 'identity'), (id) => __awaiter(this, void 0, void 0, function* () {
                const fullWalletPath = path.resolve(walletpath, sanitize_filename_1.default(id.wallet));
                mkdirp.sync(fullWalletPath);
                id.name = id.id;
                const ids = new identies_1.default(fullWalletPath);
                yield ids.importToWallet(JSON.stringify(id));
                const cryptoroot = path.resolve(cryptopath, sanitize_filename_1.default(id.wallet), sanitize_filename_1.default(id.id));
                mkdirp.sync(path.join(cryptoroot, 'msp'));
                mkdirp.sync(path.join(cryptoroot, 'msp', 'cacerts'));
                mkdirp.sync(path.join(cryptoroot, 'msp', 'keystore'));
                mkdirp.sync(path.join(cryptoroot, 'msp', 'signcerts'));
                const privateKey = Buffer.from(id.private_key, 'base64').toString();
                const pemfile = Buffer.from(id.cert, 'base64').toString();
                fs_1.writeFileSync(path.join(cryptoroot, 'msp', 'signcerts', `${id.id}.pem`), pemfile);
                fs_1.writeFileSync(path.join(cryptoroot, 'msp', 'keystore', `cert_sk`), privateKey);
                const capem = path.join(cryptoroot, 'msp', 'cacerts', 'ca.pem');
                const cfgpath = path.join(cryptoroot, 'msp', 'config.yaml');
                if (envvars[id.wallet]) {
                    envvars[id.wallet].push(`export CORE_PEER_MSPCONFIGPATH=${path.join(cryptoroot, 'msp')}`);
                }
                if (id.wallet.toLowerCase() !== 'orderer') {
                    dockerCmd.push(`docker exec -t microfab cat /opt/microfab/data/peer-${id.wallet.toLowerCase()}/msp/cacerts/ca.pem > ${capem}`);
                    dockerCmd.push(`docker exec -t microfab cat /opt/microfab/data/peer-${id.wallet.toLowerCase()}/msp/config.yaml > ${cfgpath}`);
                }
            }));
            log_1.log({ msg: 'Running Docker commands to get the final file parts' });
            const responses = yield shell_1.shellcmds(dockerCmd);
            log_1.log({ msg: responses.join() });
            log_1.log({ msg: '\nEnvironment variables:' });
            for (const org in envvars) {
                log_1.log({ msg: org });
                const value = envvars[org];
                log_1.log({ val: value.join('\n') });
            }
        });
    }
    asyncForEach(array, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let index = 0; index < array.length; index++) {
                yield callback(array[index]);
            }
        });
    }
}
exports.default = MicrofabProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWljcm9mYWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWljcm9mYWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTZCO0FBQzdCLDJCQUE2RDtBQUM3RCwrQ0FBaUM7QUFDakMsMEVBQXlDO0FBQ3pDLDBEQUFvQztBQUdwQywrQkFBNEI7QUFFNUIsbUNBQW9DO0FBRXBDLE1BQXFCLGlCQUFpQjtJQUNyQixPQUFPLENBQ2hCLFVBQWtCLEVBQ2xCLFdBQW1CLEVBQ25CLFVBQWtCLEVBQ2xCLFVBQWtCOztZQUdsQixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDaEIsSUFBSSxVQUFVLEtBQUssR0FBRyxFQUFFO2dCQUNwQixNQUFNLEdBQUcsaUJBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUN2QztpQkFBTTtnQkFDSCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLENBQUMsZUFBVSxDQUFDLGNBQWMsQ0FBQyxFQUFFO29CQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2lCQUMxRTtnQkFDRCxNQUFNLEdBQUcsaUJBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNwRDtZQU1ELE1BQU0sT0FBTyxHQUFZLEVBQUUsQ0FBQztZQUU1QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBR2xDLE1BQU07aUJBQ0QsTUFBTSxDQUFDLENBQUMsQ0FBbUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7aUJBQ3JELE9BQU8sQ0FDSixDQUFDLE9BSUEsRUFBRSxFQUFFO2dCQUNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxP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QUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDbEIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMzQixTQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDbEM7UUFDTCxDQUFDO0tBQUE7SUFFSyxZQUFZLENBQUMsS0FBVSxFQUFFLFFBQW9COztZQUMvQyxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDL0MsTUFBTSxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDaEM7UUFDTCxDQUFDO0tBQUE7Q0FDSjtBQWpIRCxvQ0FpSEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCBleGlzdHNTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5pbXBvcnQgc2FuaXRpemUgZnJvbSAnc2FuaXRpemUtZmlsZW5hbWUnO1xuaW1wb3J0IElkZW50aXRpZXMgZnJvbSAnLi9pZGVudGllcyc7XG5cbnR5cGUgY2FsbGJhY2tGbiA9ICh2OiBhbnkpID0+IHZvaWQ7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuL2xvZyc7XG5cbmltcG9ydCB7IHNoZWxsY21kcyB9IGZyb20gJy4vc2hlbGwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaWNyb2ZhYlByb2Nlc3NvciB7XG4gICAgcHVibGljIGFzeW5jIHByb2Nlc3MoXG4gICAgICAgIGNvbmZpZ0ZpbGU6IHN0cmluZyxcbiAgICAgICAgZ2F0ZXdheXBhdGg6IHN0cmluZyxcbiAgICAgICAgd2FsbGV0cGF0aDogc3RyaW5nLFxuICAgICAgICBjcnlwdG9wYXRoOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vIEpTT04gY29uZmlndXJhdGlvbiBlaXRoZXIgZnJvbSBzdGRpbiBvciBmaWxlbmFtZVxuICAgICAgICBsZXQgY2ZnU3RyID0gJyc7XG4gICAgICAgIGlmIChjb25maWdGaWxlID09PSAnLScpIHtcbiAgICAgICAgICAgIGNmZ1N0ciA9IHJlYWRGaWxlU3luYygwKS50b1N0cmluZygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbWljcm9mYWJDb25maWcgPSBwYXRoLnJlc29sdmUoY29uZmlnRmlsZSk7XG4gICAgICAgICAgICBpZiAoIWV4aXN0c1N5bmMobWljcm9mYWJDb25maWcpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNaWNyb2ZhYiBjb25maWcganNvbiBub3QgZm91bmQgYXQgJHttaWNyb2ZhYkNvbmZpZ31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNmZ1N0ciA9IHJlYWRGaWxlU3luYyhtaWNyb2ZhYkNvbmZpZykudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGludGVyZmFjZSBFbnZWYXJzIHtcbiAgICAgICAgICAgIFtvcmc6IHN0cmluZ106IHN0cmluZ1tdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW52dmFyczogRW52VmFycyA9IHt9O1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoY2ZnU3RyKTtcblxuICAgICAgICAvLyBsb2NhdGUgdGhlIGdhdGV3YXlzIGluIHRoZSBmaWxlLCBhbmQgY3JlYXRlIHRoZSBjb25uZWN0aW9uIHByb2ZpbGVcbiAgICAgICAgY29uZmlnXG4gICAgICAgICAgICAuZmlsdGVyKChjOiB7IHR5cGU6IHN0cmluZyB9KSA9PiBjLnR5cGUgPT09ICdnYXRld2F5JylcbiAgICAgICAgICAgIC5mb3JFYWNoKFxuICAgICAgICAgICAgICAgIChnYXRld2F5OiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIGNsaWVudDogeyBvcmdhbml6YXRpb246IHN0cmluZyB9O1xuICAgICAgICAgICAgICAgICAgICBvcmdhbml6YXRpb25zOiB7IFtuYW1lOiBzdHJpbmddOiB7IG1zcGlkOiBzdHJpbmc7IHBlZXJzOiBzdHJpbmcgfSB9O1xuICAgICAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvZmlsZVBhdGggPSBwYXRoLnJlc29sdmUoZ2F0ZXdheXBhdGgsIGAke3Nhbml0aXplKGdhdGV3YXkuaWQpfS5qc29uYCk7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMocHJvZmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGdhdGV3YXkpKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcmcgPSBnYXRld2F5LmNsaWVudC5vcmdhbml6YXRpb247XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGUgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBlLnB1c2goYGV4cG9ydCBDT1JFX1BFRVJfTE9DQUxNU1BJRD0ke2dhdGV3YXkub3JnYW5pemF0aW9uc1tvcmddLm1zcGlkfWApO1xuICAgICAgICAgICAgICAgICAgICBlLnB1c2goYGV4cG9ydCBDT1JFX1BFRVJfQUREUkVTUz0ke2dhdGV3YXkub3JnYW5pemF0aW9uc1tvcmddLnBlZXJzWzBdfWApO1xuICAgICAgICAgICAgICAgICAgICBlbnZ2YXJzW29yZyBhcyBzdHJpbmddID0gZTtcblxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGdhdGV3YXkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGRvY2tlckNtZDogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgLy8gbG9jYXRlIHRoZSBpZGVudGl0aWVzXG4gICAgICAgIGF3YWl0IHRoaXMuYXN5bmNGb3JFYWNoKFxuICAgICAgICAgICAgY29uZmlnLmZpbHRlcigoYzogeyB0eXBlOiBzdHJpbmcgfSkgPT4gYy50eXBlID09PSAnaWRlbnRpdHknKSxcbiAgICAgICAgICAgIGFzeW5jIChpZDogeyB3YWxsZXQ6IGFueTsgbmFtZTogYW55OyBpZDogYW55OyBwcml2YXRlX2tleTogc3RyaW5nOyBjZXJ0OiBzdHJpbmcgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxXYWxsZXRQYXRoID0gcGF0aC5yZXNvbHZlKHdhbGxldHBhdGgsIHNhbml0aXplKGlkLndhbGxldCkpO1xuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKGZ1bGxXYWxsZXRQYXRoKTtcbiAgICAgICAgICAgICAgICBpZC5uYW1lID0gaWQuaWQ7XG4gICAgICAgICAgICAgICAgLy8gdXNlIGltcG9ydCB0byB3YWxsZXQgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICBjb25zdCBpZHMgPSBuZXcgSWRlbnRpdGllcyhmdWxsV2FsbGV0UGF0aCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgaWRzLmltcG9ydFRvV2FsbGV0KEpTT04uc3RyaW5naWZ5KGlkKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIG1zcCBjcnl0byBkaXIgc3RydWN0dXJlIGZvciB0aGUgcGVlciBjb21tYW5kc1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyeXB0b3Jvb3QgPSBwYXRoLnJlc29sdmUoY3J5cHRvcGF0aCwgc2FuaXRpemUoaWQud2FsbGV0KSwgc2FuaXRpemUoaWQuaWQpKTtcbiAgICAgICAgICAgICAgICAvLyBub3cgZm9yIHRoZSBtc3Agc3R1ZmZcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcpKTtcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdjYWNlcnRzJykpO1xuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2tleXN0b3JlJykpO1xuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ3NpZ25jZXJ0cycpKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBCdWZmZXIuZnJvbShpZC5wcml2YXRlX2tleSwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGVtZmlsZSA9IEJ1ZmZlci5mcm9tKGlkLmNlcnQsICdiYXNlNjQnKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnc2lnbmNlcnRzJywgYCR7aWQuaWR9LnBlbWApLCBwZW1maWxlKTtcbiAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2tleXN0b3JlJywgYGNlcnRfc2tgKSwgcHJpdmF0ZUtleSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjYXBlbSA9IHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2NhY2VydHMnLCAnY2EucGVtJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2ZncGF0aCA9IHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2NvbmZpZy55YW1sJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhpZCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZW52dmFyc1tpZC53YWxsZXRdKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudnZhcnNbaWQud2FsbGV0XS5wdXNoKGBleHBvcnQgQ09SRV9QRUVSX01TUENPTkZJR1BBVEg9JHtwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcpfWApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdGhlIG9yZGVyZXJcbiAgICAgICAgICAgICAgICBpZiAoaWQud2FsbGV0LnRvTG93ZXJDYXNlKCkgIT09ICdvcmRlcmVyJykge1xuICAgICAgICAgICAgICAgICAgICBkb2NrZXJDbWQucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIGBkb2NrZXIgZXhlYyAtdCBtaWNyb2ZhYiBjYXQgL29wdC9taWNyb2ZhYi9kYXRhL3BlZXItJHtpZC53YWxsZXQudG9Mb3dlckNhc2UoKX0vbXNwL2NhY2VydHMvY2EucGVtID4gJHtjYXBlbX1gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBkb2NrZXJDbWQucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIGBkb2NrZXIgZXhlYyAtdCBtaWNyb2ZhYiBjYXQgL29wdC9taWNyb2ZhYi9kYXRhL3BlZXItJHtpZC53YWxsZXQudG9Mb3dlckNhc2UoKX0vbXNwL2NvbmZpZy55YW1sID4gJHtjZmdwYXRofWAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICBsb2coeyBtc2c6ICdSdW5uaW5nIERvY2tlciBjb21tYW5kcyB0byBnZXQgdGhlIGZpbmFsIGZpbGUgcGFydHMnIH0pO1xuICAgICAgICBjb25zdCByZXNwb25zZXMgPSBhd2FpdCBzaGVsbGNtZHMoZG9ja2VyQ21kKTtcbiAgICAgICAgbG9nKHsgbXNnOiByZXNwb25zZXMuam9pbigpIH0pO1xuXG4gICAgICAgIGxvZyh7IG1zZzogJ1xcbkVudmlyb25tZW50IHZhcmlhYmxlczonIH0pO1xuICAgICAgICBmb3IgKGNvbnN0IG9yZyBpbiBlbnZ2YXJzKSB7XG4gICAgICAgICAgICBsb2coeyBtc2c6IG9yZyB9KTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZW52dmFyc1tvcmddO1xuICAgICAgICAgICAgbG9nKHsgdmFsOiB2YWx1ZS5qb2luKCdcXG4nKSB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGFzeW5jRm9yRWFjaChhcnJheTogYW55LCBjYWxsYmFjazogY2FsbGJhY2tGbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBhd2FpdCBjYWxsYmFjayhhcnJheVtpbmRleF0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19