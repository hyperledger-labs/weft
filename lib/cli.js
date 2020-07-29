#!/usr/bin/env node
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
const yargs = __importStar(require("yargs"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
const userutils_1 = require("./userutils");
const identies_1 = __importDefault(require("./identies"));
const gateways_1 = require("./gateways");
const log_1 = require("./log");
const microfab_1 = __importDefault(require("./microfab"));
const pjson = fs_1.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8');
const version = JSON.parse(pjson).version;
yargs
    .command('enroll', 'Enrolls CA identity and adds to wallet', (yargs) => {
    return yargs.options({
        profile: { alias: 'p', describe: 'Path to the Gateway file', demandOption: true },
        wallet: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
        name: { alias: 'n', describe: 'Name of the new user for the app wallet', demandOption: true },
        enrollid: { alias: 'e', describe: 'EnrollID', demandOption: true },
        enrollpwd: { alias: 's', describe: 'Enroll password', demandOption: true },
    });
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    log_1.log({ msg: 'Enrolling identity' });
    const gatewayPath = userutils_1.resolveGatewayPath(args['profile']);
    const walletPath = userutils_1.resolveWalletPath(args['wallet']);
    const idtools = new identies_1.default(walletPath, gateways_1.getGatewayProfile(gatewayPath));
    yield idtools.enroll(args['wallet'], args['enrollid'], args['enrollpwd']);
}))
    .command('import', 'Imports IBP identity and adds to wallet', (yargs) => {
    return yargs.options({
        wallet: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
        name: { alias: 'n', describe: 'Name of the new user for the app wallet', demandOption: true },
        json: { alias: 'j', describe: 'File of the JSON identity', demandOption: true },
    });
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    log_1.log({ msg: 'Adding IBP identity' });
    const walletPath = userutils_1.resolveWalletPath(args['wallet']);
    const idtools = new identies_1.default(walletPath);
    yield idtools.importToWallet(userutils_1.saneReadFile(args['json']));
}))
    .command('ls', 'Lists Application Wallet identities', (yargs) => {
    return yargs.options({
        wallet: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
    });
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    const walletPath = userutils_1.resolveWalletPath(args['wallet']);
    log_1.log({ msg: 'Listing application wallet identities', val: walletPath });
    const idtools = new identies_1.default(walletPath);
    idtools.list();
}))
    .command('microfab', 'Process the Microfab output', (yargs) => {
    return yargs.options({
        wallet: { alias: 'w', describe: 'Path to parent directory of application wallets', demandOption: true },
        profile: { alias: 'p', describe: 'Path to the parent directory of Gateway files', demandOption: true },
        mspconfig: { alias: 'm', describe: 'Path to the root directory of the MSP config', demandOption: true },
        config: {
            alias: 'c',
            describe: 'File with JSON configuration from Microfab  - for stdin',
            default: '-',
        },
    });
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    const microFabProcessor = new microfab_1.default();
    yield microFabProcessor.process(args['config'], args['profile'], args['wallet'], args['mspconfig']);
}))
    .help()
    .wrap(null)
    .alias('v', 'version')
    .version(`weft v${version}`)
    .help()
    .strict()
    .epilog('For usage see https://github.com/hyperledendary/weftility')
    .describe('v', 'show version information').argv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsNkNBQStCO0FBRS9CLDJDQUE2QjtBQUM3QiwyQkFBa0M7QUFDbEMsMkNBQWtGO0FBQ2xGLDBEQUFvQztBQUNwQyx5Q0FBK0M7QUFDL0MsK0JBQTRCO0FBQzVCLDBEQUEyQztBQUUzQyxNQUFNLEtBQUssR0FBRyxpQkFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNuRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUUxQyxLQUFLO0tBQ0EsT0FBTyxDQUNKLFFBQVEsRUFDUix3Q0FBd0MsRUFDeEMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtJQUNOLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUNqQixPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSwwQkFBMEIsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO1FBQ2pGLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLDRCQUE0QixFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDbEYsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUseUNBQXlDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtRQUM3RixRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtRQUNsRSxTQUFTLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVB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LFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDdEcsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsOENBQThDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtRQUN2RyxNQUFNLEVBQUU7WUFDSixLQUFLLEVBQUUsR0FBRztZQUNWLFFBQVEsRUFBRSx5REFBeUQ7WUFDbkUsT0FBTyxFQUFFLEdBQUc7U0FDZjtLQUNKLENBQUMsQ0FBQztBQUNQLENBQUMsRUFDRCxDQUFPLElBQUksRUFBRSxFQUFFO0lBQ1gsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLGtCQUFpQixFQUFFLENBQUM7SUFDbEQsTUFBTSxpQkFBaUIsQ0FBQyxPQUFPLENBQzNCLElBQUksQ0FBQyxRQUFRLENBQVcsRUFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBVyxFQUN6QixJQUFJLENBQUMsUUFBUSxDQUFXLEVBQ3hCLElBQUksQ0FBQyxXQUFXLENBQVcsQ0FDOUIsQ0FBQztBQUdOLENBQUMsQ0FBQSxDQUNKO0tBQ0EsSUFBSSxFQUFFO0tBQ04sSUFBSSxDQUFDLElBQUksQ0FBQztLQUNWLEtBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDO0tBQ3JCLE9BQU8sQ0FBQyxTQUFTLE9BQU8sRUFBRSxDQUFDO0tBQzNCLElBQUksRUFBRTtLQUNOLE1BQU0sRUFBRTtLQUNSLE1BQU0sQ0FBQywyREFBMkQsQ0FBQztLQUNuRSxRQUFRLENBQUMsR0FBRyxFQUFFLDBCQUEwQixDQUFDLENBQUMsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLypcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHJlc29sdmVHYXRld2F5UGF0aCwgcmVzb2x2ZVdhbGxldFBhdGgsIHNhbmVSZWFkRmlsZSB9IGZyb20gJy4vdXNlcnV0aWxzJztcbmltcG9ydCBJZGVudGl0aWVzIGZyb20gJy4vaWRlbnRpZXMnO1xuaW1wb3J0IHsgZ2V0R2F0ZXdheVByb2ZpbGUgfSBmcm9tICcuL2dhdGV3YXlzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4vbG9nJztcbmltcG9ydCBNaWNyb2ZhYlByb2Nlc3NvciBmcm9tICcuL21pY3JvZmFiJztcblxuY29uc3QgcGpzb24gPSByZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJ3BhY2thZ2UuanNvbicpLCAndXRmLTgnKTtcbmNvbnN0IHZlcnNpb24gPSBKU09OLnBhcnNlKHBqc29uKS52ZXJzaW9uO1xuXG55YXJnc1xuICAgIC5jb21tYW5kKFxuICAgICAgICAnZW5yb2xsJyxcbiAgICAgICAgJ0Vucm9sbHMgQ0EgaWRlbnRpdHkgYW5kIGFkZHMgdG8gd2FsbGV0JyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgcHJvZmlsZTogeyBhbGlhczogJ3AnLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIEdhdGV3YXkgZmlsZScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gYXBwbGljYXRpb24gd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgbmFtZTogeyBhbGlhczogJ24nLCBkZXNjcmliZTogJ05hbWUgb2YgdGhlIG5ldyB1c2VyIGZvciB0aGUgYXBwIHdhbGxldCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGVucm9sbGlkOiB7IGFsaWFzOiAnZScsIGRlc2NyaWJlOiAnRW5yb2xsSUQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBlbnJvbGxwd2Q6IHsgYWxpYXM6ICdzJywgZGVzY3JpYmU6ICdFbnJvbGwgcGFzc3dvcmQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICAgICAgbG9nKHsgbXNnOiAnRW5yb2xsaW5nIGlkZW50aXR5JyB9KTtcbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgY29uc3QgZ2F0ZXdheVBhdGggPSByZXNvbHZlR2F0ZXdheVBhdGgoYXJnc1sncHJvZmlsZSddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcmVzb2x2ZVdhbGxldFBhdGgoYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nKTtcblxuICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgsIGdldEdhdGV3YXlQcm9maWxlKGdhdGV3YXlQYXRoKSk7XG4gICAgICAgICAgICBhd2FpdCBpZHRvb2xzLmVucm9sbChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcsIGFyZ3NbJ2Vucm9sbGlkJ10gYXMgc3RyaW5nLCBhcmdzWydlbnJvbGxwd2QnXSBhcyBzdHJpbmcpO1xuICAgICAgICB9LFxuICAgIClcbiAgICAuY29tbWFuZChcbiAgICAgICAgJ2ltcG9ydCcsXG4gICAgICAgICdJbXBvcnRzIElCUCBpZGVudGl0eSBhbmQgYWRkcyB0byB3YWxsZXQnLFxuICAgICAgICAoeWFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB5YXJncy5vcHRpb25zKHtcbiAgICAgICAgICAgICAgICB3YWxsZXQ6IHsgYWxpYXM6ICd3JywgZGVzY3JpYmU6ICdQYXRoIHRvIGFwcGxpY2F0aW9uIHdhbGxldCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIG5hbWU6IHsgYWxpYXM6ICduJywgZGVzY3JpYmU6ICdOYW1lIG9mIHRoZSBuZXcgdXNlciBmb3IgdGhlIGFwcCB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBqc29uOiB7IGFsaWFzOiAnaicsIGRlc2NyaWJlOiAnRmlsZSBvZiB0aGUgSlNPTiBpZGVudGl0eScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdBZGRpbmcgSUJQIGlkZW50aXR5JyB9KTtcbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHJlc29sdmVXYWxsZXRQYXRoKGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGlkdG9vbHMgPSBuZXcgSWRlbnRpdGllcyh3YWxsZXRQYXRoKTtcbiAgICAgICAgICAgIGF3YWl0IGlkdG9vbHMuaW1wb3J0VG9XYWxsZXQoc2FuZVJlYWRGaWxlKGFyZ3NbJ2pzb24nXSBhcyBzdHJpbmcpKTtcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdscycsXG4gICAgICAgICdMaXN0cyBBcHBsaWNhdGlvbiBXYWxsZXQgaWRlbnRpdGllcycsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gYXBwbGljYXRpb24gd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHJlc29sdmVXYWxsZXRQYXRoKGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdMaXN0aW5nIGFwcGxpY2F0aW9uIHdhbGxldCBpZGVudGl0aWVzJywgdmFsOiB3YWxsZXRQYXRoIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBpZHRvb2xzID0gbmV3IElkZW50aXRpZXMod2FsbGV0UGF0aCk7XG4gICAgICAgICAgICBpZHRvb2xzLmxpc3QoKTtcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdtaWNyb2ZhYicsXG4gICAgICAgICdQcm9jZXNzIHRoZSBNaWNyb2ZhYiBvdXRwdXQnLFxuICAgICAgICAoeWFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB5YXJncy5vcHRpb25zKHtcbiAgICAgICAgICAgICAgICB3YWxsZXQ6IHsgYWxpYXM6ICd3JywgZGVzY3JpYmU6ICdQYXRoIHRvIHBhcmVudCBkaXJlY3Rvcnkgb2YgYXBwbGljYXRpb24gd2FsbGV0cycsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHByb2ZpbGU6IHsgYWxpYXM6ICdwJywgZGVzY3JpYmU6ICdQYXRoIHRvIHRoZSBwYXJlbnQgZGlyZWN0b3J5IG9mIEdhdGV3YXkgZmlsZXMnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBtc3Bjb25maWc6IHsgYWxpYXM6ICdtJywgZGVzY3JpYmU6ICdQYXRoIHRvIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGUgTVNQIGNvbmZpZycsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBhbGlhczogJ2MnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmliZTogJ0ZpbGUgd2l0aCBKU09OIGNvbmZpZ3VyYXRpb24gZnJvbSBNaWNyb2ZhYiAgLSBmb3Igc3RkaW4nLFxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiAnLScsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWljcm9GYWJQcm9jZXNzb3IgPSBuZXcgTWljcm9mYWJQcm9jZXNzb3IoKTtcbiAgICAgICAgICAgIGF3YWl0IG1pY3JvRmFiUHJvY2Vzc29yLnByb2Nlc3MoXG4gICAgICAgICAgICAgICAgYXJnc1snY29uZmlnJ10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ3Byb2ZpbGUnXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ21zcGNvbmZpZyddIGFzIHN0cmluZyxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICB9LFxuICAgIClcbiAgICAuaGVscCgpXG4gICAgLndyYXAobnVsbClcbiAgICAuYWxpYXMoJ3YnLCAndmVyc2lvbicpXG4gICAgLnZlcnNpb24oYHdlZnQgdiR7dmVyc2lvbn1gKVxuICAgIC5oZWxwKClcbiAgICAuc3RyaWN0KClcbiAgICAuZXBpbG9nKCdGb3IgdXNhZ2Ugc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9oeXBlcmxlZGVuZGFyeS93ZWZ0aWxpdHknKVxuICAgIC5kZXNjcmliZSgndicsICdzaG93IHZlcnNpb24gaW5mb3JtYXRpb24nKS5hcmd2O1xuIl19