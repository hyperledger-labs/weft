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
const yargs = __importStar(require("yargs"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
const userutils_1 = require("./userutils");
const identies_1 = __importDefault(require("./identies"));
const gateways_1 = require("./gateways");
const log_1 = require("./log");
const microfab_1 = __importDefault(require("./microfab"));
const userutils_2 = require("./userutils");
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
        mspid: { alias: 'm', describe: 'MSPID to assign in this wallet', demandOption: true },
        json: { alias: 'j', describe: 'File of the JSON identity', demandOption: true },
        compat: { alias: 'c', decribe: 'Set to use the 1.4 wallet formate', default: false, type: 'boolean' },
        createwallet: {
            alias: 'c',
            describe: 'Create the wallet if not present',
            type: 'boolean',
            default: false,
        },
    });
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    log_1.log({ msg: 'Adding IBP identity' });
    const walletPath = userutils_1.resolveWalletPath(args['wallet'], args['createwallet']);
    if (!args['compat']) {
        const idtools = new identies_1.default(walletPath);
        yield idtools.importToWallet(userutils_1.saneReadFile(args['json']), args['mspid']);
    }
    else {
        const { importToWallet } = require('../facade-14/index.js');
        yield importToWallet(walletPath, userutils_1.saneReadFile(args['json']), args['mspid']);
    }
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
    .command('microfab', 'Process the ibp-microfab output', (yargs) => {
    return yargs.options({
        wallet: { alias: 'w', describe: 'Path to parent directory of application wallets', demandOption: true },
        profile: { alias: 'p', describe: 'Path to the parent directory of Gateway files', demandOption: true },
        mspconfig: { alias: 'm', describe: 'Path to the root directory of the MSP config', demandOption: true },
        config: {
            alias: 'c',
            describe: 'File with JSON configuration from Microfab  - for stdin',
            default: '-',
        },
        force: { alias: 'f', describe: 'Force cleaning of directories', type: 'boolean', default: false },
    });
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    userutils_2.createIfAbsent(args['profile']);
    userutils_2.createIfAbsent(args['wallet']);
    userutils_2.createIfAbsent(args['mspconfig']);
    if (args.force) {
        userutils_2.clean(args['profile']);
        userutils_2.clean(args['wallet']);
        userutils_2.clean(args['mspconfig']);
    }
    const microFabProcessor = new microfab_1.default();
    yield microFabProcessor.process(args['config'], args['profile'], args['wallet'], args['mspconfig']);
}))
    .help()
    .wrap(null)
    .alias('v', 'version')
    .version(`weft v${version}`)
    .help()
    .strict()
    .demandCommand()
    .epilog('For usage see https://github.com/hyperledendary/weftility')
    .describe('v', 'show version information').argv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsNkNBQStCO0FBRS9CLDJDQUE2QjtBQUM3QiwyQkFBa0M7QUFDbEMsMkNBQWtGO0FBQ2xGLDBEQUFvQztBQUNwQyx5Q0FBK0M7QUFDL0MsK0JBQTRCO0FBQzVCLDBEQUEyQztBQUUzQywyQ0FBb0Q7QUFFcEQsTUFBTSxLQUFLLEdBQUcsaUJBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFFMUMsS0FBSztLQUNBLE9BQU8sQ0FDSixRQUFRLEVBQ1Isd0NBQXdDLEVBQ3hDLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDTixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDakIsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtRQUNqRixNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSw0QkFBNEIsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO1FBQ2xGLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLHlDQUF5QyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDN0YsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDbEUsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsaUJBQWlC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UUFBUSxDQUFXLENBQUMsQ0FBQztJQUN6QywwQkFBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQVcsQ0FBQyxDQUFDO0lBRTVDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNaLGlCQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBVyxDQUFDLENBQUM7UUFDakMsaUJBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFXLENBQUMsQ0FBQztRQUNoQyxpQkFBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQVcsQ0FBQyxDQUFDO0tBQ3RDO0lBRUQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLGtCQUFpQixFQUFFLENBQUM7SUFDbEQsTUFBTSxpQkFBaUIsQ0FBQyxPQUFPLENBQzNCLElBQUksQ0FBQyxRQUFRLENBQVcsRUFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBVyxFQUN6QixJQUFJLENBQUMsUUFBUSxDQUFXLEVBQ3hCLElBQUksQ0FBQyxXQUFXLENBQVcsQ0FDOUIsQ0FBQztBQUdOLENBQUMsQ0FBQSxDQUNKO0tBQ0EsSUFBSSxFQUFFO0tBQ04sSUFBSSxDQUFDLElBQUksQ0FBQztLQUNWLEtBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDO0tBQ3JCLE9BQU8sQ0FBQyxTQUFTLE9BQU8sRUFBRSxDQUFDO0tBQzNCLElBQUksRUFBRTtLQUNOLE1BQU0sRUFBRTtLQUNSLGFBQWEsRUFBRTtLQUNmLE1BQU0sQ0FBQywyREFBMkQsQ0FBQztLQUNuRSxRQUFRLENBQUMsR0FBRyxFQUFFLDBCQUEwQixDQUFDLENBQUMsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLypcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHJlc29sdmVHYXRld2F5UGF0aCwgcmVzb2x2ZVdhbGxldFBhdGgsIHNhbmVSZWFkRmlsZSB9IGZyb20gJy4vdXNlcnV0aWxzJztcbmltcG9ydCBJZGVudGl0aWVzIGZyb20gJy4vaWRlbnRpZXMnO1xuaW1wb3J0IHsgZ2V0R2F0ZXdheVByb2ZpbGUgfSBmcm9tICcuL2dhdGV3YXlzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4vbG9nJztcbmltcG9ydCBNaWNyb2ZhYlByb2Nlc3NvciBmcm9tICcuL21pY3JvZmFiJztcblxuaW1wb3J0IHsgY3JlYXRlSWZBYnNlbnQsIGNsZWFuIH0gZnJvbSAnLi91c2VydXRpbHMnO1xuXG5jb25zdCBwanNvbiA9IHJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nLCAncGFja2FnZS5qc29uJyksICd1dGYtOCcpO1xuY29uc3QgdmVyc2lvbiA9IEpTT04ucGFyc2UocGpzb24pLnZlcnNpb247XG5cbnlhcmdzXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdlbnJvbGwnLFxuICAgICAgICAnRW5yb2xscyBDQSBpZGVudGl0eSBhbmQgYWRkcyB0byB3YWxsZXQnLFxuICAgICAgICAoeWFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB5YXJncy5vcHRpb25zKHtcbiAgICAgICAgICAgICAgICBwcm9maWxlOiB7IGFsaWFzOiAncCcsIGRlc2NyaWJlOiAnUGF0aCB0byB0aGUgR2F0ZXdheSBmaWxlJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgd2FsbGV0OiB7IGFsaWFzOiAndycsIGRlc2NyaWJlOiAnUGF0aCB0byBhcHBsaWNhdGlvbiB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBuYW1lOiB7IGFsaWFzOiAnbicsIGRlc2NyaWJlOiAnTmFtZSBvZiB0aGUgbmV3IHVzZXIgZm9yIHRoZSBhcHAgd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgZW5yb2xsaWQ6IHsgYWxpYXM6ICdlJywgZGVzY3JpYmU6ICdFbnJvbGxJRCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGVucm9sbHB3ZDogeyBhbGlhczogJ3MnLCBkZXNjcmliZTogJ0Vucm9sbCBwYXNzd29yZCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdFbnJvbGxpbmcgaWRlbnRpdHknIH0pO1xuICAgICAgICAgICAgLy8gcmVzb2x2ZSB0aGUgc3VwcGxpZWQgZ2F0ZXdheSBhbmQgd2FsbGV0IHBhdGhzXG4gICAgICAgICAgICBjb25zdCBnYXRld2F5UGF0aCA9IHJlc29sdmVHYXRld2F5UGF0aChhcmdzWydwcm9maWxlJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSByZXNvbHZlV2FsbGV0UGF0aChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcpO1xuXG4gICAgICAgICAgICBjb25zdCBpZHRvb2xzID0gbmV3IElkZW50aXRpZXMod2FsbGV0UGF0aCwgZ2V0R2F0ZXdheVByb2ZpbGUoZ2F0ZXdheVBhdGgpKTtcbiAgICAgICAgICAgIGF3YWl0IGlkdG9vbHMuZW5yb2xsKGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZywgYXJnc1snZW5yb2xsaWQnXSBhcyBzdHJpbmcsIGFyZ3NbJ2Vucm9sbHB3ZCddIGFzIHN0cmluZyk7XG4gICAgICAgIH0sXG4gICAgKVxuICAgIC5jb21tYW5kKFxuICAgICAgICAnaW1wb3J0JyxcbiAgICAgICAgJ0ltcG9ydHMgSUJQIGlkZW50aXR5IGFuZCBhZGRzIHRvIHdhbGxldCcsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gYXBwbGljYXRpb24gd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgbXNwaWQ6IHsgYWxpYXM6ICdtJywgZGVzY3JpYmU6ICdNU1BJRCB0byBhc3NpZ24gaW4gdGhpcyB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBqc29uOiB7IGFsaWFzOiAnaicsIGRlc2NyaWJlOiAnRmlsZSBvZiB0aGUgSlNPTiBpZGVudGl0eScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGNvbXBhdDogeyBhbGlhczogJ2MnLCBkZWNyaWJlOiAnU2V0IHRvIHVzZSB0aGUgMS40IHdhbGxldCBmb3JtYXRlJywgZGVmYXVsdDogZmFsc2UsIHR5cGU6ICdib29sZWFuJyB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZXdhbGxldDoge1xuICAgICAgICAgICAgICAgICAgICBhbGlhczogJ2MnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmliZTogJ0NyZWF0ZSB0aGUgd2FsbGV0IGlmIG5vdCBwcmVzZW50JyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdBZGRpbmcgSUJQIGlkZW50aXR5JyB9KTtcbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHJlc29sdmVXYWxsZXRQYXRoKGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZywgYXJnc1snY3JlYXRld2FsbGV0J10gYXMgYm9vbGVhbik7XG5cbiAgICAgICAgICAgIGlmICghYXJnc1snY29tcGF0J10pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHRvb2xzID0gbmV3IElkZW50aXRpZXMod2FsbGV0UGF0aCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgaWR0b29scy5pbXBvcnRUb1dhbGxldChzYW5lUmVhZEZpbGUoYXJnc1snanNvbiddIGFzIHN0cmluZyksIGFyZ3NbJ21zcGlkJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcbiAgICAgICAgICAgICAgICBjb25zdCB7IGltcG9ydFRvV2FsbGV0IH0gPSByZXF1aXJlKCcuLi9mYWNhZGUtMTQvaW5kZXguanMnKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBpbXBvcnRUb1dhbGxldCh3YWxsZXRQYXRoLCBzYW5lUmVhZEZpbGUoYXJnc1snanNvbiddIGFzIHN0cmluZyksIGFyZ3NbJ21zcGlkJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdscycsXG4gICAgICAgICdMaXN0cyBBcHBsaWNhdGlvbiBXYWxsZXQgaWRlbnRpdGllcycsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gYXBwbGljYXRpb24gd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHJlc29sdmVXYWxsZXRQYXRoKGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdMaXN0aW5nIGFwcGxpY2F0aW9uIHdhbGxldCBpZGVudGl0aWVzJywgdmFsOiB3YWxsZXRQYXRoIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBpZHRvb2xzID0gbmV3IElkZW50aXRpZXMod2FsbGV0UGF0aCk7XG4gICAgICAgICAgICBpZHRvb2xzLmxpc3QoKTtcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdtaWNyb2ZhYicsXG4gICAgICAgICdQcm9jZXNzIHRoZSBpYnAtbWljcm9mYWIgb3V0cHV0JyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgd2FsbGV0OiB7IGFsaWFzOiAndycsIGRlc2NyaWJlOiAnUGF0aCB0byBwYXJlbnQgZGlyZWN0b3J5IG9mIGFwcGxpY2F0aW9uIHdhbGxldHMnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBwcm9maWxlOiB7IGFsaWFzOiAncCcsIGRlc2NyaWJlOiAnUGF0aCB0byB0aGUgcGFyZW50IGRpcmVjdG9yeSBvZiBHYXRld2F5IGZpbGVzJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgbXNwY29uZmlnOiB7IGFsaWFzOiAnbScsIGRlc2NyaWJlOiAnUGF0aCB0byB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhlIE1TUCBjb25maWcnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgYWxpYXM6ICdjJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpYmU6ICdGaWxlIHdpdGggSlNPTiBjb25maWd1cmF0aW9uIGZyb20gTWljcm9mYWIgIC0gZm9yIHN0ZGluJyxcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogJy0nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZm9yY2U6IHsgYWxpYXM6ICdmJywgZGVzY3JpYmU6ICdGb3JjZSBjbGVhbmluZyBvZiBkaXJlY3RvcmllcycsIHR5cGU6ICdib29sZWFuJywgZGVmYXVsdDogZmFsc2UgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICAgICAgY3JlYXRlSWZBYnNlbnQoYXJnc1sncHJvZmlsZSddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBjcmVhdGVJZkFic2VudChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgY3JlYXRlSWZBYnNlbnQoYXJnc1snbXNwY29uZmlnJ10gYXMgc3RyaW5nKTtcblxuICAgICAgICAgICAgaWYgKGFyZ3MuZm9yY2UpIHtcbiAgICAgICAgICAgICAgICBjbGVhbihhcmdzWydwcm9maWxlJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgICAgICBjbGVhbihhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgICAgIGNsZWFuKGFyZ3NbJ21zcGNvbmZpZyddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG1pY3JvRmFiUHJvY2Vzc29yID0gbmV3IE1pY3JvZmFiUHJvY2Vzc29yKCk7XG4gICAgICAgICAgICBhd2FpdCBtaWNyb0ZhYlByb2Nlc3Nvci5wcm9jZXNzKFxuICAgICAgICAgICAgICAgIGFyZ3NbJ2NvbmZpZyddIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBhcmdzWydwcm9maWxlJ10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBhcmdzWydtc3Bjb25maWcnXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmhlbHAoKVxuICAgIC53cmFwKG51bGwpXG4gICAgLmFsaWFzKCd2JywgJ3ZlcnNpb24nKVxuICAgIC52ZXJzaW9uKGB3ZWZ0IHYke3ZlcnNpb259YClcbiAgICAuaGVscCgpXG4gICAgLnN0cmljdCgpXG4gICAgLmRlbWFuZENvbW1hbmQoKVxuICAgIC5lcGlsb2coJ0ZvciB1c2FnZSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2h5cGVybGVkZW5kYXJ5L3dlZnRpbGl0eScpXG4gICAgLmRlc2NyaWJlKCd2JywgJ3Nob3cgdmVyc2lvbiBpbmZvcm1hdGlvbicpLmFyZ3Y7XG4iXX0=