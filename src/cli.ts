#!/usr/bin/env node
/*
 * SPDX-License-Identifier: Apache-2.0
 */
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import * as yargs from 'yargs';
import * as path from 'path';
import { readFileSync } from 'fs';
import { resolveGatewayPath, resolveWalletPath, saneReadFile, createIfAbsent, clean } from './userutils';
import Identities from './identies';
import { getGatewayProfile } from './gateways';
import { log, enableCliLog, disableCliLog } from './log';
import { MicrofabProcessor } from './microfab';
import MSP from './msp';

const pjson = readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8');
const version = JSON.parse(pjson).version;

enableCliLog();

yargs
    .command(
        'enroll',
        'Enrolls CA identity and adds to wallet',
        (yargs) => {
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
        },
        async (args) => {
            log({ msg: 'Enrolling identity' });
            // resolve the supplied gateway and wallet paths
            try {
                const gatewayPath = resolveGatewayPath(args['profile'] as string);
                const walletPath = resolveWalletPath(args['wallet'] as string, args['createwallet'] as boolean);

                const idtools = new Identities(walletPath, args['compat'] as boolean, getGatewayProfile(gatewayPath));
                await idtools.enroll(args['name'] as string, args['enrollid'] as string, args['enrollpwd'] as string);
            } catch (e) {
                log({ msg: e.message, error: true });
                process.exit(1);
            }
        },
    )
    .command(
        'register',
        'Registers CA identity and returns the enrollSecret',
        (yargs) => {
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
        },
        async (args) => {
            if (args['quiet'] == true) {
                disableCliLog();
            }
            log({ msg: 'Registering identity' });
            try {
                // resolve the supplied gateway and wallet paths
                const gatewayPath = resolveGatewayPath(args['profile'] as string);
                const walletPath = resolveWalletPath(args['wallet'] as string);

                const idtools = new Identities(walletPath, args['compat'] as boolean, getGatewayProfile(gatewayPath));
                const enrollPwd = await idtools.register(
                    args['enrollid'] as string,
                    args['adminName'] as string,
                    args['affiliation'] as string,
                );
                log({ msg: `Enrollment password is ${enrollPwd}` });
                if (args['quiet']) {
                    console.log(enrollPwd);
                }
            } catch (e) {
                enableCliLog();
                log({ msg: e.message, error: true });
                process.exit(1);
            }
        },
    )
    .command(
        'import',
        'Imports IBP identity and adds to application wallet',
        (yargs) => {
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
        },
        async (args) => {
            log({ msg: 'Adding IBP identity' });
            // resolve the supplied gateway and wallet paths
            const walletPath = resolveWalletPath(args['wallet'] as string, args['createwallet'] as boolean);
            const idtools = new Identities(walletPath, args['compat'] as boolean);
            await idtools.importToWallet(saneReadFile(args['json'] as string), args['mspid'] as string);
        },
    )
    .command(
        'export',
        'Exports IBP identity and adds to application wallet',
        (yargs) => {
            return yargs.options({
                wallet: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
                json: { alias: 'j', describe: 'File of the JSON identity', demandOption: true },
                name: { alias: 'n', describe: 'Name of the new user for the app wallet', demandOption: true },
                compat: { alias: 'c', decribe: 'Set to use the 1.4 wallet format', default: false, type: 'boolean' },
            });
        },
        async (args) => {
            log({ msg: 'Exporting identity for IBP' });

            // resolve the supplied gateway and wallet paths
            const walletPath = resolveWalletPath(args['wallet'] as string, args['createwallet'] as boolean);
            const idtools = new Identities(walletPath, args['compat'] as boolean);
            await idtools.exportFromWallet(args['name'] as string, args['json'] as string);
        },
    )
    .command(
        'ls',
        'Lists Application Wallet identities',
        (yargs) => {
            return yargs.options({
                wallet: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
                compat: { alias: 'c', decribe: 'Set to use the 1.4 wallet format', default: false, type: 'boolean' },
            });
        },
        async (args) => {
            // resolve the supplied gateway and wallet paths
            const walletPath = resolveWalletPath(args['wallet'] as string);
            log({ msg: 'Listing application wallet identities', val: walletPath });

            const idtools = new Identities(walletPath);
            idtools.list();
        },
    )
    .command(
        'microfab',
        'Process the ibp-microfab output',
        (yargs) => {
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
        },
        async (args) => {
            createIfAbsent(args['profile'] as string);
            createIfAbsent(args['wallet'] as string);
            createIfAbsent(args['mspconfig'] as string);

            if (args.force) {
                clean(args['profile'] as string);
                clean(args['wallet'] as string);
                clean(args['mspconfig'] as string);
            }

            const microFabProcessor = new MicrofabProcessor();
            await microFabProcessor.processFile(
                args['config'] as string,
                args['profile'] as string,
                args['wallet'] as string,
                args['mspconfig'] as string,
            );
        },
    )
    .command(
        'mspids',
        'Imports IBP identity to MSP for Peer commands',
        (yargs) => {
            return yargs.options({
                mspconfig: { alias: 'd', describe: 'Path to the root directory of the MSP config', demandOption: true },
                mspid: { alias: 'm', describe: 'MSPID to assign in this wallet', demandOption: true },
                json: { alias: 'j', describe: 'File of the JSON identity', demandOption: true },
            });
        },
        async (args) => {
            log({ msg: 'Creating MSP structure' });
            // resolve the supplied gateway and wallet paths
            const msp = new MSP();
            const rootdir = createIfAbsent(args['mspconfig'] as string);
            msp.writeId(rootdir, saneReadFile(args['json'] as string), args['mspid'] as string);
        },
    )
    .help()

    .wrap(null)
    .alias('v', 'version')
    .version(`weft v${version}`)
    .help()
    .strict()
    .demandCommand()
    .epilog('For usage see https://github.com/hyperledendary/weftility')
    .describe('v', 'show version information').argv;
