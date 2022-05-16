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
import { log, enableCliLog, disableCliLog, Type } from './log';
import { MicrofabProcessor } from './microfab';
import MSP from './msp';
import ChaincodePackage, { Format, PackageConfig } from './chaincodePackage/chaincodePackage';

const pjson = readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8');
const version = JSON.parse(pjson).version;

enableCliLog();

const caBuilder = (yargs: any) => {
    return yargs
        .command(
            'enroll',
            'Enrolls CA identity and adds to wallet',
            (yargs: any) => {
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
                    compat: {
                        alias: 'c',
                        decribe: 'Set to use the 1.4 wallet format',
                        default: false,
                        type: 'boolean',
                    },
                });
            },
            async (args: any) => {
                log({ msg: 'Enrolling identity' });
                // resolve the supplied gateway and wallet paths
                try {
                    const gatewayPath = resolveGatewayPath(args['profile'] as string);
                    const walletPath = resolveWalletPath(args['wallet'] as string, args['createwallet'] as boolean);

                    const idtools = new Identities(
                        walletPath,
                        args['compat'] as boolean,
                        getGatewayProfile(gatewayPath),
                    );
                    await idtools.enroll(
                        args['name'] as string,
                        args['enrollid'] as string,
                        args['enrollpwd'] as string,
                    );
                } catch (e) {
                    log({ msg: (e as any).message, type: Type.ERROR });
                    process.exit(1);
                }
            },
        )
        .command(
            'register',
            'Registers CA identity and returns the enrollSecret',
            (yargs: any) => {
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
                    compat: {
                        alias: 'c',
                        decribe: 'Set to use the 1.4 wallet format',
                        default: false,
                        type: 'boolean',
                    },
                    quiet: { alias: 'q', describe: ' Quiet - only outpus the secret', default: false, type: 'boolean' },
                });
            },
            async (args: any) => {
                if (args['quiet'] == true) {
                    disableCliLog();
                }
                log({ msg: 'Registering identity' });
                try {
                    // resolve the supplied gateway and wallet paths
                    const gatewayPath = resolveGatewayPath(args['profile'] as string);
                    const walletPath = resolveWalletPath(args['wallet'] as string);

                    const idtools = new Identities(
                        walletPath,
                        args['compat'] as boolean,
                        getGatewayProfile(gatewayPath),
                    );
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
                    log({ msg: (e as any).message, type: Type.ERROR });
                    process.exit(1);
                }
            },
        )
        .demandCommand();
};

const mspidBuilder = (yargs: any) => {
    return yargs
        .options()
        .command(
            'import',
            'Import identities into the MSP Credentials directory format for Peer commands',
            (yargs: any) => {
                return yargs
                    .options({
                        mspconfig: {
                            alias: 'd',
                            describe: 'Path to the root directory of the MSP Credentials',
                            demandOption: true,
                        },
                        mspid: { alias: 'm', describe: 'MSPID to assign in this wallet', demandOption: true },
                    })
                    .command(
                        'ibp',
                        'Imports from IBP JSON Formats',
                        (yargs: any) => {
                            return yargs.options({
                                json: { alias: 'j', describe: 'JSON identity file', demandOption: true },
                            });
                        },
                        async (args: any) => {
                            log({ msg: 'Creating MSP structure' });
                            // resolve the supplied gateway and wallet paths
                            const msp = new MSP();
                            const rootdir = createIfAbsent(args['mspconfig'] as string);
                            msp.writeId(rootdir, saneReadFile(args['json'] as string), args['mspid'] as string);
                        },
                    )
                    .command('wallet', 'Imports from Application Wallets');
            },
        );
};

const walletBuilder = (yargs: any) => {
    return yargs
        .options({
            walletpath: { alias: 'w', describe: 'Path to application wallet', demandOption: true },
            compat: {
                alias: 'c',
                describe: 'Set to use the 1.4 wallet format',
                default: false,
                type: 'boolean',
            },
            createwallet: {
                alias: 'r',
                describe: 'Create the wallet if not present',
                type: 'boolean',
                default: false,
            },
            force: {
                alias: 'f',
                describe: 'If the identity is already present, force overwrite it',
                type: 'boolean',
                default: false,
            },
        })
        .command('import', 'Imports identities into an application wallet', (yargs: any) => {
            return yargs
                .command(
                    'mspcreds',
                    'Import form MSP Credentials directory format',
                    (yargs: any) => {
                        return yargs.options({
                            mspdir: {
                                alias: 'd',
                                describe: 'MSP Creds Directory of the identity created',
                                demandOption: true,
                            },
                        });
                    },
                    async (args: any) => {
                        log({ msg: 'Adding identity' });
                        // resolve the supplied gateway and wallet paths
                        const walletPath = resolveWalletPath(
                            args['walletpath'] as string,
                            args['createwallet'] as boolean,
                        );
                        const idtools = new Identities(walletPath, args['compat'] as boolean);
                        await idtools.importFromCryptoConfig(args['mspdir'] as string, args['mspid'] as string);
                    },
                )
                .command(
                    'ibp',
                    'Imports IBP identity and adds to application wallet',
                    (yargs: any) => {
                        return yargs.options({
                            json: { alias: 'j', describe: 'JSON identity file', demandOption: true },
                        });
                    },
                    async (args: any) => {
                        log({ msg: 'Adding IBP identity' });
                        // resolve the supplied gateway and wallet paths
                        const walletPath = resolveWalletPath(
                            args['walletpath'] as string,
                            args['createwallet'] as boolean,
                        );
                        const idtools = new Identities(walletPath, args['compat'] as boolean);
                        await idtools.importToWallet(saneReadFile(args['json'] as string), args['mspid'] as string);
                    },
                )
                .options({
                    mspid: { alias: 'm', describe: 'MSPID to assign in this wallet', demandOption: true },
                });
        })
        .command('export', 'Exports identities from an application wallet', (yargs: any) => {
            return yargs.command(
                'ibp',
                'Exports to ID in IBP JSON format',
                (yargs: any) => {
                    return yargs.options({
                        json: { alias: 'j', describe: 'JSON identity file', demandOption: true },
                        name: { alias: 'n', describe: 'Name of the new user for the app wallet', demandOption: true },
                    });
                },
                async (args: any) => {
                    log({ msg: 'Exporting identity for IBP' });

                    // resolve the supplied gateway and wallet paths
                    const walletPath = resolveWalletPath(args['wallet'] as string, args['createwallet'] as boolean);
                    const idtools = new Identities(walletPath, args['compat'] as boolean);
                    await idtools.exportFromWallet(args['name'] as string, args['json'] as string);
                },
            );
        })
        .command(
            'ls',
            'Lists Application Wallet identities',
            (yargs: any) => {
                return yargs;
            },
            async (args: any) => {
                // resolve the supplied gateway and wallet paths
                const walletPath = resolveWalletPath(args['wallet'] as string);
                log({ msg: 'Listing application wallet identities', val: walletPath });

                const idtools = new Identities(walletPath);
                idtools.list();
            },
        );
};

const packagerAction = async (args: any) => {
    if (args['quiet'] == true) {
        disableCliLog();
    }
    const format = args['_'].pop();

    try {
        let config: PackageConfig;

        if (!args['archive'] || args['archive'].trim() === '') {
            args['archive'] = path.join(process.cwd(), `${args['label']}.tgz`);
        }
        log({ msg: `Packaging path :`, val: `${args.path}`, type: Type.NOTICE });
        log({ msg: `Format         :`, val: `${format}`, type: Type.NOTICE });
        log({ msg: `Archive        :`, val: `${args.archive}`, type: Type.NOTICE });
        log({ msg: `Label          :`, val: `${args.label}`, type: Type.NOTICE });

        switch (format) {
            case 'full':
                config = {
                    path: args['path'],
                    archivePath: args['archive'],
                    label: args['label'],
                    format: Format.FULL,
                    cfg: {
                        langauge: args['lang'],
                    },
                };
                break;
            case 'k8s':
                config = {
                    path: args['path'],
                    archivePath: args['archive'],
                    label: args['label'],
                    format: Format.K8S,
                    cfg: {
                        imageurl: args['imageurl'],
                        pullsecret: args['imagepullsecret'],
                        pullpolicy: args['imagepullpolicy'],
                    },
                };
                break;
            case 'caas':
                config = {
                    path: args['path'],
                    archivePath: args['archive'],
                    label: args['label'],
                    format: Format.CCAAS,
                    cfg: {
                        address: args['address'],
                        tlsRequired: args['tlsrequired'],
                        timeout: args['timeout'],
                    },
                };
                break;
            default:
                throw new Error('Unknown');
        }

        const packager = new ChaincodePackage(config);
        const packageId = await packager.pack();

        log({ msg: `\n` });
        if (args['quiet'] == true) {
            console.log(packageId);
        } else {
            log({ msg: `Created    :`, val: `${config.archivePath}`, type: Type.NOTICE });
            log({ msg: `Package id :`, val: `${packageId} `, type: Type.NOTICE });
            log({ msg: `Label      :`, val: `${config.label} `, type: Type.NOTICE });
        }
    } catch (e) {
        enableCliLog();
        console.log(e);
        log({ msg: (e as any).message, type: Type.ERROR });
        throw e;
    }
};

const chaincodeBuilder = (yargs: any) => {
    return yargs
        .command(
            'package',
            'Create a chaincode package (tgz) to install on peers',
            (yargs: any) => {
                return yargs
                    .options({
                        label: { alias: 'l', describe: 'Label of the chaincode to use', demandOption: true },
                        path: {
                            alias: 'p',
                            describe: 'Path to the root directory of the chaincode or file',
                            demandOption: false,
                        },
                        quiet: {
                            alias: 'q',
                            describe: 'Quiet mode, only output the packageid to stdout',
                            demandOption: false,
                            type: 'boolean',
                            default: 'false',
                        },
                        archive: {
                            alias: 'a',
                            describe: 'filename of the output tgz',
                            demandOption: false,
                            type: 'string',
                        },
                    })
                    .group(['label', 'quiet', 'archive'], 'Chaincode Package:')
                    .command(
                        'full',
                        'Include all code to run under Peer managed chaincode containers',
                        (yargs: any) => {
                            return yargs
                                .options({
                                    lang: {
                                        alias: 'n',
                                        describe: 'Language contract is written in',
                                        choices: ['auto', 'go', 'java', 'javascript', 'typescript'],
                                        default: 'auto',
                                    },
                                })
                                .group(['lang'], 'Chaincode Package:');
                        },
                        packagerAction,
                    )
                    .command(
                        'caas',
                        'Chaincode-as-a-service Builders for user managed chaincode containers',
                        (yargs: any) => {
                            return yargs
                                .options({
                                    address: {
                                        type: 'string',
                                        describe: 'Address of the chaincode process',
                                        demandOption: true,
                                    },
                                    timeout: {
                                        type: 'string',
                                        describe: 'Connection timeout, default 15s',
                                        demandOption: false,
                                        default: '15s',
                                    },
                                    tls: {
                                        type: 'boolean',
                                        describe: 'TLSEnabled default is false',
                                        demandOption: false,
                                        default: 'false',
                                    },
                                })
                                .group(['address', 'timeout', 'tls'], 'Chaincode Package:');
                        },
                        packagerAction,
                    )
                    .command(
                        'k8s',
                        'K8S Builder for Kubernetes managed chaincode containers',
                        (yargs: any) => {
                            return yargs
                                .options({
                                    imageurl: {
                                        type: 'string',
                                        describe: 'Image URL: $registry/$image-name:$image-label',
                                        demandOption: true,
                                    },
                                    imagepullSecret: {
                                        type: 'string',
                                        describe: 'Image Pull Secret Name (not the secret itself)',
                                        demandOption: true,
                                    },
                                    imagePullPolicy: {
                                        type: 'string',
                                        describe: 'Image Pull Policy',
                                        demandOption: true,
                                    },
                                })
                                .group(['imageurl', 'imagepullSecret', 'imagePullPolicy'], 'Chaincode Package:');
                        },
                        packagerAction,
                    )
                    .demandCommand(1);
            },
            (args: any) => {
                console.log('package command handler' + args);
            },
        )
        .demandCommand()
        .group(['path'], 'Chaincode Package:');
};

// ToDo: Add in working with connection information
// Unsure of exact semantics

// const connectionBuilder = (yargs: any) => {
//     return yargs
//     .command('profiles','Work with Connection Profile files')
//     .command('nodefiles','Work with Node files')
//     .command('gateway','Work with information for Fabraic Gateway')
//     .command('env','Work with connection information in Environment Variables', (yars)=>{
//         return yargs
//             .options({
//                 'from':{describe:'Convert frm '},
//             })
//     })
// }

const x = yargs
    .command('wallet', 'Work with a SDK Application Wallet', walletBuilder)
    .command('mspids', 'Work with a MSP Credentials Directory structure', mspidBuilder)
    .command('ca', 'Work with a Fabric CA for identities', caBuilder)
    .command('chaincode', 'Work with a Chaincode Packages', chaincodeBuilder)
    .command(
        'microfab',
        'Process the ibp-microfab output; generates MSPCreds, Connection Profiles and Application wallets',
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
    .command('connection', 'Work with connection information - TBA')
    .help()
    .wrap(null)
    .alias('v', 'version')
    .version(`weft v${version}`)
    .help()
    .strict()
    .demandCommand()
    .epilog('For usage see https://github.com/hyperledendary/weftility')
    .describe('v', 'show version information').argv;

(x as any)
    .then(() => {
        log({ msg: `Complete` });
    })
    .catch((e: any) => {
        log({ msg: e.getMessage(), type: Type.ERROR });
    });

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
