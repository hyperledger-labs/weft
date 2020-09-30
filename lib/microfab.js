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
                const org = gateway.client.organization;
                const e = [];
                e.push(`export CORE_PEER_LOCALMSPID=${gateway.organizations[org].mspid}`);
                e.push(`export CORE_PEER_ADDRESS=${gateway.organizations[org].peers[0]}`);
                envvars[org] = e;
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
                    envvars[id.wallet].push(`export CORE_PEER_MSPCONFIGPATH=${path.join(cryptoroot, 'msp')}`);
                }
            }));
            log_1.log({ msg: '\nEnvironment variables:' });
            for (const org in envvars) {
                log_1.log({ msg: `For ${org} use these:\n` });
                const value = envvars[org];
                log_1.log({ msg: value.join('\n') });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWljcm9mYWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWljcm9mYWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsMkNBQTZCO0FBQzdCLDJCQUE2RDtBQUM3RCwrQ0FBaUM7QUFDakMsMEVBQXlDO0FBQ3pDLDBEQUFvQztBQUdwQywrQkFBNEI7QUFFNUIsTUFBcUIsaUJBQWlCO0lBQ3JCLE9BQU8sQ0FDaEIsVUFBa0IsRUFDbEIsV0FBbUIsRUFDbkIsVUFBa0IsRUFDbEIsVUFBa0I7O1lBR2xCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNoQixJQUFJLFVBQVUsS0FBSyxHQUFHLEVBQUU7Z0JBQ3BCLE1BQU0sR0FBRyxpQkFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3ZDO2lCQUFNO2dCQUNILE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxlQUFVLENBQUMsY0FBYyxDQUFDLEVBQUU7b0JBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLGNBQWMsRUFBRSxDQUFDLENBQUM7aUJBQzFFO2dCQUNELE1BQU0sR0FBRyxpQkFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3BEO1lBTUQsTUFBTSxPQUFPLEdBQVksRUFBRSxDQUFDO1lBRTVCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFHbEMsTUFBTTtpQkFDRCxNQUFNLENBQUMsQ0FBQyxDQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQztpQkFDckQsT0FBTyxDQUNKLENBQUMsT0FJQSxFQUFFLEVBQUU7Z0JBQ0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsR0FBRywyQkFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzlFLGtCQUFhLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFFcEQsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFFYixDQUFDLENBQUMsSUFBSSxDQUFDLCtCQUErQixPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQzFFLENBQUMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDMUUsT0FBTyxDQUFDLEdBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQ0osQ0FBQztZQVlOLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FDbkIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQW1CLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLEVBQzdELENBQU8sRUFBZSxFQUFFLEVBQUU7Z0JBQ3RCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLDJCQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3JFLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzVCLEVBQUUsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFFaEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxrQkFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUc3QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSwyQkFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSwyQkFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUVsRixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBRXhELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDcEUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUMxRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3RELGtCQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNsRixrQkFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDbkYsa0JBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUMvRSxrQkFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRXhFLElBQUksT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDcEIsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDN0Y7WUFDTCxDQUFDLENBQUEsQ0FDSixDQUFDO1lBRUYsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLDBCQUEwQixFQUFFLENBQUMsQ0FBQztZQUN6QyxLQUFLLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRTtnQkFDdkIsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sR0FBRyxlQUFlLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzNCLFNBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNsQztRQUNMLENBQUM7S0FBQTtJQUVLLFlBQVksQ0FBQyxLQUFVLEVBQUUsUUFBb0I7O1lBQy9DLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUMvQyxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNoQztRQUNMLENBQUM7S0FBQTtDQUNKO0FBeEdELG9DQXdHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMsIGV4aXN0c1N5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCBzYW5pdGl6ZSBmcm9tICdzYW5pdGl6ZS1maWxlbmFtZSc7XG5pbXBvcnQgSWRlbnRpdGllcyBmcm9tICcuL2lkZW50aWVzJztcblxudHlwZSBjYWxsYmFja0ZuID0gKHY6IGFueSkgPT4gdm9pZDtcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4vbG9nJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWljcm9mYWJQcm9jZXNzb3Ige1xuICAgIHB1YmxpYyBhc3luYyBwcm9jZXNzKFxuICAgICAgICBjb25maWdGaWxlOiBzdHJpbmcsXG4gICAgICAgIGdhdGV3YXlwYXRoOiBzdHJpbmcsXG4gICAgICAgIHdhbGxldHBhdGg6IHN0cmluZyxcbiAgICAgICAgY3J5cHRvcGF0aDogc3RyaW5nLFxuICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyBKU09OIGNvbmZpZ3VyYXRpb24gZWl0aGVyIGZyb20gc3RkaW4gb3IgZmlsZW5hbWVcbiAgICAgICAgbGV0IGNmZ1N0ciA9ICcnO1xuICAgICAgICBpZiAoY29uZmlnRmlsZSA9PT0gJy0nKSB7XG4gICAgICAgICAgICBjZmdTdHIgPSByZWFkRmlsZVN5bmMoMCkudG9TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG1pY3JvZmFiQ29uZmlnID0gcGF0aC5yZXNvbHZlKGNvbmZpZ0ZpbGUpO1xuICAgICAgICAgICAgaWYgKCFleGlzdHNTeW5jKG1pY3JvZmFiQ29uZmlnKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTWljcm9mYWIgY29uZmlnIGpzb24gbm90IGZvdW5kIGF0ICR7bWljcm9mYWJDb25maWd9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjZmdTdHIgPSByZWFkRmlsZVN5bmMobWljcm9mYWJDb25maWcpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpbnRlcmZhY2UgRW52VmFycyB7XG4gICAgICAgICAgICBbb3JnOiBzdHJpbmddOiBzdHJpbmdbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVudnZhcnM6IEVudlZhcnMgPSB7fTtcblxuICAgICAgICBjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKGNmZ1N0cik7XG5cbiAgICAgICAgLy8gbG9jYXRlIHRoZSBnYXRld2F5cyBpbiB0aGUgZmlsZSwgYW5kIGNyZWF0ZSB0aGUgY29ubmVjdGlvbiBwcm9maWxlXG4gICAgICAgIGNvbmZpZ1xuICAgICAgICAgICAgLmZpbHRlcigoYzogeyB0eXBlOiBzdHJpbmcgfSkgPT4gYy50eXBlID09PSAnZ2F0ZXdheScpXG4gICAgICAgICAgICAuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAoZ2F0ZXdheToge1xuICAgICAgICAgICAgICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICBjbGllbnQ6IHsgb3JnYW5pemF0aW9uOiBzdHJpbmcgfTtcbiAgICAgICAgICAgICAgICAgICAgb3JnYW5pemF0aW9uczogeyBbbmFtZTogc3RyaW5nXTogeyBtc3BpZDogc3RyaW5nOyBwZWVyczogc3RyaW5nIH0gfTtcbiAgICAgICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2ZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGdhdGV3YXlwYXRoLCBgJHtzYW5pdGl6ZShnYXRld2F5LmlkKX0uanNvbmApO1xuICAgICAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKHByb2ZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeShnYXRld2F5KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3JnID0gZ2F0ZXdheS5jbGllbnQub3JnYW5pemF0aW9uO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgZS5wdXNoKGBleHBvcnQgQ09SRV9QRUVSX0xPQ0FMTVNQSUQ9JHtnYXRld2F5Lm9yZ2FuaXphdGlvbnNbb3JnXS5tc3BpZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgZS5wdXNoKGBleHBvcnQgQ09SRV9QRUVSX0FERFJFU1M9JHtnYXRld2F5Lm9yZ2FuaXphdGlvbnNbb3JnXS5wZWVyc1swXX1gKTtcbiAgICAgICAgICAgICAgICAgICAgZW52dmFyc1tvcmcgYXMgc3RyaW5nXSA9IGU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgLy8gbG9jYXRlIHRoZSBpZGVudGl0aWVzXG4gICAgICAgIGludGVyZmFjZSBJZFN0cnVjdHVyZSB7XG4gICAgICAgICAgICB3YWxsZXQ6IHN0cmluZztcbiAgICAgICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgICAgICBwcml2YXRlX2tleTogc3RyaW5nO1xuICAgICAgICAgICAgY2VydDogc3RyaW5nO1xuICAgICAgICAgICAgY2E6IHN0cmluZztcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMuYXN5bmNGb3JFYWNoKFxuICAgICAgICAgICAgY29uZmlnLmZpbHRlcigoYzogeyB0eXBlOiBzdHJpbmcgfSkgPT4gYy50eXBlID09PSAnaWRlbnRpdHknKSxcbiAgICAgICAgICAgIGFzeW5jIChpZDogSWRTdHJ1Y3R1cmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmdWxsV2FsbGV0UGF0aCA9IHBhdGgucmVzb2x2ZSh3YWxsZXRwYXRoLCBzYW5pdGl6ZShpZC53YWxsZXQpKTtcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhmdWxsV2FsbGV0UGF0aCk7XG4gICAgICAgICAgICAgICAgaWQubmFtZSA9IGlkLmlkO1xuICAgICAgICAgICAgICAgIC8vIHVzZSBpbXBvcnQgdG8gd2FsbGV0IGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgY29uc3QgaWRzID0gbmV3IElkZW50aXRpZXMoZnVsbFdhbGxldFBhdGgpO1xuICAgICAgICAgICAgICAgIGF3YWl0IGlkcy5pbXBvcnRUb1dhbGxldChKU09OLnN0cmluZ2lmeShpZCkpO1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBtc3AgY3J5dG8gZGlyIHN0cnVjdHVyZSBmb3IgdGhlIHBlZXIgY29tbWFuZHNcbiAgICAgICAgICAgICAgICBjb25zdCBjcnlwdG9yb290ID0gcGF0aC5yZXNvbHZlKGNyeXB0b3BhdGgsIHNhbml0aXplKGlkLndhbGxldCksIHNhbml0aXplKGlkLmlkKSk7XG4gICAgICAgICAgICAgICAgLy8gbm93IGZvciB0aGUgbXNwIHN0dWZmXG4gICAgICAgICAgICAgICAgbWtkaXJwLnN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnKSk7XG4gICAgICAgICAgICAgICAgbWtkaXJwLnN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnY2FjZXJ0cycpKTtcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdrZXlzdG9yZScpKTtcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhwYXRoLmpvaW4oY3J5cHRvcm9vdCwgJ21zcCcsICdzaWduY2VydHMnKSk7XG4gICAgICAgICAgICAgICAgbWtkaXJwLnN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnYWRtaW5jZXJ0cycpKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBCdWZmZXIuZnJvbShpZC5wcml2YXRlX2tleSwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGVtZmlsZSA9IEJ1ZmZlci5mcm9tKGlkLmNlcnQsICdiYXNlNjQnKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhcGVtID0gQnVmZmVyLmZyb20oaWQuY2EsICdiYXNlNjQnKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAnc2lnbmNlcnRzJywgYCR7aWQuaWR9LnBlbWApLCBwZW1maWxlKTtcbiAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2FkbWluY2VydHMnLCBgJHtpZC5pZH0ucGVtYCksIHBlbWZpbGUpO1xuICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMocGF0aC5qb2luKGNyeXB0b3Jvb3QsICdtc3AnLCAna2V5c3RvcmUnLCBgY2VydF9za2ApLCBwcml2YXRlS2V5KTtcbiAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKHBhdGguam9pbihjcnlwdG9yb290LCAnbXNwJywgJ2NhY2VydHMnLCAnY2EucGVtJyksIGNhcGVtKTtcblxuICAgICAgICAgICAgICAgIGlmIChlbnZ2YXJzW2lkLndhbGxldF0pIHtcbiAgICAgICAgICAgICAgICAgICAgZW52dmFyc1tpZC53YWxsZXRdLnB1c2goYGV4cG9ydCBDT1JFX1BFRVJfTVNQQ09ORklHUEFUSD0ke3BhdGguam9pbihjcnlwdG9yb290LCAnbXNwJyl9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICBsb2coeyBtc2c6ICdcXG5FbnZpcm9ubWVudCB2YXJpYWJsZXM6JyB9KTtcbiAgICAgICAgZm9yIChjb25zdCBvcmcgaW4gZW52dmFycykge1xuICAgICAgICAgICAgbG9nKHsgbXNnOiBgRm9yICR7b3JnfSB1c2UgdGhlc2U6XFxuYCB9KTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZW52dmFyc1tvcmddO1xuICAgICAgICAgICAgbG9nKHsgbXNnOiB2YWx1ZS5qb2luKCdcXG4nKSB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGFzeW5jRm9yRWFjaChhcnJheTogYW55LCBjYWxsYmFjazogY2FsbGJhY2tGbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBhd2FpdCBjYWxsYmFjayhhcnJheVtpbmRleF0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19