#!/usr/bin/env node
/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as yargs from 'yargs';

import * as path from 'path';
import { readFileSync } from 'fs';
import { resolveGatewayPath, resolveWalletPath, saneReadFile } from './userutils';
import Identities from './identies';
import { getGatewayProfile } from './gateways';
import { log } from './log';
import MicrofabProcessor from './microfab';

import { createIfAbsent, clean } from './userutils';

const pjson = readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8');
const version = JSON.parse(pjson).version;

yargs
    .command(
        'enroll',
        'Enrolls CA identity and adds to wallet',
        (yargs) => {
            return yargs.options({
                profile: { alias: 'p', describe: 'Path to the Gateway file', demandOption: true },
                wallet: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
                name: { alias: 'n', describe: 'Name of the new user for the app wallet', demandOption: true },
                enrollid: { alias: 'e', describe: 'EnrollID', demandOption: true },
                enrollpwd: { alias: 's', describe: 'Enroll password', demandOption: true },
            });
        },
        async (args) => {
            log({ msg: 'Enrolling identity' });
            // resolve the supplied gateway and wallet paths
            const gatewayPath = resolveGatewayPath(args['profile'] as string);
            const walletPath = resolveWalletPath(args['wallet'] as string);

            const idtools = new Identities(walletPath, getGatewayProfile(gatewayPath));
            await idtools.enroll(args['wallet'] as string, args['enrollid'] as string, args['enrollpwd'] as string);
        },
    )
    .command(
        'import',
        'Imports IBP identity and adds to wallet',
        (yargs) => {
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
        },
        async (args) => {
            log({ msg: 'Adding IBP identity' });
            // resolve the supplied gateway and wallet paths
            const walletPath = resolveWalletPath(args['wallet'] as string, args['createwallet'] as boolean);
            const idtools = new Identities(walletPath);
            await idtools.importToWallet(
                saneReadFile(args['json'] as string),
                args['mspid'] as string,
                args['compat'] as boolean,
            );
        },
    )
    .command(
        'ls',
        'Lists Application Wallet identities',
        (yargs) => {
            return yargs.options({
                wallet: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
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
            await microFabProcessor.process(
                args['config'] as string,
                args['profile'] as string,
                args['wallet'] as string,
                args['mspconfig'] as string,
            );

            // resolve the supplied gateway and wallet paths
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
