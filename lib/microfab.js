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
                log_1.log({ msg: `Gateway profile written to : ${profilePath}` });
                const org = gateway.client.organization;
                envvars[org] = {
                    mspid: gateway.organizations[org].mspid,
                    peers: gateway.organizations[org].peers,
                    ids: {},
                };
            });
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
                mkdirp.sync(path.join(cryptoroot, 'msp', 'admincerts'));
                const privateKey = Buffer.from(id.private_key, 'base64').toString();
                const pemfile = Buffer.from(id.cert, 'base64').toString();
                const capem = Buffer.from(id.ca, 'base64').toString();
                fs_1.writeFileSync(path.join(cryptoroot, 'msp', 'signcerts', `${id.id}.pem`), pemfile);
                fs_1.writeFileSync(path.join(cryptoroot, 'msp', 'admincerts', `${id.id}.pem`), pemfile);
                fs_1.writeFileSync(path.join(cryptoroot, 'msp', 'keystore', `cert_sk`), privateKey);
                fs_1.writeFileSync(path.join(cryptoroot, 'msp', 'cacerts', 'ca.pem'), capem);
                if (envvars[id.wallet]) {
                    envvars[id.wallet].ids[id.id] = path.join(cryptoroot, 'msp');
                }
            }));
            log_1.log({ msg: '\nEnvironment variables:' });
            for (const org in envvars) {
                const value = envvars[org];
                for (const id in value.ids) {
                    log_1.log({ msg: `\nFor ${id} @  ${org} use these:\n` });
                    console.log(`export CORE_PEER_LOCALMSPID=${value.mspid}`);
                    console.log(`export CORE_PEER_MSPCONFIGPATH=${value.ids[id]}`);
                    value.peers.forEach((p) => {
                        console.log(`export CORE_PEER_ADDRESS=${p}`);
                    });
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWljcm9mYWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWljcm9mYWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsMkNBQTZCO0FBQzdCLDJCQUE2RDtBQUM3RCwrQ0FBaUM7QUFDakMsMEVBQXlDO0FBQ3pDLDBEQUFvQztBQUdwQywrQkFBNEI7QUFFNUIsTUFBcUIsaUJBQWlCO0lBQ3JCLE9BQU8sQ0FDaEIsVUFBa0IsRUFDbEIsV0FBbUIsRUFDbkIsVUFBa0IsRUFDbEIsVUFBa0I7O1lBR2xCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNoQixJQUFJLFVBQVUsS0FBSyxHQUFHLEVBQUU7Z0JBQ3BCLE1BQU0sR0FBRyxpQkFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3ZDO2lCQUFNO2dCQUNILE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxlQUFVLENBQUMsY0FBYyxDQUFDLEVBQUU7b0JBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLGNBQWMsRUFBRSxDQUFDLENBQUM7aUJBQzFFO2dCQUNELE1BQU0sR0FBRyxpQkFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3BEO1lBTUQsTUFBTSxPQUFPLEdBQVksRUFBRSxDQUFDO1lBRTVCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFHbEMsTUFBTTtpQkFDRCxNQUFNLENBQUMsQ0FBQyxDQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQztpQkFDckQsT0FBTyxDQUNKLENBQUMsT0FJQSxFQUFFLEVBQUU7Z0JBQ0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFX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LENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDL0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTt3QkFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDakQsQ0FBQyxDQUFDLENBQUM7aUJBRU47YUFDSjtRQUNMLENBQUM7S0FBQTtJQUVLLFlBQVksQ0FBQyxLQUFVLEVBQUUsUUFBb0I7O1lBQy9DLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUMvQyxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNoQztRQUNMLENBQUM7S0FBQTtDQUNKO0FBaEhELG9DQWdIQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMsIGV4aXN0c1N5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCBzYW5pdGl6ZSBmcm9tICdzYW5pdGl6ZS1maWxlbmFtZSc7XG5pbXBvcnQgSWRlbnRpdGllcyBmcm9tICcuL2lkZW50aWVzJztcblxudHlwZSBjYWxsYmFja0ZuID0gKHY6IGFueSkgPT4gdm9pZDtcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4vbG9nJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWljcm9mYWJQcm9jZXNzb3Ige1xuICAgIHB1YmxpYyBhc3luYyBwcm9jZXNzKFxuICAgICAgICBjb25maWdGaWxlOiBzdHJpbmcsXG4gICAgICAgIGdhdGV3YXlwYXRoOiBzdHJpbmcsXG4gICAgICAgIHdhbGxldHBhdGg6IHN0cmluZyxcbiAgICAgICAgY3J5cHRvcGF0aDogc3RyaW5nLFxuICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyBKU09OIGNvbmZpZ3VyYXRpb24gZWl0aGVyIGZyb20gc3RkaW4gb3IgZmlsZW5hbWVcbiAgICAgICAgbGV0IGNmZ1N0ciA9ICcnO1xuICAgICAgICBpZiAoY29uZmlnRmlsZSA9PT0gJy0nKSB7XG4gICAgICAgICAgICBjZmdTdHIgPSByZWFkRmlsZVN5bmMoMCkudG9TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG1pY3JvZmFiQ29uZmlnID0gcGF0aC5yZXNvbHZlKGNvbmZpZ0ZpbGUpO1xuICAgICAgICAgICAgaWYgKCFleGlzdHNTeW5jKG1pY3JvZmFiQ29uZmlnKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTWljcm9mYWIgY29uZmlnIGpzb24gbm90IGZvdW5kIGF0ICR7bWljcm9mYWJDb25maWd9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjZmdTdHIgPSByZWFkRmlsZVN5bmMobWljcm9mYWJDb25maWcpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpbnRlcmZhY2UgRW52VmFycyB7XG4gICAgICAgICAgICBbb3JnOiBzdHJpbmddOiB7IG1zcGlkOiBzdHJpbmc7IHBlZXJzOiBzdHJpbmdbXTsgaWRzOiB7IFtpZDogc3RyaW5nXTogc3RyaW5nIH0gfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVudnZhcnM6IEVudlZhcnMgPSB7fTtcblxuICAgICAgICBjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKGNmZ1N0cik7XG5cbiAgICAgICAgLy8gbG9jYXRlIHRoZSBnYXRld2F5cyBpbiB0aGUgZmlsZSwgYW5kIGNyZWF0ZSB0aGUgY29ubmVjdGlvbiBwcm9maWxlXG4gICAgICAgIGNvbmZpZ1xuICAgICAgICAgICAgLmZpbHRlcigoYzogeyB0eXBlOiBzdHJpbmcgfSkgPT4gYy50eXBlID09PSAnZ2F0ZXdheScpXG4gICAgICAgICAgICAuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAoZ2F0ZXdheToge1xuICAgICAgICAgICAgICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICBjbGllbnQ6IHsgb3JnYW5pemF0aW9uOiBzdHJpbmcgfTtcbiAgICAgICAgICAgICAgICAgICAgb3JnYW5pemF0aW9uczogeyBbbmFtZTogc3RyaW5nXTogeyBtc3BpZDogc3RyaW5nOyBwZWVyczogc3RyaW5nW10gfSB9O1xuICAgICAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvZmlsZVBhdGggPSBwYXRoLnJlc29sdmUoZ2F0ZXdheXBhdGgsIGAke3Nhbml0aXplKGdhdGV3YXkuaWQpfS5qc29uYCk7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMocHJvZmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGdhdGV3YXkpKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nKHsgbXNnOiBgR2F0ZXdheSBwcm9maWxlIHdyaXR0ZW4gdG8gOiAke3Byb2ZpbGVQYXRofWAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9yZyA9IGdhdGV3YXkuY2xpZW50Lm9yZ2FuaXphdGlvbjtcblxuICAgICAgICAgICAgICAgICAgICBlbnZ2YXJzW29yZyBhcyBzdHJpbmddID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbXNwaWQ6IGdhdGV3YXkub3JnYW5pemF0aW9uc1tvcmddLm1zcGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVlcnM6IGdhdGV3YXkub3JnYW5pemF0aW9uc1tvcmddLnBlZXJzIGFzIHN0cmluZ1tdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWRzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAvLyBsb2NhdGUgdGhlIGlkZW50aXRpZXNcbiAgICAgICAgaW50ZXJmYWNlIElkU3RydWN0dXJlIHtcbiAgICAgICAgICAgIHdhbGxldDogc3RyaW5nO1xuICAgICAgICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgICAgICAgaWQ6IHN0cmluZztcbiAgICAgICAgICAgIHByaXZhdGVfa2V5OiBzdHJpbmc7XG4gICAgICAgICAgICBjZXJ0OiBzdHJpbmc7XG4gICAgICAgICAgICBjYTogc3RyaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgdGhpcy5hc3luY0ZvckVhY2goXG4gICAgICAgICAgICBjb25maWcuZmlsdGVyKChjOiB7IHR5cGU6IHN0cmluZyB9KSA9PiBjLnR5cGUgPT09ICdpZGVudGl0eScpLFxuICAgICAgICAgICAgYXN5bmMgKGlkOiBJZFN0cnVjdHVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxXYWxsZXRQYXRoID0gcGF0aC5yZXNvbHZlKHdhbGxldHBhdGgsIHNhbml0aXplKGlkLndhbGxldCkpO1xuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKGZ1bGxXYWxsZXRQYXRoKTtcbiAgICAgICAgICAgICAgICBpZC5uYW1lID0gaWQuaWQ7XG4gICAgICAgICAgICAgICAgLy8gdXNlIGltcG9ydCB0byB3YWxsZXQgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICBjb25zdCBpZHMgPSBuZXcgSWRlbnRpdGllcyhmdWxsV2FsbGV0UGF0aCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgaWRzLmltcG9ydFRvV2FsbGV0KEpTT04uc3RyaW5naWZ5KGlkKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIG1zcCBjcnl0byBkaXIgc3RydWN0dXJlIGZvciB0aGUgcGVlciBjb21tYW5kc1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyeXB0b3Jvb3QgPSBwYXRoLnJlc29sdmUoY3J5cHRvcGF0aCwgc2FuaXRpemUoaWQud2FsbGV0KSwgc2FuaXRpemUoaWQuaWQpKTtcbiAgICAgICAgICAgICAgICAvLyBub3cgZm9yIHRoZSBtc3Agc3R1ZmZcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcpKTtcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdjYWNlcnRzJykpO1xuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2tleXN0b3JlJykpO1xuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ3NpZ25jZXJ0cycpKTtcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdhZG1pbmNlcnRzJykpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcHJpdmF0ZUtleSA9IEJ1ZmZlci5mcm9tKGlkLnByaXZhdGVfa2V5LCAnYmFzZTY0JykudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwZW1maWxlID0gQnVmZmVyLmZyb20oaWQuY2VydCwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FwZW0gPSBCdWZmZXIuZnJvbShpZC5jYSwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdzaWduY2VydHMnLCBgJHtpZC5pZH0ucGVtYCksIHBlbWZpbGUpO1xuICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnYWRtaW5jZXJ0cycsIGAke2lkLmlkfS5wZW1gKSwgcGVtZmlsZSk7XG4gICAgICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdrZXlzdG9yZScsIGBjZXJ0X3NrYCksIHByaXZhdGVLZXkpO1xuICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnY2FjZXJ0cycsICdjYS5wZW0nKSwgY2FwZW0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGVudnZhcnNbaWQud2FsbGV0XSkge1xuICAgICAgICAgICAgICAgICAgICBlbnZ2YXJzW2lkLndhbGxldF0uaWRzW2lkLmlkXSA9IHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJyk7IC8vcHVzaChgZXhwb3J0IENPUkVfUEVFUl9NU1BDT05GSUdQQVRIPSR7cGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnKX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIGxvZyh7IG1zZzogJ1xcbkVudmlyb25tZW50IHZhcmlhYmxlczonIH0pO1xuICAgICAgICBmb3IgKGNvbnN0IG9yZyBpbiBlbnZ2YXJzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVudnZhcnNbb3JnXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaWQgaW4gdmFsdWUuaWRzKSB7XG4gICAgICAgICAgICAgICAgbG9nKHsgbXNnOiBgXFxuRm9yICR7aWR9IEAgICR7b3JnfSB1c2UgdGhlc2U6XFxuYCB9KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgZXhwb3J0IENPUkVfUEVFUl9MT0NBTE1TUElEPSR7dmFsdWUubXNwaWR9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGV4cG9ydCBDT1JFX1BFRVJfTVNQQ09ORklHUEFUSD0ke3ZhbHVlLmlkc1tpZF19YCk7XG4gICAgICAgICAgICAgICAgdmFsdWUucGVlcnMuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgZXhwb3J0IENPUkVfUEVFUl9BRERSRVNTPSR7cH1gKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBsb2coeyBtc2c6IEpTT04uc3RyaW5naWZ5KHZhbHVlKSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGFzeW5jRm9yRWFjaChhcnJheTogYW55LCBjYWxsYmFjazogY2FsbGJhY2tGbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBhd2FpdCBjYWxsYmFjayhhcnJheVtpbmRleF0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19