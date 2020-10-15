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
const msp_1 = __importDefault(require("./msp"));
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
    .command('import', 'Imports IBP identity and adds to application wallet', (yargs) => {
    return yargs.options({
        wallet: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
        mspid: { alias: 'm', describe: 'MSPID to assign in this wallet', demandOption: true },
        json: { alias: 'j', describe: 'File of the JSON identity', demandOption: true },
        compat: { alias: 'c', decribe: 'Set to use the 1.4 wallet format', default: false, type: 'boolean' },
        createwallet: {
            alias: 'r',
            describe: 'Create the wallet if not present',
            type: 'boolean',
            default: false,
        },
    });
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    log_1.log({ msg: 'Adding IBP identity' });
    const walletPath = userutils_1.resolveWalletPath(args['wallet'], args['createwallet']);
    const idtools = new identies_1.default(walletPath);
    yield idtools.importToWallet(userutils_1.saneReadFile(args['json']), args['mspid'], args['compat']);
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
    .command('msp', 'Imports IBP identity to MSP for Peer commands', (yargs) => {
    return yargs.options({
        mspconfig: { alias: 'd', describe: 'Path to the root directory of the MSP config', demandOption: true },
        mspid: { alias: 'm', describe: 'MSPID to assign in this wallet', demandOption: true },
        json: { alias: 'j', describe: 'File of the JSON identity', demandOption: true },
    });
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    log_1.log({ msg: 'Creating MSP structure' });
    const msp = new msp_1.default();
    const rootdir = userutils_2.createIfAbsent(args['mspconfig']);
    msp.writeId(rootdir, userutils_1.saneReadFile(args['json']), args['mspid']);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsNkNBQStCO0FBRS9CLDJDQUE2QjtBQUM3QiwyQkFBa0M7QUFDbEMsMkNBQWtGO0FBQ2xGLDBEQUFvQztBQUNwQyx5Q0FBK0M7QUFDL0MsK0JBQTRCO0FBQzVCLDBEQUEyQztBQUUzQywyQ0FBb0Q7QUFDcEQsZ0RBQXdCO0FBRXhCLE1BQU0sS0FBSyxHQUFHLGlCQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ25GLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBRTFDLEtBQUs7S0FDQSxPQUFPLENBQ0osUUFBUSxFQUNSLHdDQUF3QyxFQUN4QyxDQUFDLEtBQUssRUFBRSxFQUFFO0lBQ04sT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ2pCLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLDBCQUEwQixFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDakYsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsNEJBQTRCLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtRQUNsRixJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSx5Q0FBeUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO1FBQzdGLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO1FBQ2xFLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFB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LENBQUMsT0FBTyxDQUFXLENBQUMsQ0FBQztBQUN4RixDQUFDLENBQUEsQ0FDSjtLQUNBLElBQUksRUFBRTtLQUNOLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDVixLQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQztLQUNyQixPQUFPLENBQUMsU0FBUyxPQUFPLEVBQUUsQ0FBQztLQUMzQixJQUFJLEVBQUU7S0FDTixNQUFNLEVBQUU7S0FDUixhQUFhLEVBQUU7S0FDZixNQUFNLENBQUMsMkRBQTJELENBQUM7S0FDbkUsUUFBUSxDQUFDLEdBQUcsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8qXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyByZXNvbHZlR2F0ZXdheVBhdGgsIHJlc29sdmVXYWxsZXRQYXRoLCBzYW5lUmVhZEZpbGUgfSBmcm9tICcuL3VzZXJ1dGlscyc7XG5pbXBvcnQgSWRlbnRpdGllcyBmcm9tICcuL2lkZW50aWVzJztcbmltcG9ydCB7IGdldEdhdGV3YXlQcm9maWxlIH0gZnJvbSAnLi9nYXRld2F5cyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuL2xvZyc7XG5pbXBvcnQgTWljcm9mYWJQcm9jZXNzb3IgZnJvbSAnLi9taWNyb2ZhYic7XG5cbmltcG9ydCB7IGNyZWF0ZUlmQWJzZW50LCBjbGVhbiB9IGZyb20gJy4vdXNlcnV0aWxzJztcbmltcG9ydCBNU1AgZnJvbSAnLi9tc3AnO1xuXG5jb25zdCBwanNvbiA9IHJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nLCAncGFja2FnZS5qc29uJyksICd1dGYtOCcpO1xuY29uc3QgdmVyc2lvbiA9IEpTT04ucGFyc2UocGpzb24pLnZlcnNpb247XG5cbnlhcmdzXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdlbnJvbGwnLFxuICAgICAgICAnRW5yb2xscyBDQSBpZGVudGl0eSBhbmQgYWRkcyB0byB3YWxsZXQnLFxuICAgICAgICAoeWFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB5YXJncy5vcHRpb25zKHtcbiAgICAgICAgICAgICAgICBwcm9maWxlOiB7IGFsaWFzOiAncCcsIGRlc2NyaWJlOiAnUGF0aCB0byB0aGUgR2F0ZXdheSBmaWxlJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgd2FsbGV0OiB7IGFsaWFzOiAndycsIGRlc2NyaWJlOiAnUGF0aCB0byBhcHBsaWNhdGlvbiB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBuYW1lOiB7IGFsaWFzOiAnbicsIGRlc2NyaWJlOiAnTmFtZSBvZiB0aGUgbmV3IHVzZXIgZm9yIHRoZSBhcHAgd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgZW5yb2xsaWQ6IHsgYWxpYXM6ICdlJywgZGVzY3JpYmU6ICdFbnJvbGxJRCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGVucm9sbHB3ZDogeyBhbGlhczogJ3MnLCBkZXNjcmliZTogJ0Vucm9sbCBwYXNzd29yZCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdFbnJvbGxpbmcgaWRlbnRpdHknIH0pO1xuICAgICAgICAgICAgLy8gcmVzb2x2ZSB0aGUgc3VwcGxpZWQgZ2F0ZXdheSBhbmQgd2FsbGV0IHBhdGhzXG4gICAgICAgICAgICBjb25zdCBnYXRld2F5UGF0aCA9IHJlc29sdmVHYXRld2F5UGF0aChhcmdzWydwcm9maWxlJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSByZXNvbHZlV2FsbGV0UGF0aChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcpO1xuXG4gICAgICAgICAgICBjb25zdCBpZHRvb2xzID0gbmV3IElkZW50aXRpZXMod2FsbGV0UGF0aCwgZ2V0R2F0ZXdheVByb2ZpbGUoZ2F0ZXdheVBhdGgpKTtcbiAgICAgICAgICAgIGF3YWl0IGlkdG9vbHMuZW5yb2xsKGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZywgYXJnc1snZW5yb2xsaWQnXSBhcyBzdHJpbmcsIGFyZ3NbJ2Vucm9sbHB3ZCddIGFzIHN0cmluZyk7XG4gICAgICAgIH0sXG4gICAgKVxuICAgIC5jb21tYW5kKFxuICAgICAgICAnaW1wb3J0JyxcbiAgICAgICAgJ0ltcG9ydHMgSUJQIGlkZW50aXR5IGFuZCBhZGRzIHRvIGFwcGxpY2F0aW9uIHdhbGxldCcsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gYXBwbGljYXRpb24gd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgbXNwaWQ6IHsgYWxpYXM6ICdtJywgZGVzY3JpYmU6ICdNU1BJRCB0byBhc3NpZ24gaW4gdGhpcyB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBqc29uOiB7IGFsaWFzOiAnaicsIGRlc2NyaWJlOiAnRmlsZSBvZiB0aGUgSlNPTiBpZGVudGl0eScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGNvbXBhdDogeyBhbGlhczogJ2MnLCBkZWNyaWJlOiAnU2V0IHRvIHVzZSB0aGUgMS40IHdhbGxldCBmb3JtYXQnLCBkZWZhdWx0OiBmYWxzZSwgdHlwZTogJ2Jvb2xlYW4nIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRld2FsbGV0OiB7XG4gICAgICAgICAgICAgICAgICAgIGFsaWFzOiAncicsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaWJlOiAnQ3JlYXRlIHRoZSB3YWxsZXQgaWYgbm90IHByZXNlbnQnLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxvZyh7IG1zZzogJ0FkZGluZyBJQlAgaWRlbnRpdHknIH0pO1xuICAgICAgICAgICAgLy8gcmVzb2x2ZSB0aGUgc3VwcGxpZWQgZ2F0ZXdheSBhbmQgd2FsbGV0IHBhdGhzXG4gICAgICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcmVzb2x2ZVdhbGxldFBhdGgoYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nLCBhcmdzWydjcmVhdGV3YWxsZXQnXSBhcyBib29sZWFuKTtcbiAgICAgICAgICAgIGNvbnN0IGlkdG9vbHMgPSBuZXcgSWRlbnRpdGllcyh3YWxsZXRQYXRoKTtcbiAgICAgICAgICAgIGF3YWl0IGlkdG9vbHMuaW1wb3J0VG9XYWxsZXQoXG4gICAgICAgICAgICAgICAgc2FuZVJlYWRGaWxlKGFyZ3NbJ2pzb24nXSBhcyBzdHJpbmcpLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ21zcGlkJ10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ2NvbXBhdCddIGFzIGJvb2xlYW4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuICAgIClcbiAgICAuY29tbWFuZChcbiAgICAgICAgJ2xzJyxcbiAgICAgICAgJ0xpc3RzIEFwcGxpY2F0aW9uIFdhbGxldCBpZGVudGl0aWVzJyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgd2FsbGV0OiB7IGFsaWFzOiAndycsIGRlc2NyaWJlOiAnUGF0aCB0byBhcHBsaWNhdGlvbiB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICAgICAgLy8gcmVzb2x2ZSB0aGUgc3VwcGxpZWQgZ2F0ZXdheSBhbmQgd2FsbGV0IHBhdGhzXG4gICAgICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcmVzb2x2ZVdhbGxldFBhdGgoYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIGxvZyh7IG1zZzogJ0xpc3RpbmcgYXBwbGljYXRpb24gd2FsbGV0IGlkZW50aXRpZXMnLCB2YWw6IHdhbGxldFBhdGggfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGlkdG9vbHMgPSBuZXcgSWRlbnRpdGllcyh3YWxsZXRQYXRoKTtcbiAgICAgICAgICAgIGlkdG9vbHMubGlzdCgpO1xuICAgICAgICB9LFxuICAgIClcbiAgICAuY29tbWFuZChcbiAgICAgICAgJ21pY3JvZmFiJyxcbiAgICAgICAgJ1Byb2Nlc3MgdGhlIGlicC1taWNyb2ZhYiBvdXRwdXQnLFxuICAgICAgICAoeWFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB5YXJncy5vcHRpb25zKHtcbiAgICAgICAgICAgICAgICB3YWxsZXQ6IHsgYWxpYXM6ICd3JywgZGVzY3JpYmU6ICdQYXRoIHRvIHBhcmVudCBkaXJlY3Rvcnkgb2YgYXBwbGljYXRpb24gd2FsbGV0cycsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHByb2ZpbGU6IHsgYWxpYXM6ICdwJywgZGVzY3JpYmU6ICdQYXRoIHRvIHRoZSBwYXJlbnQgZGlyZWN0b3J5IG9mIEdhdGV3YXkgZmlsZXMnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBtc3Bjb25maWc6IHsgYWxpYXM6ICdtJywgZGVzY3JpYmU6ICdQYXRoIHRvIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGUgTVNQIGNvbmZpZycsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBhbGlhczogJ2MnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmliZTogJ0ZpbGUgd2l0aCBKU09OIGNvbmZpZ3VyYXRpb24gZnJvbSBNaWNyb2ZhYiAgLSBmb3Igc3RkaW4nLFxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiAnLScsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmb3JjZTogeyBhbGlhczogJ2YnLCBkZXNjcmliZTogJ0ZvcmNlIGNsZWFuaW5nIG9mIGRpcmVjdG9yaWVzJywgdHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OiBmYWxzZSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjcmVhdGVJZkFic2VudChhcmdzWydwcm9maWxlJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIGNyZWF0ZUlmQWJzZW50KGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBjcmVhdGVJZkFic2VudChhcmdzWydtc3Bjb25maWcnXSBhcyBzdHJpbmcpO1xuXG4gICAgICAgICAgICBpZiAoYXJncy5mb3JjZSkge1xuICAgICAgICAgICAgICAgIGNsZWFuKGFyZ3NbJ3Byb2ZpbGUnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgICAgIGNsZWFuKGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAgICAgY2xlYW4oYXJnc1snbXNwY29uZmlnJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbWljcm9GYWJQcm9jZXNzb3IgPSBuZXcgTWljcm9mYWJQcm9jZXNzb3IoKTtcbiAgICAgICAgICAgIGF3YWl0IG1pY3JvRmFiUHJvY2Vzc29yLnByb2Nlc3MoXG4gICAgICAgICAgICAgICAgYXJnc1snY29uZmlnJ10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ3Byb2ZpbGUnXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ21zcGNvbmZpZyddIGFzIHN0cmluZyxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICB9LFxuICAgIClcbiAgICAuY29tbWFuZChcbiAgICAgICAgJ21zcCcsXG4gICAgICAgICdJbXBvcnRzIElCUCBpZGVudGl0eSB0byBNU1AgZm9yIFBlZXIgY29tbWFuZHMnLFxuICAgICAgICAoeWFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB5YXJncy5vcHRpb25zKHtcbiAgICAgICAgICAgICAgICBtc3Bjb25maWc6IHsgYWxpYXM6ICdkJywgZGVzY3JpYmU6ICdQYXRoIHRvIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGUgTVNQIGNvbmZpZycsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIG1zcGlkOiB7IGFsaWFzOiAnbScsIGRlc2NyaWJlOiAnTVNQSUQgdG8gYXNzaWduIGluIHRoaXMgd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAganNvbjogeyBhbGlhczogJ2onLCBkZXNjcmliZTogJ0ZpbGUgb2YgdGhlIEpTT04gaWRlbnRpdHknLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICAgICAgbG9nKHsgbXNnOiAnQ3JlYXRpbmcgTVNQIHN0cnVjdHVyZScgfSk7XG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgICAgIGNvbnN0IG1zcCA9IG5ldyBNU1AoKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb3RkaXIgPSBjcmVhdGVJZkFic2VudChhcmdzWydtc3Bjb25maWcnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgbXNwLndyaXRlSWQocm9vdGRpciwgc2FuZVJlYWRGaWxlKGFyZ3NbJ2pzb24nXSBhcyBzdHJpbmcpLCBhcmdzWydtc3BpZCddIGFzIHN0cmluZyk7XG4gICAgICAgIH0sXG4gICAgKVxuICAgIC5oZWxwKClcbiAgICAud3JhcChudWxsKVxuICAgIC5hbGlhcygndicsICd2ZXJzaW9uJylcbiAgICAudmVyc2lvbihgd2VmdCB2JHt2ZXJzaW9ufWApXG4gICAgLmhlbHAoKVxuICAgIC5zdHJpY3QoKVxuICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAuZXBpbG9nKCdGb3IgdXNhZ2Ugc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9oeXBlcmxlZGVuZGFyeS93ZWZ0aWxpdHknKVxuICAgIC5kZXNjcmliZSgndicsICdzaG93IHZlcnNpb24gaW5mb3JtYXRpb24nKS5hcmd2O1xuIl19