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
const source_map_support_1 = __importDefault(require("source-map-support"));
source_map_support_1.default.install();
const yargs = __importStar(require("yargs"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
const userutils_1 = require("./userutils");
const identies_1 = __importDefault(require("./identies"));
const gateways_1 = require("./gateways");
const log_1 = require("./log");
const microfab_1 = require("./microfab");
const msp_1 = __importDefault(require("./msp"));
const pjson = fs_1.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8');
const version = JSON.parse(pjson).version;
log_1.enableCliLog();
yargs
    .command('enroll', 'Enrolls CA identity and adds to wallet', (yargs) => {
    return yargs.options({
        profile: { alias: 'p', describe: 'Path to the Gateway Profile file', demandOption: true },
        wallet: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
        name: { alias: 'n', describe: 'Name of the new user for the app wallet', demandOption: true },
        enrollid: { alias: 'e', describe: 'Enroll ID', demandOption: true },
        enrollpwd: { alias: 's', describe: 'Enroll password', demandOption: true },
        createwallet: {
            alias: 'r',
            describe: 'Create the wallet if not present',
            type: 'boolean',
            default: false,
        },
        compat: { alias: 'c', decribe: 'Set to use the 1.4 wallet format', default: false, type: 'boolean' },
    });
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    log_1.log({ msg: 'Enrolling identity' });
    try {
        const gatewayPath = userutils_1.resolveGatewayPath(args['profile']);
        const walletPath = userutils_1.resolveWalletPath(args['wallet'], args['createwallet']);
        const idtools = new identies_1.default(walletPath, args['compat'], gateways_1.getGatewayProfile(gatewayPath));
        yield idtools.enroll(args['name'], args['enrollid'], args['enrollpwd']);
    }
    catch (e) {
        log_1.log({ msg: e.message, error: true });
        process.exit(1);
    }
}))
    .command('register', 'Registers CA identity and returns the enrollSecret', (yargs) => {
    return yargs.options({
        profile: { alias: 'p', describe: 'Path to the Gateway file', demandOption: true },
        wallet: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
        enrollid: { alias: 'e', describe: 'Name of the new enroll id', demandOption: true },
        adminName: { alias: 'a', describe: 'Admin Identity to use', demandOption: true },
        affiliation: {
            alias: 'd',
            describe: 'Affiliation (department) for the identity',
            demandOption: false,
            default: '',
        },
        compat: { alias: 'c', decribe: 'Set to use the 1.4 wallet format', default: false, type: 'boolean' },
        quiet: { alias: 'q', describe: ' Quiet - only outpus the secret', default: false, type: 'boolean' },
    });
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    if (args['quiet'] == true) {
        log_1.disableCliLog();
    }
    log_1.log({ msg: 'Registering identity' });
    try {
        const gatewayPath = userutils_1.resolveGatewayPath(args['profile']);
        const walletPath = userutils_1.resolveWalletPath(args['wallet']);
        const idtools = new identies_1.default(walletPath, args['compat'], gateways_1.getGatewayProfile(gatewayPath));
        const enrollPwd = yield idtools.register(args['enrollid'], args['adminName'], args['affiliation']);
        log_1.log({ msg: `Enrollment password is ${enrollPwd}` });
        if (args['quiet']) {
            console.log(enrollPwd);
        }
    }
    catch (e) {
        log_1.enableCliLog();
        log_1.log({ msg: e.message, error: true });
        process.exit(1);
    }
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
    const idtools = new identies_1.default(walletPath, args['compat']);
    yield idtools.importToWallet(userutils_1.saneReadFile(args['json']), args['mspid']);
}))
    .command('export', 'Exports IBP identity and adds to application wallet', (yargs) => {
    return yargs.options({
        wallet: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
        json: { alias: 'j', describe: 'File of the JSON identity', demandOption: true },
        name: { alias: 'n', describe: 'Name of the new user for the app wallet', demandOption: true },
        compat: { alias: 'c', decribe: 'Set to use the 1.4 wallet format', default: false, type: 'boolean' },
    });
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    log_1.log({ msg: 'Exporting identity for IBP' });
    const walletPath = userutils_1.resolveWalletPath(args['wallet'], args['createwallet']);
    const idtools = new identies_1.default(walletPath, args['compat']);
    yield idtools.exportFromWallet(args['name'], args['json']);
}))
    .command('ls', 'Lists Application Wallet identities', (yargs) => {
    return yargs.options({
        wallet: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
        compat: { alias: 'c', decribe: 'Set to use the 1.4 wallet format', default: false, type: 'boolean' },
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
    userutils_1.createIfAbsent(args['profile']);
    userutils_1.createIfAbsent(args['wallet']);
    userutils_1.createIfAbsent(args['mspconfig']);
    if (args.force) {
        userutils_1.clean(args['profile']);
        userutils_1.clean(args['wallet']);
        userutils_1.clean(args['mspconfig']);
    }
    const microFabProcessor = new microfab_1.MicrofabProcessor();
    yield microFabProcessor.processFile(args['config'], args['profile'], args['wallet'], args['mspconfig']);
}))
    .command('mspids', 'Imports IBP identity to MSP for Peer commands', (yargs) => {
    return yargs.options({
        mspconfig: { alias: 'd', describe: 'Path to the root directory of the MSP config', demandOption: true },
        mspid: { alias: 'm', describe: 'MSPID to assign in this wallet', demandOption: true },
        json: { alias: 'j', describe: 'File of the JSON identity', demandOption: true },
    });
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    log_1.log({ msg: 'Creating MSP structure' });
    const msp = new msp_1.default();
    const rootdir = userutils_1.createIfAbsent(args['mspconfig']);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsNEVBQWtEO0FBQ2xELDRCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBRTNCLDZDQUErQjtBQUMvQiwyQ0FBNkI7QUFDN0IsMkJBQWtDO0FBQ2xDLDJDQUF5RztBQUN6RywwREFBb0M7QUFDcEMseUNBQStDO0FBQy9DLCtCQUF5RDtBQUN6RCx5Q0FBK0M7QUFDL0MsZ0RBQXdCO0FBRXhCLE1BQU0sS0FBSyxHQUFHLGlCQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ25GLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBRTFDLGtCQUFZLEVBQUUsQ0FBQztBQUVmLEtBQUs7S0FDQSxPQUFPLENBQ0osUUFBUSxFQUNSLHdDQUF3QyxFQUN4QyxDQUFDLEtBQUssRUFBRSxFQUFFO0lBQ04sT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ2pCLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLGtDQUFrQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDekYsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsNEJBQTRCLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtRQUNsRixJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSx5Q0FBeUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO1FBQzdGLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUs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LEVBQUUsSUFBSSxFQUFFO0tBQ2xGLENBQUMsQ0FBQztBQUNQLENBQUMsRUFDRCxDQUFPLElBQUksRUFBRSxFQUFFO0lBQ1gsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLHdCQUF3QixFQUFFLENBQUMsQ0FBQztJQUV2QyxNQUFNLEdBQUcsR0FBRyxJQUFJLGFBQUcsRUFBRSxDQUFDO0lBQ3RCLE1BQU0sT0FBTyxHQUFHLDBCQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBVyxDQUFDLENBQUM7SUFDNUQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsd0JBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFXLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFXLENBQUMsQ0FBQztBQUN4RixDQUFDLENBQUEsQ0FDSjtLQUNBLElBQUksRUFBRTtLQUVOLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDVixLQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQztLQUNyQixPQUFPLENBQUMsU0FBUyxPQUFPLEVBQUUsQ0FBQztLQUMzQixJQUFJLEVBQUU7S0FDTixNQUFNLEVBQUU7S0FDUixhQUFhLEVBQUU7S0FDZixNQUFNLENBQUMsMkRBQTJELENBQUM7S0FDbkUsUUFBUSxDQUFDLEdBQUcsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8qXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICovXG5pbXBvcnQgc291cmNlTWFwU3VwcG9ydCBmcm9tICdzb3VyY2UtbWFwLXN1cHBvcnQnO1xuc291cmNlTWFwU3VwcG9ydC5pbnN0YWxsKCk7XG5cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyByZXNvbHZlR2F0ZXdheVBhdGgsIHJlc29sdmVXYWxsZXRQYXRoLCBzYW5lUmVhZEZpbGUsIGNyZWF0ZUlmQWJzZW50LCBjbGVhbiB9IGZyb20gJy4vdXNlcnV0aWxzJztcbmltcG9ydCBJZGVudGl0aWVzIGZyb20gJy4vaWRlbnRpZXMnO1xuaW1wb3J0IHsgZ2V0R2F0ZXdheVByb2ZpbGUgfSBmcm9tICcuL2dhdGV3YXlzJztcbmltcG9ydCB7IGxvZywgZW5hYmxlQ2xpTG9nLCBkaXNhYmxlQ2xpTG9nIH0gZnJvbSAnLi9sb2cnO1xuaW1wb3J0IHsgTWljcm9mYWJQcm9jZXNzb3IgfSBmcm9tICcuL21pY3JvZmFiJztcbmltcG9ydCBNU1AgZnJvbSAnLi9tc3AnO1xuXG5jb25zdCBwanNvbiA9IHJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nLCAncGFja2FnZS5qc29uJyksICd1dGYtOCcpO1xuY29uc3QgdmVyc2lvbiA9IEpTT04ucGFyc2UocGpzb24pLnZlcnNpb247XG5cbmVuYWJsZUNsaUxvZygpO1xuXG55YXJnc1xuICAgIC5jb21tYW5kKFxuICAgICAgICAnZW5yb2xsJyxcbiAgICAgICAgJ0Vucm9sbHMgQ0EgaWRlbnRpdHkgYW5kIGFkZHMgdG8gd2FsbGV0JyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgcHJvZmlsZTogeyBhbGlhczogJ3AnLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIEdhdGV3YXkgUHJvZmlsZSBmaWxlJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgd2FsbGV0OiB7IGFsaWFzOiAndycsIGRlc2NyaWJlOiAnUGF0aCB0byBhcHBsaWNhdGlvbiB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBuYW1lOiB7IGFsaWFzOiAnbicsIGRlc2NyaWJlOiAnTmFtZSBvZiB0aGUgbmV3IHVzZXIgZm9yIHRoZSBhcHAgd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgZW5yb2xsaWQ6IHsgYWxpYXM6ICdlJywgZGVzY3JpYmU6ICdFbnJvbGwgSUQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBlbnJvbGxwd2Q6IHsgYWxpYXM6ICdzJywgZGVzY3JpYmU6ICdFbnJvbGwgcGFzc3dvcmQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGV3YWxsZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgYWxpYXM6ICdyJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpYmU6ICdDcmVhdGUgdGhlIHdhbGxldCBpZiBub3QgcHJlc2VudCcsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb21wYXQ6IHsgYWxpYXM6ICdjJywgZGVjcmliZTogJ1NldCB0byB1c2UgdGhlIDEuNCB3YWxsZXQgZm9ybWF0JywgZGVmYXVsdDogZmFsc2UsIHR5cGU6ICdib29sZWFuJyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdFbnJvbGxpbmcgaWRlbnRpdHknIH0pO1xuICAgICAgICAgICAgLy8gcmVzb2x2ZSB0aGUgc3VwcGxpZWQgZ2F0ZXdheSBhbmQgd2FsbGV0IHBhdGhzXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdhdGV3YXlQYXRoID0gcmVzb2x2ZUdhdGV3YXlQYXRoKGFyZ3NbJ3Byb2ZpbGUnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSByZXNvbHZlV2FsbGV0UGF0aChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcsIGFyZ3NbJ2NyZWF0ZXdhbGxldCddIGFzIGJvb2xlYW4pO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgsIGFyZ3NbJ2NvbXBhdCddIGFzIGJvb2xlYW4sIGdldEdhdGV3YXlQcm9maWxlKGdhdGV3YXlQYXRoKSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgaWR0b29scy5lbnJvbGwoYXJnc1snbmFtZSddIGFzIHN0cmluZywgYXJnc1snZW5yb2xsaWQnXSBhcyBzdHJpbmcsIGFyZ3NbJ2Vucm9sbHB3ZCddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgbG9nKHsgbXNnOiBlLm1lc3NhZ2UsIGVycm9yOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdyZWdpc3RlcicsXG4gICAgICAgICdSZWdpc3RlcnMgQ0EgaWRlbnRpdHkgYW5kIHJldHVybnMgdGhlIGVucm9sbFNlY3JldCcsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHByb2ZpbGU6IHsgYWxpYXM6ICdwJywgZGVzY3JpYmU6ICdQYXRoIHRvIHRoZSBHYXRld2F5IGZpbGUnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICB3YWxsZXQ6IHsgYWxpYXM6ICd3JywgZGVzY3JpYmU6ICdQYXRoIHRvIGFwcGxpY2F0aW9uIHdhbGxldCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGVucm9sbGlkOiB7IGFsaWFzOiAnZScsIGRlc2NyaWJlOiAnTmFtZSBvZiB0aGUgbmV3IGVucm9sbCBpZCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGFkbWluTmFtZTogeyBhbGlhczogJ2EnLCBkZXNjcmliZTogJ0FkbWluIElkZW50aXR5IHRvIHVzZScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGFmZmlsaWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGFsaWFzOiAnZCcsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaWJlOiAnQWZmaWxpYXRpb24gKGRlcGFydG1lbnQpIGZvciB0aGUgaWRlbnRpdHknLFxuICAgICAgICAgICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbXBhdDogeyBhbGlhczogJ2MnLCBkZWNyaWJlOiAnU2V0IHRvIHVzZSB0aGUgMS40IHdhbGxldCBmb3JtYXQnLCBkZWZhdWx0OiBmYWxzZSwgdHlwZTogJ2Jvb2xlYW4nIH0sXG4gICAgICAgICAgICAgICAgcXVpZXQ6IHsgYWxpYXM6ICdxJywgZGVzY3JpYmU6ICcgUXVpZXQgLSBvbmx5IG91dHB1cyB0aGUgc2VjcmV0JywgZGVmYXVsdDogZmFsc2UsIHR5cGU6ICdib29sZWFuJyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXJnc1sncXVpZXQnXSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgZGlzYWJsZUNsaUxvZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9nKHsgbXNnOiAnUmVnaXN0ZXJpbmcgaWRlbnRpdHknIH0pO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgICAgICAgICBjb25zdCBnYXRld2F5UGF0aCA9IHJlc29sdmVHYXRld2F5UGF0aChhcmdzWydwcm9maWxlJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcmVzb2x2ZVdhbGxldFBhdGgoYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGlkdG9vbHMgPSBuZXcgSWRlbnRpdGllcyh3YWxsZXRQYXRoLCBhcmdzWydjb21wYXQnXSBhcyBib29sZWFuLCBnZXRHYXRld2F5UHJvZmlsZShnYXRld2F5UGF0aCkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVucm9sbFB3ZCA9IGF3YWl0IGlkdG9vbHMucmVnaXN0ZXIoXG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbJ2Vucm9sbGlkJ10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICBhcmdzWydhZG1pbk5hbWUnXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbJ2FmZmlsaWF0aW9uJ10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgbG9nKHsgbXNnOiBgRW5yb2xsbWVudCBwYXNzd29yZCBpcyAke2Vucm9sbFB3ZH1gIH0pO1xuICAgICAgICAgICAgICAgIGlmIChhcmdzWydxdWlldCddKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVucm9sbFB3ZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGVuYWJsZUNsaUxvZygpO1xuICAgICAgICAgICAgICAgIGxvZyh7IG1zZzogZS5tZXNzYWdlLCBlcnJvcjogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgKVxuICAgIC5jb21tYW5kKFxuICAgICAgICAnaW1wb3J0JyxcbiAgICAgICAgJ0ltcG9ydHMgSUJQIGlkZW50aXR5IGFuZCBhZGRzIHRvIGFwcGxpY2F0aW9uIHdhbGxldCcsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gYXBwbGljYXRpb24gd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgbXNwaWQ6IHsgYWxpYXM6ICdtJywgZGVzY3JpYmU6ICdNU1BJRCB0byBhc3NpZ24gaW4gdGhpcyB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBqc29uOiB7IGFsaWFzOiAnaicsIGRlc2NyaWJlOiAnRmlsZSBvZiB0aGUgSlNPTiBpZGVudGl0eScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGNvbXBhdDogeyBhbGlhczogJ2MnLCBkZWNyaWJlOiAnU2V0IHRvIHVzZSB0aGUgMS40IHdhbGxldCBmb3JtYXQnLCBkZWZhdWx0OiBmYWxzZSwgdHlwZTogJ2Jvb2xlYW4nIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRld2FsbGV0OiB7XG4gICAgICAgICAgICAgICAgICAgIGFsaWFzOiAncicsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaWJlOiAnQ3JlYXRlIHRoZSB3YWxsZXQgaWYgbm90IHByZXNlbnQnLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxvZyh7IG1zZzogJ0FkZGluZyBJQlAgaWRlbnRpdHknIH0pO1xuICAgICAgICAgICAgLy8gcmVzb2x2ZSB0aGUgc3VwcGxpZWQgZ2F0ZXdheSBhbmQgd2FsbGV0IHBhdGhzXG4gICAgICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcmVzb2x2ZVdhbGxldFBhdGgoYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nLCBhcmdzWydjcmVhdGV3YWxsZXQnXSBhcyBib29sZWFuKTtcbiAgICAgICAgICAgIGNvbnN0IGlkdG9vbHMgPSBuZXcgSWRlbnRpdGllcyh3YWxsZXRQYXRoLCBhcmdzWydjb21wYXQnXSBhcyBib29sZWFuKTtcbiAgICAgICAgICAgIGF3YWl0IGlkdG9vbHMuaW1wb3J0VG9XYWxsZXQoc2FuZVJlYWRGaWxlKGFyZ3NbJ2pzb24nXSBhcyBzdHJpbmcpLCBhcmdzWydtc3BpZCddIGFzIHN0cmluZyk7XG4gICAgICAgIH0sXG4gICAgKVxuICAgIC5jb21tYW5kKFxuICAgICAgICAnZXhwb3J0JyxcbiAgICAgICAgJ0V4cG9ydHMgSUJQIGlkZW50aXR5IGFuZCBhZGRzIHRvIGFwcGxpY2F0aW9uIHdhbGxldCcsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gYXBwbGljYXRpb24gd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAganNvbjogeyBhbGlhczogJ2onLCBkZXNjcmliZTogJ0ZpbGUgb2YgdGhlIEpTT04gaWRlbnRpdHknLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBuYW1lOiB7IGFsaWFzOiAnbicsIGRlc2NyaWJlOiAnTmFtZSBvZiB0aGUgbmV3IHVzZXIgZm9yIHRoZSBhcHAgd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgY29tcGF0OiB7IGFsaWFzOiAnYycsIGRlY3JpYmU6ICdTZXQgdG8gdXNlIHRoZSAxLjQgd2FsbGV0IGZvcm1hdCcsIGRlZmF1bHQ6IGZhbHNlLCB0eXBlOiAnYm9vbGVhbicgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICAgICAgbG9nKHsgbXNnOiAnRXhwb3J0aW5nIGlkZW50aXR5IGZvciBJQlAnIH0pO1xuXG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSByZXNvbHZlV2FsbGV0UGF0aChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcsIGFyZ3NbJ2NyZWF0ZXdhbGxldCddIGFzIGJvb2xlYW4pO1xuICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgsIGFyZ3NbJ2NvbXBhdCddIGFzIGJvb2xlYW4pO1xuICAgICAgICAgICAgYXdhaXQgaWR0b29scy5leHBvcnRGcm9tV2FsbGV0KGFyZ3NbJ25hbWUnXSBhcyBzdHJpbmcsIGFyZ3NbJ2pzb24nXSBhcyBzdHJpbmcpO1xuICAgICAgICB9LFxuICAgIClcbiAgICAuY29tbWFuZChcbiAgICAgICAgJ2xzJyxcbiAgICAgICAgJ0xpc3RzIEFwcGxpY2F0aW9uIFdhbGxldCBpZGVudGl0aWVzJyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgd2FsbGV0OiB7IGFsaWFzOiAndycsIGRlc2NyaWJlOiAnUGF0aCB0byBhcHBsaWNhdGlvbiB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBjb21wYXQ6IHsgYWxpYXM6ICdjJywgZGVjcmliZTogJ1NldCB0byB1c2UgdGhlIDEuNCB3YWxsZXQgZm9ybWF0JywgZGVmYXVsdDogZmFsc2UsIHR5cGU6ICdib29sZWFuJyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSByZXNvbHZlV2FsbGV0UGF0aChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgbG9nKHsgbXNnOiAnTGlzdGluZyBhcHBsaWNhdGlvbiB3YWxsZXQgaWRlbnRpdGllcycsIHZhbDogd2FsbGV0UGF0aCB9KTtcblxuICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgpO1xuICAgICAgICAgICAgaWR0b29scy5saXN0KCk7XG4gICAgICAgIH0sXG4gICAgKVxuICAgIC5jb21tYW5kKFxuICAgICAgICAnbWljcm9mYWInLFxuICAgICAgICAnUHJvY2VzcyB0aGUgaWJwLW1pY3JvZmFiIG91dHB1dCcsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gcGFyZW50IGRpcmVjdG9yeSBvZiBhcHBsaWNhdGlvbiB3YWxsZXRzJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgcHJvZmlsZTogeyBhbGlhczogJ3AnLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIHBhcmVudCBkaXJlY3Rvcnkgb2YgR2F0ZXdheSBmaWxlcycsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIG1zcGNvbmZpZzogeyBhbGlhczogJ20nLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoZSBNU1AgY29uZmlnJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGFsaWFzOiAnYycsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaWJlOiAnRmlsZSB3aXRoIEpTT04gY29uZmlndXJhdGlvbiBmcm9tIE1pY3JvZmFiICAtIGZvciBzdGRpbicsXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6ICctJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZvcmNlOiB7IGFsaWFzOiAnZicsIGRlc2NyaWJlOiAnRm9yY2UgY2xlYW5pbmcgb2YgZGlyZWN0b3JpZXMnLCB0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6IGZhbHNlIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNyZWF0ZUlmQWJzZW50KGFyZ3NbJ3Byb2ZpbGUnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgY3JlYXRlSWZBYnNlbnQoYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIGNyZWF0ZUlmQWJzZW50KGFyZ3NbJ21zcGNvbmZpZyddIGFzIHN0cmluZyk7XG5cbiAgICAgICAgICAgIGlmIChhcmdzLmZvcmNlKSB7XG4gICAgICAgICAgICAgICAgY2xlYW4oYXJnc1sncHJvZmlsZSddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAgICAgY2xlYW4oYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgICAgICBjbGVhbihhcmdzWydtc3Bjb25maWcnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtaWNyb0ZhYlByb2Nlc3NvciA9IG5ldyBNaWNyb2ZhYlByb2Nlc3NvcigpO1xuICAgICAgICAgICAgYXdhaXQgbWljcm9GYWJQcm9jZXNzb3IucHJvY2Vzc0ZpbGUoXG4gICAgICAgICAgICAgICAgYXJnc1snY29uZmlnJ10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ3Byb2ZpbGUnXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ21zcGNvbmZpZyddIGFzIHN0cmluZyxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG4gICAgKVxuICAgIC5jb21tYW5kKFxuICAgICAgICAnbXNwaWRzJyxcbiAgICAgICAgJ0ltcG9ydHMgSUJQIGlkZW50aXR5IHRvIE1TUCBmb3IgUGVlciBjb21tYW5kcycsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIG1zcGNvbmZpZzogeyBhbGlhczogJ2QnLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoZSBNU1AgY29uZmlnJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgbXNwaWQ6IHsgYWxpYXM6ICdtJywgZGVzY3JpYmU6ICdNU1BJRCB0byBhc3NpZ24gaW4gdGhpcyB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBqc29uOiB7IGFsaWFzOiAnaicsIGRlc2NyaWJlOiAnRmlsZSBvZiB0aGUgSlNPTiBpZGVudGl0eScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdDcmVhdGluZyBNU1Agc3RydWN0dXJlJyB9KTtcbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgY29uc3QgbXNwID0gbmV3IE1TUCgpO1xuICAgICAgICAgICAgY29uc3Qgcm9vdGRpciA9IGNyZWF0ZUlmQWJzZW50KGFyZ3NbJ21zcGNvbmZpZyddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBtc3Aud3JpdGVJZChyb290ZGlyLCBzYW5lUmVhZEZpbGUoYXJnc1snanNvbiddIGFzIHN0cmluZyksIGFyZ3NbJ21zcGlkJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmhlbHAoKVxuXG4gICAgLndyYXAobnVsbClcbiAgICAuYWxpYXMoJ3YnLCAndmVyc2lvbicpXG4gICAgLnZlcnNpb24oYHdlZnQgdiR7dmVyc2lvbn1gKVxuICAgIC5oZWxwKClcbiAgICAuc3RyaWN0KClcbiAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgLmVwaWxvZygnRm9yIHVzYWdlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vaHlwZXJsZWRlbmRhcnkvd2VmdGlsaXR5JylcbiAgICAuZGVzY3JpYmUoJ3YnLCAnc2hvdyB2ZXJzaW9uIGluZm9ybWF0aW9uJykuYXJndjtcbiJdfQ==