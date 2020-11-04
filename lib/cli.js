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
    const idtools = new identies_1.default(walletPath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsNEVBQWtEO0FBQ2xELDRCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBRTNCLDZDQUErQjtBQUMvQiwyQ0FBNkI7QUFDN0IsMkJBQWtDO0FBQ2xDLDJDQUF5RztBQUN6RywwREFBb0M7QUFDcEMseUNBQStDO0FBQy9DLCtCQUF5RDtBQUN6RCx5Q0FBK0M7QUFDL0MsZ0RBQXdCO0FBRXhCLE1BQU0sS0FBSyxHQUFHLGlCQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ25GLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBRTFDLGtCQUFZLEVBQUUsQ0FBQztBQUVmLEtBQUs7S0FDQSxPQUFPLENBQ0osUUFBUSxFQUNSLHdDQUF3QyxFQUN4QyxDQUFDLEtBQUssRUFBRSxFQUFFO0lBQ04sT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ2pCLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLGtDQUFrQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDekYsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsNEJBQTRCLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtRQUNsRixJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSx5Q0FBeUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO1FBQzdGLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUs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QyxDQUFDO0FBQ1AsQ0FBQyxFQUNELENBQU8sSUFBSSxFQUFFLEVBQUU7SUFDWCxTQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDO0lBRXZDLE1BQU0sR0FBRyxHQUFHLElBQUksYUFBRyxFQUFFLENBQUM7SUFDdEIsTUFBTSxPQUFPLEdBQUcsMEJBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFXLENBQUMsQ0FBQztJQUM1RCxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSx3QkFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQVcsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQVcsQ0FBQyxDQUFDO0FBQ3hGLENBQUMsQ0FBQSxDQUNKO0tBQ0EsSUFBSSxFQUFFO0tBRU4sSUFBSSxDQUFDLElBQUksQ0FBQztLQUNWLEtBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDO0tBQ3JCLE9BQU8sQ0FBQyxTQUFTLE9BQU8sRUFBRSxDQUFDO0tBQzNCLElBQUksRUFBRTtLQUNOLE1BQU0sRUFBRTtLQUNSLGFBQWEsRUFBRTtLQUNmLE1BQU0sQ0FBQywyREFBMkQsQ0FBQztLQUNuRSxRQUFRLENBQUMsR0FBRyxFQUFFLDBCQUEwQixDQUFDLENBQUMsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLypcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4gKi9cbmltcG9ydCBzb3VyY2VNYXBTdXBwb3J0IGZyb20gJ3NvdXJjZS1tYXAtc3VwcG9ydCc7XG5zb3VyY2VNYXBTdXBwb3J0Lmluc3RhbGwoKTtcblxuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHJlc29sdmVHYXRld2F5UGF0aCwgcmVzb2x2ZVdhbGxldFBhdGgsIHNhbmVSZWFkRmlsZSwgY3JlYXRlSWZBYnNlbnQsIGNsZWFuIH0gZnJvbSAnLi91c2VydXRpbHMnO1xuaW1wb3J0IElkZW50aXRpZXMgZnJvbSAnLi9pZGVudGllcyc7XG5pbXBvcnQgeyBnZXRHYXRld2F5UHJvZmlsZSB9IGZyb20gJy4vZ2F0ZXdheXMnO1xuaW1wb3J0IHsgbG9nLCBlbmFibGVDbGlMb2csIGRpc2FibGVDbGlMb2cgfSBmcm9tICcuL2xvZyc7XG5pbXBvcnQgeyBNaWNyb2ZhYlByb2Nlc3NvciB9IGZyb20gJy4vbWljcm9mYWInO1xuaW1wb3J0IE1TUCBmcm9tICcuL21zcCc7XG5cbmNvbnN0IHBqc29uID0gcmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICdwYWNrYWdlLmpzb24nKSwgJ3V0Zi04Jyk7XG5jb25zdCB2ZXJzaW9uID0gSlNPTi5wYXJzZShwanNvbikudmVyc2lvbjtcblxuZW5hYmxlQ2xpTG9nKCk7XG5cbnlhcmdzXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdlbnJvbGwnLFxuICAgICAgICAnRW5yb2xscyBDQSBpZGVudGl0eSBhbmQgYWRkcyB0byB3YWxsZXQnLFxuICAgICAgICAoeWFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB5YXJncy5vcHRpb25zKHtcbiAgICAgICAgICAgICAgICBwcm9maWxlOiB7IGFsaWFzOiAncCcsIGRlc2NyaWJlOiAnUGF0aCB0byB0aGUgR2F0ZXdheSBQcm9maWxlIGZpbGUnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICB3YWxsZXQ6IHsgYWxpYXM6ICd3JywgZGVzY3JpYmU6ICdQYXRoIHRvIGFwcGxpY2F0aW9uIHdhbGxldCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIG5hbWU6IHsgYWxpYXM6ICduJywgZGVzY3JpYmU6ICdOYW1lIG9mIHRoZSBuZXcgdXNlciBmb3IgdGhlIGFwcCB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBlbnJvbGxpZDogeyBhbGlhczogJ2UnLCBkZXNjcmliZTogJ0Vucm9sbCBJRCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGVucm9sbHB3ZDogeyBhbGlhczogJ3MnLCBkZXNjcmliZTogJ0Vucm9sbCBwYXNzd29yZCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZXdhbGxldDoge1xuICAgICAgICAgICAgICAgICAgICBhbGlhczogJ3InLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmliZTogJ0NyZWF0ZSB0aGUgd2FsbGV0IGlmIG5vdCBwcmVzZW50JyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbXBhdDogeyBhbGlhczogJ2MnLCBkZWNyaWJlOiAnU2V0IHRvIHVzZSB0aGUgMS40IHdhbGxldCBmb3JtYXQnLCBkZWZhdWx0OiBmYWxzZSwgdHlwZTogJ2Jvb2xlYW4nIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxvZyh7IG1zZzogJ0Vucm9sbGluZyBpZGVudGl0eScgfSk7XG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ2F0ZXdheVBhdGggPSByZXNvbHZlR2F0ZXdheVBhdGgoYXJnc1sncHJvZmlsZSddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHJlc29sdmVXYWxsZXRQYXRoKGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZywgYXJnc1snY3JlYXRld2FsbGV0J10gYXMgYm9vbGVhbik7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpZHRvb2xzID0gbmV3IElkZW50aXRpZXMod2FsbGV0UGF0aCwgYXJnc1snY29tcGF0J10gYXMgYm9vbGVhbiwgZ2V0R2F0ZXdheVByb2ZpbGUoZ2F0ZXdheVBhdGgpKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBpZHRvb2xzLmVucm9sbChhcmdzWyduYW1lJ10gYXMgc3RyaW5nLCBhcmdzWydlbnJvbGxpZCddIGFzIHN0cmluZywgYXJnc1snZW5yb2xscHdkJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBsb2coeyBtc2c6IGUubWVzc2FnZSwgZXJyb3I6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIClcbiAgICAuY29tbWFuZChcbiAgICAgICAgJ3JlZ2lzdGVyJyxcbiAgICAgICAgJ1JlZ2lzdGVycyBDQSBpZGVudGl0eSBhbmQgcmV0dXJucyB0aGUgZW5yb2xsU2VjcmV0JyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgcHJvZmlsZTogeyBhbGlhczogJ3AnLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIEdhdGV3YXkgZmlsZScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gYXBwbGljYXRpb24gd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgZW5yb2xsaWQ6IHsgYWxpYXM6ICdlJywgZGVzY3JpYmU6ICdOYW1lIG9mIHRoZSBuZXcgZW5yb2xsIGlkJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgYWRtaW5OYW1lOiB7IGFsaWFzOiAnYScsIGRlc2NyaWJlOiAnQWRtaW4gSWRlbnRpdHkgdG8gdXNlJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgYWZmaWxpYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgYWxpYXM6ICdkJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpYmU6ICdBZmZpbGlhdGlvbiAoZGVwYXJ0bWVudCkgZm9yIHRoZSBpZGVudGl0eScsXG4gICAgICAgICAgICAgICAgICAgIGRlbWFuZE9wdGlvbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6ICcnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29tcGF0OiB7IGFsaWFzOiAnYycsIGRlY3JpYmU6ICdTZXQgdG8gdXNlIHRoZSAxLjQgd2FsbGV0IGZvcm1hdCcsIGRlZmF1bHQ6IGZhbHNlLCB0eXBlOiAnYm9vbGVhbicgfSxcbiAgICAgICAgICAgICAgICBxdWlldDogeyBhbGlhczogJ3EnLCBkZXNjcmliZTogJyBRdWlldCAtIG9ubHkgb3V0cHVzIHRoZSBzZWNyZXQnLCBkZWZhdWx0OiBmYWxzZSwgdHlwZTogJ2Jvb2xlYW4nIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGlmIChhcmdzWydxdWlldCddID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBkaXNhYmxlQ2xpTG9nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdSZWdpc3RlcmluZyBpZGVudGl0eScgfSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgICAgIGNvbnN0IGdhdGV3YXlQYXRoID0gcmVzb2x2ZUdhdGV3YXlQYXRoKGFyZ3NbJ3Byb2ZpbGUnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSByZXNvbHZlV2FsbGV0UGF0aChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgsIGFyZ3NbJ2NvbXBhdCddIGFzIGJvb2xlYW4sIGdldEdhdGV3YXlQcm9maWxlKGdhdGV3YXlQYXRoKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5yb2xsUHdkID0gYXdhaXQgaWR0b29scy5yZWdpc3RlcihcbiAgICAgICAgICAgICAgICAgICAgYXJnc1snZW5yb2xsaWQnXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbJ2FkbWluTmFtZSddIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgYXJnc1snYWZmaWxpYXRpb24nXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBsb2coeyBtc2c6IGBFbnJvbGxtZW50IHBhc3N3b3JkIGlzICR7ZW5yb2xsUHdkfWAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3NbJ3F1aWV0J10pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZW5yb2xsUHdkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgZW5hYmxlQ2xpTG9nKCk7XG4gICAgICAgICAgICAgICAgbG9nKHsgbXNnOiBlLm1lc3NhZ2UsIGVycm9yOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdpbXBvcnQnLFxuICAgICAgICAnSW1wb3J0cyBJQlAgaWRlbnRpdHkgYW5kIGFkZHMgdG8gYXBwbGljYXRpb24gd2FsbGV0JyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgd2FsbGV0OiB7IGFsaWFzOiAndycsIGRlc2NyaWJlOiAnUGF0aCB0byBhcHBsaWNhdGlvbiB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBtc3BpZDogeyBhbGlhczogJ20nLCBkZXNjcmliZTogJ01TUElEIHRvIGFzc2lnbiBpbiB0aGlzIHdhbGxldCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGpzb246IHsgYWxpYXM6ICdqJywgZGVzY3JpYmU6ICdGaWxlIG9mIHRoZSBKU09OIGlkZW50aXR5JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgY29tcGF0OiB7IGFsaWFzOiAnYycsIGRlY3JpYmU6ICdTZXQgdG8gdXNlIHRoZSAxLjQgd2FsbGV0IGZvcm1hdCcsIGRlZmF1bHQ6IGZhbHNlLCB0eXBlOiAnYm9vbGVhbicgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGV3YWxsZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgYWxpYXM6ICdyJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpYmU6ICdDcmVhdGUgdGhlIHdhbGxldCBpZiBub3QgcHJlc2VudCcsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICAgICAgbG9nKHsgbXNnOiAnQWRkaW5nIElCUCBpZGVudGl0eScgfSk7XG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSByZXNvbHZlV2FsbGV0UGF0aChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcsIGFyZ3NbJ2NyZWF0ZXdhbGxldCddIGFzIGJvb2xlYW4pO1xuICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgsIGFyZ3NbJ2NvbXBhdCddIGFzIGJvb2xlYW4pO1xuICAgICAgICAgICAgYXdhaXQgaWR0b29scy5pbXBvcnRUb1dhbGxldChzYW5lUmVhZEZpbGUoYXJnc1snanNvbiddIGFzIHN0cmluZyksIGFyZ3NbJ21zcGlkJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdleHBvcnQnLFxuICAgICAgICAnRXhwb3J0cyBJQlAgaWRlbnRpdHkgYW5kIGFkZHMgdG8gYXBwbGljYXRpb24gd2FsbGV0JyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgd2FsbGV0OiB7IGFsaWFzOiAndycsIGRlc2NyaWJlOiAnUGF0aCB0byBhcHBsaWNhdGlvbiB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBqc29uOiB7IGFsaWFzOiAnaicsIGRlc2NyaWJlOiAnRmlsZSBvZiB0aGUgSlNPTiBpZGVudGl0eScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIG5hbWU6IHsgYWxpYXM6ICduJywgZGVzY3JpYmU6ICdOYW1lIG9mIHRoZSBuZXcgdXNlciBmb3IgdGhlIGFwcCB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBjb21wYXQ6IHsgYWxpYXM6ICdjJywgZGVjcmliZTogJ1NldCB0byB1c2UgdGhlIDEuNCB3YWxsZXQgZm9ybWF0JywgZGVmYXVsdDogZmFsc2UsIHR5cGU6ICdib29sZWFuJyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdFeHBvcnRpbmcgaWRlbnRpdHkgZm9yIElCUCcgfSk7XG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSByZXNvbHZlV2FsbGV0UGF0aChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcsIGFyZ3NbJ2NyZWF0ZXdhbGxldCddIGFzIGJvb2xlYW4pO1xuICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgpO1xuICAgICAgICAgICAgYXdhaXQgaWR0b29scy5leHBvcnRGcm9tV2FsbGV0KGFyZ3NbJ25hbWUnXSBhcyBzdHJpbmcsIGFyZ3NbJ2pzb24nXSBhcyBzdHJpbmcpO1xuICAgICAgICB9LFxuICAgIClcbiAgICAuY29tbWFuZChcbiAgICAgICAgJ2xzJyxcbiAgICAgICAgJ0xpc3RzIEFwcGxpY2F0aW9uIFdhbGxldCBpZGVudGl0aWVzJyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgd2FsbGV0OiB7IGFsaWFzOiAndycsIGRlc2NyaWJlOiAnUGF0aCB0byBhcHBsaWNhdGlvbiB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBjb21wYXQ6IHsgYWxpYXM6ICdjJywgZGVjcmliZTogJ1NldCB0byB1c2UgdGhlIDEuNCB3YWxsZXQgZm9ybWF0JywgZGVmYXVsdDogZmFsc2UsIHR5cGU6ICdib29sZWFuJyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSByZXNvbHZlV2FsbGV0UGF0aChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgbG9nKHsgbXNnOiAnTGlzdGluZyBhcHBsaWNhdGlvbiB3YWxsZXQgaWRlbnRpdGllcycsIHZhbDogd2FsbGV0UGF0aCB9KTtcblxuICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgpO1xuICAgICAgICAgICAgaWR0b29scy5saXN0KCk7XG4gICAgICAgIH0sXG4gICAgKVxuICAgIC5jb21tYW5kKFxuICAgICAgICAnbWljcm9mYWInLFxuICAgICAgICAnUHJvY2VzcyB0aGUgaWJwLW1pY3JvZmFiIG91dHB1dCcsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gcGFyZW50IGRpcmVjdG9yeSBvZiBhcHBsaWNhdGlvbiB3YWxsZXRzJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgcHJvZmlsZTogeyBhbGlhczogJ3AnLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIHBhcmVudCBkaXJlY3Rvcnkgb2YgR2F0ZXdheSBmaWxlcycsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIG1zcGNvbmZpZzogeyBhbGlhczogJ20nLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoZSBNU1AgY29uZmlnJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGFsaWFzOiAnYycsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaWJlOiAnRmlsZSB3aXRoIEpTT04gY29uZmlndXJhdGlvbiBmcm9tIE1pY3JvZmFiICAtIGZvciBzdGRpbicsXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6ICctJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZvcmNlOiB7IGFsaWFzOiAnZicsIGRlc2NyaWJlOiAnRm9yY2UgY2xlYW5pbmcgb2YgZGlyZWN0b3JpZXMnLCB0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6IGZhbHNlIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNyZWF0ZUlmQWJzZW50KGFyZ3NbJ3Byb2ZpbGUnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgY3JlYXRlSWZBYnNlbnQoYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIGNyZWF0ZUlmQWJzZW50KGFyZ3NbJ21zcGNvbmZpZyddIGFzIHN0cmluZyk7XG5cbiAgICAgICAgICAgIGlmIChhcmdzLmZvcmNlKSB7XG4gICAgICAgICAgICAgICAgY2xlYW4oYXJnc1sncHJvZmlsZSddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAgICAgY2xlYW4oYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgICAgICBjbGVhbihhcmdzWydtc3Bjb25maWcnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtaWNyb0ZhYlByb2Nlc3NvciA9IG5ldyBNaWNyb2ZhYlByb2Nlc3NvcigpO1xuICAgICAgICAgICAgYXdhaXQgbWljcm9GYWJQcm9jZXNzb3IucHJvY2Vzc0ZpbGUoXG4gICAgICAgICAgICAgICAgYXJnc1snY29uZmlnJ10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ3Byb2ZpbGUnXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ21zcGNvbmZpZyddIGFzIHN0cmluZyxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG4gICAgKVxuICAgIC5jb21tYW5kKFxuICAgICAgICAnbXNwaWRzJyxcbiAgICAgICAgJ0ltcG9ydHMgSUJQIGlkZW50aXR5IHRvIE1TUCBmb3IgUGVlciBjb21tYW5kcycsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIG1zcGNvbmZpZzogeyBhbGlhczogJ2QnLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoZSBNU1AgY29uZmlnJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgbXNwaWQ6IHsgYWxpYXM6ICdtJywgZGVzY3JpYmU6ICdNU1BJRCB0byBhc3NpZ24gaW4gdGhpcyB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBqc29uOiB7IGFsaWFzOiAnaicsIGRlc2NyaWJlOiAnRmlsZSBvZiB0aGUgSlNPTiBpZGVudGl0eScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdDcmVhdGluZyBNU1Agc3RydWN0dXJlJyB9KTtcbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgY29uc3QgbXNwID0gbmV3IE1TUCgpO1xuICAgICAgICAgICAgY29uc3Qgcm9vdGRpciA9IGNyZWF0ZUlmQWJzZW50KGFyZ3NbJ21zcGNvbmZpZyddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBtc3Aud3JpdGVJZChyb290ZGlyLCBzYW5lUmVhZEZpbGUoYXJnc1snanNvbiddIGFzIHN0cmluZyksIGFyZ3NbJ21zcGlkJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmhlbHAoKVxuXG4gICAgLndyYXAobnVsbClcbiAgICAuYWxpYXMoJ3YnLCAndmVyc2lvbicpXG4gICAgLnZlcnNpb24oYHdlZnQgdiR7dmVyc2lvbn1gKVxuICAgIC5oZWxwKClcbiAgICAuc3RyaWN0KClcbiAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgLmVwaWxvZygnRm9yIHVzYWdlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vaHlwZXJsZWRlbmRhcnkvd2VmdGlsaXR5JylcbiAgICAuZGVzY3JpYmUoJ3YnLCAnc2hvdyB2ZXJzaW9uIGluZm9ybWF0aW9uJykuYXJndjtcbiJdfQ==