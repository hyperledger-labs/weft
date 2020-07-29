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
                dockerCmd.push(`docker exec -t microfab cat /opt/microfab/data/peer-${id.wallet.toLowerCase()}/msp/cacerts/ca.pem > ${capem}`);
                dockerCmd.push(`docker exec -t microfab cat /opt/microfab/data/peer-${id.wallet.toLowerCase()}/msp/config.yaml > ${cfgpath}`);
            }));
            log_1.log({ msg: 'Environment variables' });
            console.log(envvars);
            log_1.log({ msg: 'Docker commands to get the final file parts' });
            console.log(dockerCmd);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWljcm9mYWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWljcm9mYWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTZCO0FBQzdCLDJCQUE2RDtBQUM3RCwrQ0FBaUM7QUFDakMsMEVBQXlDO0FBQ3pDLDBEQUFvQztBQUVwQywrQkFBNEI7QUFDNUIsTUFBcUIsaUJBQWlCO0lBQ3JCLE9BQU8sQ0FDaEIsVUFBa0IsRUFDbEIsV0FBbUIsRUFDbkIsVUFBa0IsRUFDbEIsVUFBa0I7O1lBR2xCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNoQixJQUFJLFVBQVUsS0FBSyxHQUFHLEVBQUU7Z0JBQ3BCLE1BQU0sR0FBRyxpQkFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3ZDO2lCQUFNO2dCQUNILE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxlQUFVLENBQUMsY0FBYyxDQUFDLEVBQUU7b0JBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLGNBQWMsRUFBRSxDQUFDLENBQUM7aUJBQzFFO2dCQUNELE1BQU0sR0FBRyxpQkFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3BEO1lBTUQsTUFBTSxPQUFPLEdBQVksRUFBRSxDQUFDO1lBRTVCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFHbEMsTUFBTTtpQkFDRCxNQUFNLENBQUMsQ0FBQyxDQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQztpQkFDckQsT0FBTyxDQUNKLENBQUMsT0FJQSxFQUFFLEVBQUU7Z0JBQ0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFX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Q0FBQyxDQUFDO2FBQ2hDO1FBQ0wsQ0FBQztLQUFBO0NBeUJKO0FBaElELG9DQWdJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMsIGV4aXN0c1N5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCBzYW5pdGl6ZSBmcm9tICdzYW5pdGl6ZS1maWxlbmFtZSc7XG5pbXBvcnQgSWRlbnRpdGllcyBmcm9tICcuL2lkZW50aWVzJztcbnR5cGUgY2FsbGJhY2tGbiA9ICh2OiBhbnkpID0+IHZvaWQ7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuL2xvZyc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaWNyb2ZhYlByb2Nlc3NvciB7XG4gICAgcHVibGljIGFzeW5jIHByb2Nlc3MoXG4gICAgICAgIGNvbmZpZ0ZpbGU6IHN0cmluZyxcbiAgICAgICAgZ2F0ZXdheXBhdGg6IHN0cmluZyxcbiAgICAgICAgd2FsbGV0cGF0aDogc3RyaW5nLFxuICAgICAgICBjcnlwdG9wYXRoOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vIEpTT04gY29uZmlndXJhdGlvbiBlaXRoZXIgZnJvbSBzdGRpbiBvciBmaWxlbmFtZVxuICAgICAgICBsZXQgY2ZnU3RyID0gJyc7XG4gICAgICAgIGlmIChjb25maWdGaWxlID09PSAnLScpIHtcbiAgICAgICAgICAgIGNmZ1N0ciA9IHJlYWRGaWxlU3luYygwKS50b1N0cmluZygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbWljcm9mYWJDb25maWcgPSBwYXRoLnJlc29sdmUoY29uZmlnRmlsZSk7XG4gICAgICAgICAgICBpZiAoIWV4aXN0c1N5bmMobWljcm9mYWJDb25maWcpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNaWNyb2ZhYiBjb25maWcganNvbiBub3QgZm91bmQgYXQgJHttaWNyb2ZhYkNvbmZpZ31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNmZ1N0ciA9IHJlYWRGaWxlU3luYyhtaWNyb2ZhYkNvbmZpZykudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGludGVyZmFjZSBFbnZWYXJzIHtcbiAgICAgICAgICAgIFtvcmc6IHN0cmluZ106IHN0cmluZ1tdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW52dmFyczogRW52VmFycyA9IHt9O1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoY2ZnU3RyKTtcblxuICAgICAgICAvLyBsb2NhdGUgdGhlIGdhdGV3YXlzIGluIHRoZSBmaWxlLCBhbmQgY3JlYXRlIHRoZSBjb25uZWN0aW9uIHByb2ZpbGVcbiAgICAgICAgY29uZmlnXG4gICAgICAgICAgICAuZmlsdGVyKChjOiB7IHR5cGU6IHN0cmluZyB9KSA9PiBjLnR5cGUgPT09ICdnYXRld2F5JylcbiAgICAgICAgICAgIC5mb3JFYWNoKFxuICAgICAgICAgICAgICAgIChnYXRld2F5OiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIGNsaWVudDogeyBvcmdhbml6YXRpb246IHN0cmluZyB9O1xuICAgICAgICAgICAgICAgICAgICBvcmdhbml6YXRpb25zOiB7IFtuYW1lOiBzdHJpbmddOiB7IG1zcGlkOiBzdHJpbmc7IHBlZXJzOiBzdHJpbmcgfSB9O1xuICAgICAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvZmlsZVBhdGggPSBwYXRoLnJlc29sdmUoZ2F0ZXdheXBhdGgsIGAke3Nhbml0aXplKGdhdGV3YXkuaWQpfS5qc29uYCk7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMocHJvZmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGdhdGV3YXkpKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcmcgPSBnYXRld2F5LmNsaWVudC5vcmdhbml6YXRpb247XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGUgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBlLnB1c2goYGV4cG9ydCBDT1JFX1BFRVJfTE9DQUxNU1BJRD0ke2dhdGV3YXkub3JnYW5pemF0aW9uc1tvcmddLm1zcGlkfWApO1xuICAgICAgICAgICAgICAgICAgICBlLnB1c2goYGV4cG9ydCBDT1JFX1BFRVJfQUREUkVTUz0ke2dhdGV3YXkub3JnYW5pemF0aW9uc1tvcmddLnBlZXJzWzBdfWApO1xuICAgICAgICAgICAgICAgICAgICBlbnZ2YXJzW29yZyBhcyBzdHJpbmddID0gZTtcblxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGdhdGV3YXkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGRvY2tlckNtZDogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgLy8gbG9jYXRlIHRoZSBpZGVudGl0aWVzXG4gICAgICAgIGF3YWl0IHRoaXMuYXN5bmNGb3JFYWNoKFxuICAgICAgICAgICAgY29uZmlnLmZpbHRlcigoYzogeyB0eXBlOiBzdHJpbmcgfSkgPT4gYy50eXBlID09PSAnaWRlbnRpdHknKSxcbiAgICAgICAgICAgIGFzeW5jIChpZDogeyB3YWxsZXQ6IGFueTsgbmFtZTogYW55OyBpZDogYW55OyBwcml2YXRlX2tleTogc3RyaW5nOyBjZXJ0OiBzdHJpbmcgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxXYWxsZXRQYXRoID0gcGF0aC5yZXNvbHZlKHdhbGxldHBhdGgsIHNhbml0aXplKGlkLndhbGxldCkpO1xuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKGZ1bGxXYWxsZXRQYXRoKTtcbiAgICAgICAgICAgICAgICBpZC5uYW1lID0gaWQuaWQ7XG4gICAgICAgICAgICAgICAgLy8gdXNlIGltcG9ydCB0byB3YWxsZXQgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICBjb25zdCBpZHMgPSBuZXcgSWRlbnRpdGllcyhmdWxsV2FsbGV0UGF0aCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgaWRzLmltcG9ydFRvV2FsbGV0KEpTT04uc3RyaW5naWZ5KGlkKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIG1zcCBjcnl0byBkaXIgc3RydWN0dXJlIGZvciB0aGUgcGVlciBjb21tYW5kc1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyeXB0b3Jvb3QgPSBwYXRoLnJlc29sdmUoY3J5cHRvcGF0aCwgc2FuaXRpemUoaWQud2FsbGV0KSwgc2FuaXRpemUoaWQuaWQpKTtcbiAgICAgICAgICAgICAgICAvLyBub3cgZm9yIHRoZSBtc3Agc3R1ZmZcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcpKTtcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdjYWNlcnRzJykpO1xuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2tleXN0b3JlJykpO1xuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ3NpZ25jZXJ0cycpKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBCdWZmZXIuZnJvbShpZC5wcml2YXRlX2tleSwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGVtZmlsZSA9IEJ1ZmZlci5mcm9tKGlkLmNlcnQsICdiYXNlNjQnKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnc2lnbmNlcnRzJywgYCR7aWQuaWR9LnBlbWApLCBwZW1maWxlKTtcbiAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2tleXN0b3JlJywgYGNlcnRfc2tgKSwgcHJpdmF0ZUtleSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjYXBlbSA9IHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2NhY2VydHMnLCAnY2EucGVtJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2ZncGF0aCA9IHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2NvbmZpZy55YW1sJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhpZCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZW52dmFyc1tpZC53YWxsZXRdKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudnZhcnNbaWQud2FsbGV0XS5wdXNoKGBleHBvcnQgQ09SRV9QRUVSX01TUENPTkZJR1BBVEg9JHtwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcpfWApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRvY2tlckNtZC5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBgZG9ja2VyIGV4ZWMgLXQgbWljcm9mYWIgY2F0IC9vcHQvbWljcm9mYWIvZGF0YS9wZWVyLSR7aWQud2FsbGV0LnRvTG93ZXJDYXNlKCl9L21zcC9jYWNlcnRzL2NhLnBlbSA+ICR7Y2FwZW19YCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGRvY2tlckNtZC5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBgZG9ja2VyIGV4ZWMgLXQgbWljcm9mYWIgY2F0IC9vcHQvbWljcm9mYWIvZGF0YS9wZWVyLSR7aWQud2FsbGV0LnRvTG93ZXJDYXNlKCl9L21zcC9jb25maWcueWFtbCA+ICR7Y2ZncGF0aH1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgICAgICBsb2coeyBtc2c6ICdFbnZpcm9ubWVudCB2YXJpYWJsZXMnIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhlbnZ2YXJzKTtcbiAgICAgICAgbG9nKHsgbXNnOiAnRG9ja2VyIGNvbW1hbmRzIHRvIGdldCB0aGUgZmluYWwgZmlsZSBwYXJ0cycgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGRvY2tlckNtZCk7XG4gICAgICAgIC8vYXdhaXQgd3JpdGVFbnZWYXIoYXJndik7XG4gICAgfVxuXG4gICAgYXN5bmMgYXN5bmNGb3JFYWNoKGFycmF5OiBhbnksIGNhbGxiYWNrOiBjYWxsYmFja0ZuKSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcnJheS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGF3YWl0IGNhbGxiYWNrKGFycmF5W2luZGV4XSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gYXN5bmMgd3JpdGVFbnZWYXIoYXJndikge1xuICAgIC8vICAgICBjb25zdCBjbWRzID0gYFxuICAgIC8vIGV4cG9ydCBDT1JFX1BFRVJfQUREUkVTUz1cImxvY2FsaG9zdDoxODA1MVwiXG5cbiAgICAvLyAjIElkZW50aWZpdHkgb2YgdGhlIE9yZ2FuaXphdGlvblxuICAgIC8vIGV4cG9ydCBDT1JFX1BFRVJfTE9DQUxNU1BJRD1cIiR7YXJndi5vcmd9XCJcblxuICAgIC8vICMgTG9jYXRpb24gb2YgdGhlIHdhbGxldCBmb3IgdGhlIHVzZXIgdG8gYmUgdXNlZFxuICAgIC8vIGV4cG9ydCBDT1JFX1BFRVJfTVNQQ09ORklHUEFUSD1cIiR7cmVwb19yb290fS8ke2FyZ3Yub3JnfS8ke2FyZ3YudXNlcn1cIlxuXG4gICAgLy8gIyBJZiB0bHMgaXMgZW5hYmxlZCBmb3IgdGhlIG5ldHdvcmsgY29tbXVuY2F0aW9ucywgYW5kIG5vdGUgdGhlIHJvb3QgY2VydGlmaWNhdGUsIGFuZCB0aGUgT3JkZXJlcidzIFRMUyBjZXJ0XG4gICAgLy8gZXhwb3J0IENPUkVfUEVFUl9UTFNfRU5BQkxFRD1cInRydWVcIlxuICAgIC8vIGV4cG9ydCBDT1JFX1BFRVJfVExTX1JPT1RDRVJUX0ZJTEU9XCIke3JlcG9fcm9vdH0vJHthcmd2Lm9yZ30vdGxzLXJvb3QucGVtXCJcbiAgICAvLyBleHBvcnQgT1JERVJFUl9UTFNfQ0VSVD0ke3JlcG9fcm9vdH0vT3JkZXJlci9jYS10bHMtcm9vdC5wZW1cblxuICAgIC8vICMgV2lsbCBuZWVkIHRoZSBUTFMgZm9yIGVhY2ggUGVlclxuICAgIC8vIGV4cG9ydCBBTVBSRVRJQV9QRUVSX1RMUz0ke3JlcG9fcm9vdH0vJHthcmd2Lm9yZ30vYW1wcmV0aWFwZWVyMXRscy9jYS5jcnRcblxuICAgIC8vICMgTmVlZCB0aGUgY29uZmlndXJhdGlvbiBkaXJlY3RvcnksIHRob3VnaCBubyBjbGVhciB3aGF0IGlzIGFjdHVhbGx5IG5lZWRlZCBmcm9tIGl0XG4gICAgLy8gZXhwb3J0IEZBQlJJQ19DRkdfUEFUSD0vdXNyL2xvY2FsL2NvbmZpZy9cbiAgICAvLyBgO1xuXG4gICAgLy8gICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKGVudnBhdGgsICdlbnZ2YXIuc2gnKSwgY21kcyk7XG4gICAgLy8gfVxufVxuIl19