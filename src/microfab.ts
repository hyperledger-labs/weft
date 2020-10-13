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

export default class MicrofabProcessor {
    public async process(
        configFile: string,
        gatewaypath: string,
        walletpath: string,
        cryptopath: string,
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

        interface EnvVars {
            [org: string]: { mspid: string; peers: string[]; ids: { [id: string]: string } };
        }

        const envvars: EnvVars = {};

        const config = JSON.parse(cfgStr);

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
                    };
                },
            );

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
                writeFileSync(path.join(cryptoroot, 'msp', 'signcerts', `${id.id}.pem`), pemfile);
                writeFileSync(path.join(cryptoroot, 'msp', 'admincerts', `${id.id}.pem`), pemfile);
                writeFileSync(path.join(cryptoroot, 'msp', 'keystore', `cert_sk`), privateKey);
                writeFileSync(path.join(cryptoroot, 'msp', 'cacerts', 'ca.pem'), capem);

                if (envvars[id.wallet]) {
                    envvars[id.wallet].ids[id.id] = path.join(cryptoroot, 'msp'); //push(`export CORE_PEER_MSPCONFIGPATH=${path.join(cryptoroot, 'msp')}`);
                }
            },
        );

        log({ msg: '\nEnvironment variables:' });
        for (const org in envvars) {
            const value = envvars[org];
            for (const id in value.ids) {
                log({ msg: `\nFor ${id} @  ${org} use these:\n` });
                console.log(`export CORE_PEER_LOCALMSPID=${value.mspid}`);
                console.log(`export CORE_PEER_MSPCONFIGPATH=${value.ids[id]}`);
                value.peers.forEach((p) => {
                    console.log(`export CORE_PEER_ADDRESS=${p}`);
                });
                // log({ msg: JSON.stringify(value) });
            }
        }
    }

    async asyncForEach(array: any, callback: callbackFn): Promise<void> {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index]);
        }
    }
}
