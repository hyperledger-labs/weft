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
exports.MicrofabProcessor = void 0;
const path = __importStar(require("path"));
const fs_1 = require("fs");
const mkdirp = __importStar(require("mkdirp"));
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const identies_1 = __importDefault(require("./identies"));
const log_1 = require("./log");
class MicrofabProcessor {
    processFile(configFile, gatewaypath, walletpath, cryptopath) {
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
            const config = JSON.parse(cfgStr);
            yield this.process({ config, gatewaypath, walletpath, cryptopath });
        });
    }
    process({ config, gatewaypath, walletpath, cryptopath, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const envvars = {};
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
            return envvars;
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
exports.MicrofabProcessor = MicrofabProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWljcm9mYWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWljcm9mYWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlBLDJDQUE2QjtBQUM3QiwyQkFBNkQ7QUFDN0QsK0NBQWlDO0FBQ2pDLDBFQUF5QztBQUN6QywwREFBb0M7QUFHcEMsK0JBQTRCO0FBTTVCLE1BQWEsaUJBQWlCO0lBQ2IsV0FBVyxDQUNwQixVQUFrQixFQUNsQixXQUFtQixFQUNuQixVQUFrQixFQUNsQixVQUFrQjs7WUFHbEIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLElBQUksVUFBVSxLQUFLLEdBQUcsRUFBRTtnQkFDcEIsTUFBTSxHQUFHLGlCQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDdkM7aUJBQU07Z0JBQ0gsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLGVBQVUsQ0FBQyxjQUFjLENBQUMsRUFBRTtvQkFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsY0FBYyxFQUFFLENBQUMsQ0FBQztpQkFDMUU7Z0JBQ0QsTUFBTSxHQUFHLGlCQUFZLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDcEQ7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDeEUsQ0FBQztLQUFBO0lBRVksT0FBTyxDQUFDLEVBQ2pCLE1BQU0sRUFDTixXQUFXLEVBQ1gsVUFBVSxFQUNWLFVBQVUsR0FNYjs7WUFDRyxNQUFNLE9BQU8sR0FBWSxFQUFFLENBQUM7WUFF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Q0FBQyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsT0FBTyxHQUFHLGVBQWUsRUFBRSxDQUFDLENBQUM7b0JBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO29CQUMxRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDL0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTt3QkFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDakQsQ0FBQyxDQUFDLENBQUM7aUJBRU47YUFDSjtZQUNELE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUM7S0FBQTtJQUVLLFlBQVksQ0FBQyxLQUFVLEVBQUUsUUFBb0I7O1lBQy9DLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUMvQyxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNoQztRQUNMLENBQUM7S0FBQTtDQUNKO0FBekhELDhDQXlIQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMsIGV4aXN0c1N5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCBzYW5pdGl6ZSBmcm9tICdzYW5pdGl6ZS1maWxlbmFtZSc7XG5pbXBvcnQgSWRlbnRpdGllcyBmcm9tICcuL2lkZW50aWVzJztcblxudHlwZSBjYWxsYmFja0ZuID0gKHY6IGFueSkgPT4gdm9pZDtcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4vbG9nJztcblxuZXhwb3J0IGludGVyZmFjZSBFbnZWYXJzIHtcbiAgICBbb3JnOiBzdHJpbmddOiB7IG1zcGlkOiBzdHJpbmc7IHBlZXJzOiBzdHJpbmdbXTsgaWRzOiB7IFtpZDogc3RyaW5nXTogc3RyaW5nIH0gfTtcbn1cblxuZXhwb3J0IGNsYXNzIE1pY3JvZmFiUHJvY2Vzc29yIHtcbiAgICBwdWJsaWMgYXN5bmMgcHJvY2Vzc0ZpbGUoXG4gICAgICAgIGNvbmZpZ0ZpbGU6IHN0cmluZyxcbiAgICAgICAgZ2F0ZXdheXBhdGg6IHN0cmluZyxcbiAgICAgICAgd2FsbGV0cGF0aDogc3RyaW5nLFxuICAgICAgICBjcnlwdG9wYXRoOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vIEpTT04gY29uZmlndXJhdGlvbiBlaXRoZXIgZnJvbSBzdGRpbiBvciBmaWxlbmFtZVxuICAgICAgICBsZXQgY2ZnU3RyID0gJyc7XG4gICAgICAgIGlmIChjb25maWdGaWxlID09PSAnLScpIHtcbiAgICAgICAgICAgIGNmZ1N0ciA9IHJlYWRGaWxlU3luYygwKS50b1N0cmluZygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbWljcm9mYWJDb25maWcgPSBwYXRoLnJlc29sdmUoY29uZmlnRmlsZSk7XG4gICAgICAgICAgICBpZiAoIWV4aXN0c1N5bmMobWljcm9mYWJDb25maWcpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNaWNyb2ZhYiBjb25maWcganNvbiBub3QgZm91bmQgYXQgJHttaWNyb2ZhYkNvbmZpZ31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNmZ1N0ciA9IHJlYWRGaWxlU3luYyhtaWNyb2ZhYkNvbmZpZykudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoY2ZnU3RyKTtcbiAgICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzKHsgY29uZmlnLCBnYXRld2F5cGF0aCwgd2FsbGV0cGF0aCwgY3J5cHRvcGF0aCB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcHJvY2Vzcyh7XG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgZ2F0ZXdheXBhdGgsXG4gICAgICAgIHdhbGxldHBhdGgsXG4gICAgICAgIGNyeXB0b3BhdGgsXG4gICAgfToge1xuICAgICAgICBjb25maWc6IGFueTtcbiAgICAgICAgZ2F0ZXdheXBhdGg6IHN0cmluZztcbiAgICAgICAgd2FsbGV0cGF0aDogc3RyaW5nO1xuICAgICAgICBjcnlwdG9wYXRoOiBzdHJpbmc7XG4gICAgfSk6IFByb21pc2U8RW52VmFycz4ge1xuICAgICAgICBjb25zdCBlbnZ2YXJzOiBFbnZWYXJzID0ge307XG4gICAgICAgIC8vIGxvY2F0ZSB0aGUgZ2F0ZXdheXMgaW4gdGhlIGZpbGUsIGFuZCBjcmVhdGUgdGhlIGNvbm5lY3Rpb24gcHJvZmlsZVxuICAgICAgICBjb25maWdcbiAgICAgICAgICAgIC5maWx0ZXIoKGM6IHsgdHlwZTogc3RyaW5nIH0pID0+IGMudHlwZSA9PT0gJ2dhdGV3YXknKVxuICAgICAgICAgICAgLmZvckVhY2goXG4gICAgICAgICAgICAgICAgKGdhdGV3YXk6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50OiB7IG9yZ2FuaXphdGlvbjogc3RyaW5nIH07XG4gICAgICAgICAgICAgICAgICAgIG9yZ2FuaXphdGlvbnM6IHsgW25hbWU6IHN0cmluZ106IHsgbXNwaWQ6IHN0cmluZzsgcGVlcnM6IHN0cmluZ1tdIH0gfTtcbiAgICAgICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2ZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGdhdGV3YXlwYXRoLCBgJHtzYW5pdGl6ZShnYXRld2F5LmlkKX0uanNvbmApO1xuICAgICAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKHByb2ZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeShnYXRld2F5KSk7XG4gICAgICAgICAgICAgICAgICAgIGxvZyh7IG1zZzogYEdhdGV3YXkgcHJvZmlsZSB3cml0dGVuIHRvIDogJHtwcm9maWxlUGF0aH1gIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcmcgPSBnYXRld2F5LmNsaWVudC5vcmdhbml6YXRpb247XG5cbiAgICAgICAgICAgICAgICAgICAgZW52dmFyc1tvcmcgYXMgc3RyaW5nXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zcGlkOiBnYXRld2F5Lm9yZ2FuaXphdGlvbnNbb3JnXS5tc3BpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlZXJzOiBnYXRld2F5Lm9yZ2FuaXphdGlvbnNbb3JnXS5wZWVycyBhcyBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkczoge30sXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgLy8gbG9jYXRlIHRoZSBpZGVudGl0aWVzXG4gICAgICAgIGludGVyZmFjZSBJZFN0cnVjdHVyZSB7XG4gICAgICAgICAgICB3YWxsZXQ6IHN0cmluZztcbiAgICAgICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgICAgICBwcml2YXRlX2tleTogc3RyaW5nO1xuICAgICAgICAgICAgY2VydDogc3RyaW5nO1xuICAgICAgICAgICAgY2E6IHN0cmluZztcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMuYXN5bmNGb3JFYWNoKFxuICAgICAgICAgICAgY29uZmlnLmZpbHRlcigoYzogeyB0eXBlOiBzdHJpbmcgfSkgPT4gYy50eXBlID09PSAnaWRlbnRpdHknKSxcbiAgICAgICAgICAgIGFzeW5jIChpZDogSWRTdHJ1Y3R1cmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmdWxsV2FsbGV0UGF0aCA9IHBhdGgucmVzb2x2ZSh3YWxsZXRwYXRoLCBzYW5pdGl6ZShpZC53YWxsZXQpKTtcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhmdWxsV2FsbGV0UGF0aCk7XG4gICAgICAgICAgICAgICAgaWQubmFtZSA9IGlkLmlkO1xuICAgICAgICAgICAgICAgIC8vIHVzZSBpbXBvcnQgdG8gd2FsbGV0IGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgY29uc3QgaWRzID0gbmV3IElkZW50aXRpZXMoZnVsbFdhbGxldFBhdGgpO1xuICAgICAgICAgICAgICAgIGF3YWl0IGlkcy5pbXBvcnRUb1dhbGxldChKU09OLnN0cmluZ2lmeShpZCkpO1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBtc3AgY3J5dG8gZGlyIHN0cnVjdHVyZSBmb3IgdGhlIHBlZXIgY29tbWFuZHNcbiAgICAgICAgICAgICAgICBjb25zdCBjcnlwdG9yb290ID0gcGF0aC5yZXNvbHZlKGNyeXB0b3BhdGgsIHNhbml0aXplKGlkLndhbGxldCksIHNhbml0aXplKGlkLmlkKSk7XG4gICAgICAgICAgICAgICAgLy8gbm93IGZvciB0aGUgbXNwIHN0dWZmXG4gICAgICAgICAgICAgICAgbWtkaXJwLnN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnKSk7XG4gICAgICAgICAgICAgICAgbWtkaXJwLnN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnY2FjZXJ0cycpKTtcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdrZXlzdG9yZScpKTtcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdzaWduY2VydHMnKSk7XG4gICAgICAgICAgICAgICAgbWtkaXJwLnN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnYWRtaW5jZXJ0cycpKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBCdWZmZXIuZnJvbShpZC5wcml2YXRlX2tleSwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGVtZmlsZSA9IEJ1ZmZlci5mcm9tKGlkLmNlcnQsICdiYXNlNjQnKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhcGVtID0gQnVmZmVyLmZyb20oaWQuY2EsICdiYXNlNjQnKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnc2lnbmNlcnRzJywgYCR7aWQuaWR9LnBlbWApLCBwZW1maWxlKTtcbiAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2FkbWluY2VydHMnLCBgJHtpZC5pZH0ucGVtYCksIHBlbWZpbGUpO1xuICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAna2V5c3RvcmUnLCBgY2VydF9za2ApLCBwcml2YXRlS2V5KTtcbiAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2NhY2VydHMnLCAnY2EucGVtJyksIGNhcGVtKTtcblxuICAgICAgICAgICAgICAgIGlmIChlbnZ2YXJzW2lkLndhbGxldF0pIHtcbiAgICAgICAgICAgICAgICAgICAgZW52dmFyc1tpZC53YWxsZXRdLmlkc1tpZC5pZF0gPSBwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcpOyAvL3B1c2goYGV4cG9ydCBDT1JFX1BFRVJfTVNQQ09ORklHUEFUSD0ke3BhdGguam9pbihjcnlwdG9yb290LCAnbXNwJyl9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICBsb2coeyBtc2c6ICdcXG5FbnZpcm9ubWVudCB2YXJpYWJsZXM6JyB9KTtcbiAgICAgICAgZm9yIChjb25zdCBvcmcgaW4gZW52dmFycykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlbnZ2YXJzW29yZ107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlkIGluIHZhbHVlLmlkcykge1xuICAgICAgICAgICAgICAgIGxvZyh7IG1zZzogYFxcbkZvciAke2lkfSBAICAke29yZ30gdXNlIHRoZXNlOlxcbmAgfSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGV4cG9ydCBDT1JFX1BFRVJfTE9DQUxNU1BJRD0ke3ZhbHVlLm1zcGlkfWApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBleHBvcnQgQ09SRV9QRUVSX01TUENPTkZJR1BBVEg9JHt2YWx1ZS5pZHNbaWRdfWApO1xuICAgICAgICAgICAgICAgIHZhbHVlLnBlZXJzLmZvckVhY2goKHApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGV4cG9ydCBDT1JFX1BFRVJfQUREUkVTUz0ke3B9YCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gbG9nKHsgbXNnOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudnZhcnM7XG4gICAgfVxuXG4gICAgYXN5bmMgYXN5bmNGb3JFYWNoKGFycmF5OiBhbnksIGNhbGxiYWNrOiBjYWxsYmFja0ZuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcnJheS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGF3YWl0IGNhbGxiYWNrKGFycmF5W2luZGV4XSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=