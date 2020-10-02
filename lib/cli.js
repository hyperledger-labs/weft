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
    .help()
    .wrap(null)
    .alias('v', 'version')
    .version(`weft v${version}`)
    .help()
    .strict()
    .demandCommand()
    .epilog('For usage see https://github.com/hyperledendary/weftility')
    .describe('v', 'show version information').argv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsNkNBQStCO0FBRS9CLDJDQUE2QjtBQUM3QiwyQkFBa0M7QUFDbEMsMkNBQWtGO0FBQ2xGLDBEQUFvQztBQUNwQyx5Q0FBK0M7QUFDL0MsK0JBQTRCO0FBQzVCLDBEQUEyQztBQUUzQywyQ0FBb0Q7QUFFcEQsTUFBTSxLQUFLLEdBQUcsaUJBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFFMUMsS0FBSztLQUNBLE9BQU8sQ0FDSixRQUFRLEVBQ1Isd0NBQXdDLEVBQ3hDLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDTixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDakIsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtRQUNqRixNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSw0QkFBNEIsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO1FBQ2xGLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLHlDQUF5QyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDN0YsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDbEUsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsaUJBQWlC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QUM7UUFDaEMsaUJBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFXLENBQUMsQ0FBQztLQUN0QztJQUVELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxrQkFBaUIsRUFBRSxDQUFDO0lBQ2xELE1BQU0saUJBQWlCLENBQUMsT0FBTyxDQUMzQixJQUFJLENBQUMsUUFBUSxDQUFXLEVBQ3hCLElBQUksQ0FBQyxTQUFTLENBQVcsRUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBVyxFQUN4QixJQUFJLENBQUMsV0FBVyxDQUFXLENBQzlCLENBQUM7QUFHTixDQUFDLENBQUEsQ0FDSjtLQUNBLElBQUksRUFBRTtLQUNOLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDVixLQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQztLQUNyQixPQUFPLENBQUMsU0FBUyxPQUFPLEVBQUUsQ0FBQztLQUMzQixJQUFJLEVBQUU7S0FDTixNQUFNLEVBQUU7S0FDUixhQUFhLEVBQUU7S0FDZixNQUFNLENBQUMsMkRBQTJELENBQUM7S0FDbkUsUUFBUSxDQUFDLEdBQUcsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8qXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyByZXNvbHZlR2F0ZXdheVBhdGgsIHJlc29sdmVXYWxsZXRQYXRoLCBzYW5lUmVhZEZpbGUgfSBmcm9tICcuL3VzZXJ1dGlscyc7XG5pbXBvcnQgSWRlbnRpdGllcyBmcm9tICcuL2lkZW50aWVzJztcbmltcG9ydCB7IGdldEdhdGV3YXlQcm9maWxlIH0gZnJvbSAnLi9nYXRld2F5cyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuL2xvZyc7XG5pbXBvcnQgTWljcm9mYWJQcm9jZXNzb3IgZnJvbSAnLi9taWNyb2ZhYic7XG5cbmltcG9ydCB7IGNyZWF0ZUlmQWJzZW50LCBjbGVhbiB9IGZyb20gJy4vdXNlcnV0aWxzJztcblxuY29uc3QgcGpzb24gPSByZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJ3BhY2thZ2UuanNvbicpLCAndXRmLTgnKTtcbmNvbnN0IHZlcnNpb24gPSBKU09OLnBhcnNlKHBqc29uKS52ZXJzaW9uO1xuXG55YXJnc1xuICAgIC5jb21tYW5kKFxuICAgICAgICAnZW5yb2xsJyxcbiAgICAgICAgJ0Vucm9sbHMgQ0EgaWRlbnRpdHkgYW5kIGFkZHMgdG8gd2FsbGV0JyxcbiAgICAgICAgKHlhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geWFyZ3Mub3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgcHJvZmlsZTogeyBhbGlhczogJ3AnLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIEdhdGV3YXkgZmlsZScsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gYXBwbGljYXRpb24gd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgbmFtZTogeyBhbGlhczogJ24nLCBkZXNjcmliZTogJ05hbWUgb2YgdGhlIG5ldyB1c2VyIGZvciB0aGUgYXBwIHdhbGxldCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGVucm9sbGlkOiB7IGFsaWFzOiAnZScsIGRlc2NyaWJlOiAnRW5yb2xsSUQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBlbnJvbGxwd2Q6IHsgYWxpYXM6ICdzJywgZGVzY3JpYmU6ICdFbnJvbGwgcGFzc3dvcmQnLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICAgICAgbG9nKHsgbXNnOiAnRW5yb2xsaW5nIGlkZW50aXR5JyB9KTtcbiAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHN1cHBsaWVkIGdhdGV3YXkgYW5kIHdhbGxldCBwYXRoc1xuICAgICAgICAgICAgY29uc3QgZ2F0ZXdheVBhdGggPSByZXNvbHZlR2F0ZXdheVBhdGgoYXJnc1sncHJvZmlsZSddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcmVzb2x2ZVdhbGxldFBhdGgoYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nKTtcblxuICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgsIGdldEdhdGV3YXlQcm9maWxlKGdhdGV3YXlQYXRoKSk7XG4gICAgICAgICAgICBhd2FpdCBpZHRvb2xzLmVucm9sbChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcsIGFyZ3NbJ2Vucm9sbGlkJ10gYXMgc3RyaW5nLCBhcmdzWydlbnJvbGxwd2QnXSBhcyBzdHJpbmcpO1xuICAgICAgICB9LFxuICAgIClcbiAgICAuY29tbWFuZChcbiAgICAgICAgJ2ltcG9ydCcsXG4gICAgICAgICdJbXBvcnRzIElCUCBpZGVudGl0eSBhbmQgYWRkcyB0byB3YWxsZXQnLFxuICAgICAgICAoeWFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB5YXJncy5vcHRpb25zKHtcbiAgICAgICAgICAgICAgICB3YWxsZXQ6IHsgYWxpYXM6ICd3JywgZGVzY3JpYmU6ICdQYXRoIHRvIGFwcGxpY2F0aW9uIHdhbGxldCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIG1zcGlkOiB7IGFsaWFzOiAnbScsIGRlc2NyaWJlOiAnTVNQSUQgdG8gYXNzaWduIGluIHRoaXMgd2FsbGV0JywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAganNvbjogeyBhbGlhczogJ2onLCBkZXNjcmliZTogJ0ZpbGUgb2YgdGhlIEpTT04gaWRlbnRpdHknLCBkZW1hbmRPcHRpb246IHRydWUgfSxcbiAgICAgICAgICAgICAgICBjb21wYXQ6IHsgYWxpYXM6ICdjJywgZGVjcmliZTogJ1NldCB0byB1c2UgdGhlIDEuNCB3YWxsZXQgZm9ybWF0ZScsIGRlZmF1bHQ6IGZhbHNlLCB0eXBlOiAnYm9vbGVhbicgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGV3YWxsZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgYWxpYXM6ICdjJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpYmU6ICdDcmVhdGUgdGhlIHdhbGxldCBpZiBub3QgcHJlc2VudCcsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyAoYXJncykgPT4ge1xuICAgICAgICAgICAgbG9nKHsgbXNnOiAnQWRkaW5nIElCUCBpZGVudGl0eScgfSk7XG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSByZXNvbHZlV2FsbGV0UGF0aChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcsIGFyZ3NbJ2NyZWF0ZXdhbGxldCddIGFzIGJvb2xlYW4pO1xuICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgpO1xuICAgICAgICAgICAgYXdhaXQgaWR0b29scy5pbXBvcnRUb1dhbGxldChcbiAgICAgICAgICAgICAgICBzYW5lUmVhZEZpbGUoYXJnc1snanNvbiddIGFzIHN0cmluZyksXG4gICAgICAgICAgICAgICAgYXJnc1snbXNwaWQnXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgYXJnc1snY29tcGF0J10gYXMgYm9vbGVhbixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG4gICAgKVxuICAgIC5jb21tYW5kKFxuICAgICAgICAnbHMnLFxuICAgICAgICAnTGlzdHMgQXBwbGljYXRpb24gV2FsbGV0IGlkZW50aXRpZXMnLFxuICAgICAgICAoeWFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB5YXJncy5vcHRpb25zKHtcbiAgICAgICAgICAgICAgICB3YWxsZXQ6IHsgYWxpYXM6ICd3JywgZGVzY3JpYmU6ICdQYXRoIHRvIGFwcGxpY2F0aW9uIHdhbGxldCcsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgICAgICAvLyByZXNvbHZlIHRoZSBzdXBwbGllZCBnYXRld2F5IGFuZCB3YWxsZXQgcGF0aHNcbiAgICAgICAgICAgIGNvbnN0IHdhbGxldFBhdGggPSByZXNvbHZlV2FsbGV0UGF0aChhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgbG9nKHsgbXNnOiAnTGlzdGluZyBhcHBsaWNhdGlvbiB3YWxsZXQgaWRlbnRpdGllcycsIHZhbDogd2FsbGV0UGF0aCB9KTtcblxuICAgICAgICAgICAgY29uc3QgaWR0b29scyA9IG5ldyBJZGVudGl0aWVzKHdhbGxldFBhdGgpO1xuICAgICAgICAgICAgaWR0b29scy5saXN0KCk7XG4gICAgICAgIH0sXG4gICAgKVxuICAgIC5jb21tYW5kKFxuICAgICAgICAnbWljcm9mYWInLFxuICAgICAgICAnUHJvY2VzcyB0aGUgaWJwLW1pY3JvZmFiIG91dHB1dCcsXG4gICAgICAgICh5YXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHlhcmdzLm9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIHdhbGxldDogeyBhbGlhczogJ3cnLCBkZXNjcmliZTogJ1BhdGggdG8gcGFyZW50IGRpcmVjdG9yeSBvZiBhcHBsaWNhdGlvbiB3YWxsZXRzJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgcHJvZmlsZTogeyBhbGlhczogJ3AnLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIHBhcmVudCBkaXJlY3Rvcnkgb2YgR2F0ZXdheSBmaWxlcycsIGRlbWFuZE9wdGlvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIG1zcGNvbmZpZzogeyBhbGlhczogJ20nLCBkZXNjcmliZTogJ1BhdGggdG8gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoZSBNU1AgY29uZmlnJywgZGVtYW5kT3B0aW9uOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGFsaWFzOiAnYycsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaWJlOiAnRmlsZSB3aXRoIEpTT04gY29uZmlndXJhdGlvbiBmcm9tIE1pY3JvZmFiICAtIGZvciBzdGRpbicsXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6ICctJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZvcmNlOiB7IGFsaWFzOiAnZicsIGRlc2NyaWJlOiAnRm9yY2UgY2xlYW5pbmcgb2YgZGlyZWN0b3JpZXMnLCB0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6IGZhbHNlIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNyZWF0ZUlmQWJzZW50KGFyZ3NbJ3Byb2ZpbGUnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgY3JlYXRlSWZBYnNlbnQoYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIGNyZWF0ZUlmQWJzZW50KGFyZ3NbJ21zcGNvbmZpZyddIGFzIHN0cmluZyk7XG5cbiAgICAgICAgICAgIGlmIChhcmdzLmZvcmNlKSB7XG4gICAgICAgICAgICAgICAgY2xlYW4oYXJnc1sncHJvZmlsZSddIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAgICAgY2xlYW4oYXJnc1snd2FsbGV0J10gYXMgc3RyaW5nKTtcbiAgICAgICAgICAgICAgICBjbGVhbihhcmdzWydtc3Bjb25maWcnXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtaWNyb0ZhYlByb2Nlc3NvciA9IG5ldyBNaWNyb2ZhYlByb2Nlc3NvcigpO1xuICAgICAgICAgICAgYXdhaXQgbWljcm9GYWJQcm9jZXNzb3IucHJvY2VzcyhcbiAgICAgICAgICAgICAgICBhcmdzWydjb25maWcnXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgYXJnc1sncHJvZmlsZSddIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBhcmdzWyd3YWxsZXQnXSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgYXJnc1snbXNwY29uZmlnJ10gYXMgc3RyaW5nLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gcmVzb2x2ZSB0aGUgc3VwcGxpZWQgZ2F0ZXdheSBhbmQgd2FsbGV0IHBhdGhzXG4gICAgICAgIH0sXG4gICAgKVxuICAgIC5oZWxwKClcbiAgICAud3JhcChudWxsKVxuICAgIC5hbGlhcygndicsICd2ZXJzaW9uJylcbiAgICAudmVyc2lvbihgd2VmdCB2JHt2ZXJzaW9ufWApXG4gICAgLmhlbHAoKVxuICAgIC5zdHJpY3QoKVxuICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAuZXBpbG9nKCdGb3IgdXNhZ2Ugc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9oeXBlcmxlZGVuZGFyeS93ZWZ0aWxpdHknKVxuICAgIC5kZXNjcmliZSgndicsICdzaG93IHZlcnNpb24gaW5mb3JtYXRpb24nKS5hcmd2O1xuIl19