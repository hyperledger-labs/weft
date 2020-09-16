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
    .epilog('For usage see https://github.com/hyperledendary/weftility')
    .describe('v', 'show version information').argv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsNkNBQStCO0FBRS9CLDJDQUE2QjtBQUM3QiwyQkFBa0M7QUFDbEMsMkNBQWtGO0FBQ2xGLDBEQUFvQztBQUNwQyx5Q0FBK0M7QUFDL0MsK0JBQTRCO0FBQzVCLDBEQUEyQztBQUUzQywyQ0FBb0Q7QUFFcEQsTUFBTSxLQUFLLEdBQUcsaUJBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFFMUMsS0FBSztLQUNBLE9BQU8sQ0FDSixRQUFRLEVBQ1Isd0NBQXdDLEVBQ3hDLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDTixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDakIsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtRQUNqRixNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSw0QkFBNEIsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO1FBQ2xGLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLHlDQUF5QyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDN0YsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDbEUsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsaUJBQWlC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QUksQ0FBQyxJQUFJLENBQUM7S0FDVixLQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQztLQUNyQixPQUFPLENBQUMsU0FBUyxPQUFPLEVBQUUsQ0FBQztLQUMzQixJQUFJLEVBQUU7S0FDTixNQUFNLEVBQUU7S0FDUixNQUFNLENBQUMsMkRBQTJELENBQUM7S0FDbkUsUUFBUSxDQUFDLEdBQUcsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8qXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyByZXNvbHZlR2F0ZXdheVBhdGgsIHJlc29sdmVXYWxsZXRQYXRoLCBzYW5lUmVhZEZpbGUgfSBmcm9tICcuL3VzZXJ1dGlscyc7XG5pbXBvcnQgSWRlbnRpdGllcyBmcm9tICcuL2lkZW50aWVzJztcbmltcG9ydCB7IGdldEdhdGV3YXlQcm9maWxlIH0gZnJvbSAnLi9nYXRld2F5cyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuL2xvZyc7XG5pbXBvcnQgTWljcm9mYWJQcm9jZXNzb3IgZnJvbSAnLi9taWNyb2ZhYic7XG5cbmltcG9ydCB7IGNyZWF0ZUlmQWJzZW50LCBjbGVhbiB9IGZyb20gJy4vdXNlcnV0aWxzJztcblxuY29uc3QgcGpzb24gPSByZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJ3BhY2thZ2UuanNvbicpLCAndXRmLTgnKTtcbmNvbnN0IHZlcnNpb24gPSBKU09OLnBhcnNlKHBqc29uKS52ZXJzaW9uO1xuXG55YXJnc1xuICAgIC5jb21tYW5kKFxuICAgICAgICAnZW5yb2xsJyxcbiAgICAgICAgJ0Vucm9sbHMgQ0EgaWRlbnRpdHkgYW5kIGFkZHMgdG8gd2FsbGV0JyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgcHJvZmlsZTogeyBhbGlhczogJ3AnLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIEdhdGV3YXkgZmlsZScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gYXBwbGljYXRpb24gd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgbmFtZTogeyBhbGlhczogJ24nLCBkZXNjcmliZTogJ05hbWUgb2YgdGhlIG5ldyB1c2VyIGZvciB0aGUgYXBwIHdhbGxldCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGVucm9sbGlkOiB7IGFsaWFzOiAnZScsIGRlc2NyaWJlOiAnRW5yb2xsSUQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBlbnJvbGxwd2Q6IHsgYWxpYXM6ICdzJywgZGVzY3JpYmU6ICdFbnJvbGwgcGFzc3dvcmQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICAgICAgbG9nKHsgbXNnOiAnRW5yb2xsaW5nIGlkZW50aXR5JyB9KTtcbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgY29uc3QgZ2F0ZXdheVBhdGggPSByZXNvbHZlR2F0ZXdheVBhdGgoYXJnc1sncHJvZmlsZSddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcmVzb2x2ZVdhbGxldFBhdGgoYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nKTtcblxuICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgsIGdldEdhdGV3YXlQcm9maWxlKGdhdGV3YXlQYXRoKSk7XG4gICAgICAgICAgICBhd2FpdCBpZHRvb2xzLmVucm9sbChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcsIGFyZ3NbJ2Vucm9sbGlkJ10gYXMgc3RyaW5nLCBhcmdzWydlbnJvbGxwd2QnXSBhcyBzdHJpbmcpO1xuICAgICAgICB9LFxuICAgIClcbiAgICAuY29tbWFuZChcbiAgICAgICAgJ2ltcG9ydCcsXG4gICAgICAgICdJbXBvcnRzIElCUCBpZGVudGl0eSBhbmQgYWRkcyB0byB3YWxsZXQnLFxuICAgICAgICAoeWFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB5YXJncy5vcHRpb25zKHtcbiAgICAgICAgICAgICAgICB3YWxsZXQ6IHsgYWxpYXM6ICd3JywgZGVzY3JpYmU6ICdQYXRoIHRvIGFwcGxpY2F0aW9uIHdhbGxldCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIG5hbWU6IHsgYWxpYXM6ICduJywgZGVzY3JpYmU6ICdOYW1lIG9mIHRoZSBuZXcgdXNlciBmb3IgdGhlIGFwcCB3YWxsZXQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBqc29uOiB7IGFsaWFzOiAnaicsIGRlc2NyaWJlOiAnRmlsZSBvZiB0aGUgSlNPTiBpZGVudGl0eScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdBZGRpbmcgSUJQIGlkZW50aXR5JyB9KTtcbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHJlc29sdmVXYWxsZXRQYXRoKGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGlkdG9vbHMgPSBuZXcgSWRlbnRpdGllcyh3YWxsZXRQYXRoKTtcbiAgICAgICAgICAgIGF3YWl0IGlkdG9vbHMuaW1wb3J0VG9XYWxsZXQoc2FuZVJlYWRGaWxlKGFyZ3NbJ2pzb24nXSBhcyBzdHJpbmcpKTtcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdscycsXG4gICAgICAgICdMaXN0cyBBcHBsaWNhdGlvbiBXYWxsZXQgaWRlbnRpdGllcycsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gYXBwbGljYXRpb24gd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHJlc29sdmVXYWxsZXRQYXRoKGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBsb2coeyBtc2c6ICdMaXN0aW5nIGFwcGxpY2F0aW9uIHdhbGxldCBpZGVudGl0aWVzJywgdmFsOiB3YWxsZXRQYXRoIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBpZHRvb2xzID0gbmV3IElkZW50aXRpZXMod2FsbGV0UGF0aCk7XG4gICAgICAgICAgICBpZHRvb2xzLmxpc3QoKTtcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmNvbW1hbmQoXG4gICAgICAgICdtaWNyb2ZhYicsXG4gICAgICAgICdQcm9jZXNzIHRoZSBpYnAtbWljcm9mYWIgb3V0cHV0JyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgd2FsbGV0OiB7IGFsaWFzOiAndycsIGRlc2NyaWJlOiAnUGF0aCB0byBwYXJlbnQgZGlyZWN0b3J5IG9mIGFwcGxpY2F0aW9uIHdhbGxldHMnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBwcm9maWxlOiB7IGFsaWFzOiAncCcsIGRlc2NyaWJlOiAnUGF0aCB0byB0aGUgcGFyZW50IGRpcmVjdG9yeSBvZiBHYXRld2F5IGZpbGVzJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgbXNwY29uZmlnOiB7IGFsaWFzOiAnbScsIGRlc2NyaWJlOiAnUGF0aCB0byB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhlIE1TUCBjb25maWcnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgYWxpYXM6ICdjJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpYmU6ICdGaWxlIHdpdGggSlNPTiBjb25maWd1cmF0aW9uIGZyb20gTWljcm9mYWIgIC0gZm9yIHN0ZGluJyxcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogJy0nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZm9yY2U6IHsgYWxpYXM6ICdmJywgZGVzY3JpYmU6ICdGb3JjZSBjbGVhbmluZyBvZiBkaXJlY3RvcmllcycsIHR5cGU6ICdib29sZWFuJywgZGVmYXVsdDogZmFsc2UgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICAgICAgY3JlYXRlSWZBYnNlbnQoYXJnc1sncHJvZmlsZSddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBjcmVhdGVJZkFic2VudChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgY3JlYXRlSWZBYnNlbnQoYXJnc1snbXNwY29uZmlnJ10gYXMgc3RyaW5nKTtcblxuICAgICAgICAgICAgaWYgKGFyZ3MuZm9yY2UpIHtcbiAgICAgICAgICAgICAgICBjbGVhbihhcmdzWydwcm9maWxlJ10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgICAgICBjbGVhbihhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgICAgIGNsZWFuKGFyZ3NbJ21zcGNvbmZpZyddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG1pY3JvRmFiUHJvY2Vzc29yID0gbmV3IE1pY3JvZmFiUHJvY2Vzc29yKCk7XG4gICAgICAgICAgICBhd2FpdCBtaWNyb0ZhYlByb2Nlc3Nvci5wcm9jZXNzKFxuICAgICAgICAgICAgICAgIGFyZ3NbJ2NvbmZpZyddIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBhcmdzWydwcm9maWxlJ10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFyZ3NbJ3dhbGxldCddIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBhcmdzWydtc3Bjb25maWcnXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgfSxcbiAgICApXG4gICAgLmhlbHAoKVxuICAgIC53cmFwKG51bGwpXG4gICAgLmFsaWFzKCd2JywgJ3ZlcnNpb24nKVxuICAgIC52ZXJzaW9uKGB3ZWZ0IHYke3ZlcnNpb259YClcbiAgICAuaGVscCgpXG4gICAgLnN0cmljdCgpXG4gICAgLmVwaWxvZygnRm9yIHVzYWdlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vaHlwZXJsZWRlbmRhcnkvd2VmdGlsaXR5JylcbiAgICAuZGVzY3JpYmUoJ3YnLCAnc2hvdyB2ZXJzaW9uIGluZm9ybWF0aW9uJykuYXJndjtcbiJdfQ==