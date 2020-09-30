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
    const idtools = new identies_1.default(walletPath);
    yield idtools.importToWallet(userutils_1.saneReadFile(args['json']), args['mspid']);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsNkNBQStCO0FBRS9CLDJDQUE2QjtBQUM3QiwyQkFBa0M7QUFDbEMsMkNBQWtGO0FBQ2xGLDBEQUFvQztBQUNwQyx5Q0FBK0M7QUFDL0MsK0JBQTRCO0FBQzVCLDBEQUEyQztBQUUzQywyQ0FBb0Q7QUFFcEQsTUFBTSxLQUFLLEdBQUcsaUJBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFFMUMsS0FBSztLQUNBLE9BQU8sQ0FDSixRQUFRLEVBQ1Isd0NBQXdDLEVBQ3hDLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDTixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDakIsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtRQUNqRixNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSw0QkFBNEIsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO1FBQ2xGLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLHlDQUF5QyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDN0YsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDbEUsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsaUJBQWlC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M0IsSUFBSSxDQUFDLFFBQVEsQ0FBVyxFQUN4QixJQUFJLENBQUMsU0FBUyxDQUFXLEVBQ3pCLElBQUksQ0FBQyxRQUFRLENBQVcsRUFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBVyxDQUM5QixDQUFDO0FBR04sQ0FBQyxDQUFBLENBQ0o7S0FDQSxJQUFJLEVBQUU7S0FDTixJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ1YsS0FBSyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUM7S0FDckIsT0FBTyxDQUFDLFNBQVMsT0FBTyxFQUFFLENBQUM7S0FDM0IsSUFBSSxFQUFFO0tBQ04sTUFBTSxFQUFFO0tBQ1IsYUFBYSxFQUFFO0tBQ2YsTUFBTSxDQUFDLDJEQUEyRCxDQUFDO0tBQ25FLFFBQVEsQ0FBQyxHQUFHLEVBQUUsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgcmVzb2x2ZUdhdGV3YXlQYXRoLCByZXNvbHZlV2FsbGV0UGF0aCwgc2FuZVJlYWRGaWxlIH0gZnJvbSAnLi91c2VydXRpbHMnO1xuaW1wb3J0IElkZW50aXRpZXMgZnJvbSAnLi9pZGVudGllcyc7XG5pbXBvcnQgeyBnZXRHYXRld2F5UHJvZmlsZSB9IGZyb20gJy4vZ2F0ZXdheXMnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi9sb2cnO1xuaW1wb3J0IE1pY3JvZmFiUHJvY2Vzc29yIGZyb20gJy4vbWljcm9mYWInO1xuXG5pbXBvcnQgeyBjcmVhdGVJZkFic2VudCwgY2xlYW4gfSBmcm9tICcuL3VzZXJ1dGlscyc7XG5cbmNvbnN0IHBqc29uID0gcmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICdwYWNrYWdlLmpzb24nKSwgJ3V0Zi04Jyk7XG5jb25zdCB2ZXJzaW9uID0gSlNPTi5wYXJzZShwanNvbikudmVyc2lvbjtcblxueWFyZ3NcbiAgICAuY29tbWFuZChcbiAgICAgICAgJ2Vucm9sbCcsXG4gICAgICAgICdFbnJvbGxzIENBIGlkZW50aXR5IGFuZCBhZGRzIHRvIHdhbGxldCcsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHByb2ZpbGU6IHsgYWxpYXM6ICdwJywgZGVzY3JpYmU6ICdQYXRoIHRvIHRoZSBHYXRld2F5IGZpbGUnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICB3YWxsZXQ6IHsgYWxpYXM6ICd3JywgZGVzY3JpYmU6ICdQYXRoIHRvIGFwcGxpY2F0aW9uIHdhbGxldCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIG5hbWU6IHsgYWxpYXM6ICduJywgZGVzY3JpYmU6ICdOYW1lIG9mIHRoZSBuZXcgdXNlciBmb3IgdGhlIGFwcCB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBlbnJvbGxpZDogeyBhbGlhczogJ2UnLCBkZXNjcmliZTogJ0Vucm9sbElEJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgZW5yb2xscHdkOiB7IGFsaWFzOiAncycsIGRlc2NyaWJlOiAnRW5yb2xsIHBhc3N3b3JkJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxvZyh7IG1zZzogJ0Vucm9sbGluZyBpZGVudGl0eScgfSk7XG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgICAgIGNvbnN0IGdhdGV3YXlQYXRoID0gcmVzb2x2ZUdhdGV3YXlQYXRoKGFyZ3NbJ3Byb2ZpbGUnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHJlc29sdmVXYWxsZXRQYXRoKGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGlkdG9vbHMgPSBuZXcgSWRlbnRpdGllcyh3YWxsZXRQYXRoLCBnZXRHYXRld2F5UHJvZmlsZShnYXRld2F5UGF0aCkpO1xuICAgICAgICAgICAgYXdhaXQgaWR0b29scy5lbnJvbGwoYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nLCBhcmdzWydlbnJvbGxpZCddIGFzIHN0cmluZywgYXJnc1snZW5yb2xscHdkJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdpbXBvcnQnLFxuICAgICAgICAnSW1wb3J0cyBJQlAgaWRlbnRpdHkgYW5kIGFkZHMgdG8gd2FsbGV0JyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgd2FsbGV0OiB7IGFsaWFzOiAndycsIGRlc2NyaWJlOiAnUGF0aCB0byBhcHBsaWNhdGlvbiB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBtc3BpZDogeyBhbGlhczogJ20nLCBkZXNjcmliZTogJ01TUElEIHRvIGFzc2lnbiBpbiB0aGlzIHdhbGxldCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGpzb246IHsgYWxpYXM6ICdqJywgZGVzY3JpYmU6ICdGaWxlIG9mIHRoZSBKU09OIGlkZW50aXR5JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRld2FsbGV0OiB7XG4gICAgICAgICAgICAgICAgICAgIGFsaWFzOiAnYycsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaWJlOiAnQ3JlYXRlIHRoZSB3YWxsZXQgaWYgbm90IHByZXNlbnQnLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxvZyh7IG1zZzogJ0FkZGluZyBJQlAgaWRlbnRpdHknIH0pO1xuICAgICAgICAgICAgLy8gcmVzb2x2ZSB0aGUgc3VwcGxpZWQgZ2F0ZXdheSBhbmQgd2FsbGV0IHBhdGhzXG4gICAgICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcmVzb2x2ZVdhbGxldFBhdGgoYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nLCBhcmdzWydjcmVhdGV3YWxsZXQnXSBhcyBib29sZWFuKTtcblxuICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgpO1xuICAgICAgICAgICAgYXdhaXQgaWR0b29scy5pbXBvcnRUb1dhbGxldChzYW5lUmVhZEZpbGUoYXJnc1snanNvbiddIGFzIHN0cmluZyksIGFyZ3NbJ21zcGlkJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdscycsXG4gICAgICAgICdMaXN0cyBBcHBsaWNhdGlvbiBXYWxsZXQgaWRlbnRpdGllcycsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gYXBwbGljYXRpb24gd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHJlc29sdmVXYWxsZXRQYXRoKGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdMaXN0aW5nIGFwcGxpY2F0aW9uIHdhbGxldCBpZGVudGl0aWVzJywgdmFsOiB3YWxsZXRQYXRoIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBpZHRvb2xzID0gbmV3IElkZW50aXRpZXMod2FsbGV0UGF0aCk7XG4gICAgICAgICAgICBpZHRvb2xzLmxpc3QoKTtcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdtaWNyb2ZhYicsXG4gICAgICAgICdQcm9jZXNzIHRoZSBpYnAtbWljcm9mYWIgb3V0cHV0JyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgd2FsbGV0OiB7IGFsaWFzOiAndycsIGRlc2NyaWJlOiAnUGF0aCB0byBwYXJlbnQgZGlyZWN0b3J5IG9mIGFwcGxpY2F0aW9uIHdhbGxldHMnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBwcm9maWxlOiB7IGFsaWFzOiAncCcsIGRlc2NyaWJlOiAnUGF0aCB0byB0aGUgcGFyZW50IGRpcmVjdG9yeSBvZiBHYXRld2F5IGZpbGVzJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgbXNwY29uZmlnOiB7IGFsaWFzOiAnbScsIGRlc2NyaWJlOiAnUGF0aCB0byB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhlIE1TUCBjb25maWcnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgYWxpYXM6ICdjJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpYmU6ICdGaWxlIHdpdGggSlNPTiBjb25maWd1cmF0aW9uIGZyb20gTWljcm9mYWIgIC0gZm9yIHN0ZGluJyxcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogJy0nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZm9yY2U6IHsgYWxpYXM6ICdmJywgZGVzY3JpYmU6ICdGb3JjZSBjbGVhbmluZyBvZiBkaXJlY3RvcmllcycsIHR5cGU6ICdib29sZWFuJywgZGVmYXVsdDogZmFsc2UgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICAgICAgY3JlYXRlSWZBYnNlbnQoYXJnc1sncHJvZmlsZSddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBjcmVhdGVJZkFic2VudChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgY3JlYXRlSWZBYnNlbnQoYXJnc1snbXNwY29uZmlnJ10gYXMgc3RyaW5nKTtcblxuICAgICAgICAgICAgaWYgKGFyZ3MuZm9yY2UpIHtcbiAgICAgICAgICAgICAgICBjbGVhbihhcmdzWydwcm9maWxlJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgICAgICBjbGVhbihhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgICAgIGNsZWFuKGFyZ3NbJ21zcGNvbmZpZyddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG1pY3JvRmFiUHJvY2Vzc29yID0gbmV3IE1pY3JvZmFiUHJvY2Vzc29yKCk7XG4gICAgICAgICAgICBhd2FpdCBtaWNyb0ZhYlByb2Nlc3Nvci5wcm9jZXNzKFxuICAgICAgICAgICAgICAgIGFyZ3NbJ2NvbmZpZyddIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBhcmdzWydwcm9maWxlJ10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBhcmdzWydtc3Bjb25maWcnXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmhlbHAoKVxuICAgIC53cmFwKG51bGwpXG4gICAgLmFsaWFzKCd2JywgJ3ZlcnNpb24nKVxuICAgIC52ZXJzaW9uKGB3ZWZ0IHYke3ZlcnNpb259YClcbiAgICAuaGVscCgpXG4gICAgLnN0cmljdCgpXG4gICAgLmRlbWFuZENvbW1hbmQoKVxuICAgIC5lcGlsb2coJ0ZvciB1c2FnZSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2h5cGVybGVkZW5kYXJ5L3dlZnRpbGl0eScpXG4gICAgLmRlc2NyaWJlKCd2JywgJ3Nob3cgdmVyc2lvbiBpbmZvcm1hdGlvbicpLmFyZ3Y7XG4iXX0=