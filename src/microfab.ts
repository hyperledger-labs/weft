/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'path';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import * as mkdirp from 'mkdirp';
import sanitize from 'sanitize-filename';
import Identities from './identies';

type callbackFn = (v: any) => void;
import { log } from './log';

export interface EnvVars {
    [org: string]: { mspid: string; peers: string[]; ids: { [id: string]: string }; tlsrootcert: string };
}

export class MicrofabProcessor {
    public async processFile(
        configFile: string,
        gatewaypath: string,
        walletpath: string,
        cryptopath: string,
        gwPath: string,
    ): Promise<void> {
        // JSON configuration either from stdin or filename
        let cfgStr = '';
        if (configFile === '-') {
            cfgStr = readFileSync(0).toString();
        } else {
            const microfabConfig = path.resolve(configFile);
            if (!existsSync(microfabConfig)) {
                throw new Error(`Microfab config json not found at ${microfabConfig}`);
            }
            cfgStr = readFileSync(microfabConfig).toString();
        }

        const config = JSON.parse(cfgStr);
        await this.process({ config, gatewaypath, walletpath, cryptopath, gwPath });
    }

    public async process({
        config,
        gatewaypath,
        walletpath,
        cryptopath,
        gwPath,
    }: {
        config: any;
        gatewaypath: string;
        walletpath: string;
        cryptopath: string;
        gwPath: string;
    }): Promise<EnvVars> {
        const envvars: EnvVars = {};
        // locate the gateways in the file, and create the connection profile
        config
            .filter((c: { type: string }) => c.type === 'gateway')
            .forEach(
                (gateway: {
                    id: string;
                    client: { organization: string };
                    organizations: { [name: string]: { mspid: string; peers: string[] } };
                }) => {
                    const profilePath = path.resolve(gatewaypath, `${sanitize(gateway.id)}.json`);
                    writeFileSync(profilePath, JSON.stringify(gateway));
                    log({ msg: `Gateway profile written to : ${profilePath}` });
                    const org = gateway.client.organization;

                    envvars[org as string] = {
                        mspid: gateway.organizations[org].mspid,
                        peers: gateway.organizations[org].peers as string[],
                        ids: {},
                        tlsrootcert: '',
                    };
                },
            );

        console.log(envvars);
        // get the peers certificates and root ca certificate
        config
            .filter((c: { type: string }) => c.type === 'fabric-peer' || c.type === 'fabric-orderer')
            .filter(
                (node: { id: string; tls_ca_root_cert: string; pem: string; wallet: string }) =>
                    node.tls_ca_root_cert && node.tls_ca_root_cert !== '',
            )
            .forEach((node: { id: string; tls_ca_root_cert: string; pem: string; wallet: string }) => {
                const certRoot = path.resolve(cryptopath, 'tls', sanitize(node.id));
                mkdirp.sync(certRoot);

                const caRootCert = Buffer.from(node.tls_ca_root_cert, 'base64').toString();
                const peerCert = Buffer.from(node.pem, 'base64').toString();

                writeFileSync(path.join(certRoot, `tlsca-${node.id}-cert.pem`), caRootCert);
                writeFileSync(path.join(certRoot, `${node.id}-cert.pem`), peerCert);
            });

        // locate the identities
        interface IdStructure {
            wallet: string;
            name: string;
            id: string;
            private_key: string;
            cert: string;
            ca: string;
        }

        await this.asyncForEach(
            config.filter((c: { type: string }) => c.type === 'identity'),
            async (id: IdStructure) => {
                const fullWalletPath = path.resolve(walletpath, sanitize(id.wallet));
                mkdirp.sync(fullWalletPath);
                id.name = id.id;
                // use import to wallet function
                const ids = new Identities(fullWalletPath);
                await ids.importToWallet(JSON.stringify(id));

                // create the msp cryto dir structure for the peer commands
                const cryptoroot = path.resolve(cryptopath, sanitize(id.wallet), sanitize(id.id));
                // now for the msp stuff
                mkdirp.sync(path.join(cryptoroot, 'msp'));
                mkdirp.sync(path.join(cryptoroot, 'msp', 'cacerts'));
                mkdirp.sync(path.join(cryptoroot, 'msp', 'keystore'));
                mkdirp.sync(path.join(cryptoroot, 'msp', 'signcerts'));
                mkdirp.sync(path.join(cryptoroot, 'msp', 'admincerts'));

                const privateKey = Buffer.from(id.private_key, 'base64').toString();
                const pemfile = Buffer.from(id.cert, 'base64').toString();
                const capem = Buffer.from(id.ca, 'base64').toString();

                // Some of the Fabric tools, specifically the fabric-ca-client assume that the certificate is referred to as cert.pem
                // writeFileSync(path.join(cryptoroot, 'msp', 'signcerts', `${id.id}.pem`), pemfile);
                // writeFileSync(path.join(cryptoroot, 'msp', 'admincerts', `${id.id}.pem`), pemfile);
                writeFileSync(path.join(cryptoroot, 'msp', 'signcerts', `cert.pem`), pemfile);
                writeFileSync(path.join(cryptoroot, 'msp', 'admincerts', `cert.pem`), pemfile);

                writeFileSync(path.join(cryptoroot, 'msp', 'keystore', `cert_sk`), privateKey);
                writeFileSync(path.join(cryptoroot, 'msp', 'cacerts', 'ca.pem'), capem);

                if (envvars[id.wallet]) {
                    envvars[id.wallet].ids[id.id] = path.join(cryptoroot, 'msp');
                }
            },
        );

        log({ msg: '\nEnvironment variables:' });
        for (const org in envvars) {
            const value = envvars[org];
            log({ msg: JSON.stringify(value) });
            for (const id in value.ids) {
                log({ msg: `\nFor ${id} @  ${org} use these:\n` });
                console.log(`export CORE_PEER_LOCALMSPID=${value.mspid}`);
                console.log(`export CORE_PEER_MSPCONFIGPATH=${value.ids[id]}`);
                console.log(`export CORE_PEER_TLS_ENABLED=true`);
                console.log(`export CORE_PEER_TLS_ROOT_CERT_FILE=${value.tlsrootcert}`);
                value.peers.forEach((p) => {
                    console.log(`export CORE_PEER_ADDRESS=${p}`);
                });
            }
        }
        if (gwPath) {
            writeFileSync(path.join(gwPath, 'info.json'), '{}');
        }

        return envvars;
    }

    async asyncForEach(array: any, callback: callbackFn): Promise<void> {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index]);
        }
    }
}
