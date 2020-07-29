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
            [org: string]: string[];
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
                    organizations: { [name: string]: { mspid: string; peers: string } };
                }) => {
                    const profilePath = path.resolve(gatewaypath, `${sanitize(gateway.id)}.json`);
                    writeFileSync(profilePath, JSON.stringify(gateway));

                    const org = gateway.client.organization;
                    const e = [];

                    e.push(`export CORE_PEER_LOCALMSPID=${gateway.organizations[org].mspid}`);
                    e.push(`export CORE_PEER_ADDRESS=${gateway.organizations[org].peers[0]}`);
                    envvars[org as string] = e;

                    //console.log(gateway);
                },
            );

        const dockerCmd: string[] = [];
        // locate the identities
        await this.asyncForEach(
            config.filter((c: { type: string }) => c.type === 'identity'),
            async (id: { wallet: any; name: any; id: any; private_key: string; cert: string }) => {
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

                const privateKey = Buffer.from(id.private_key, 'base64').toString();
                const pemfile = Buffer.from(id.cert, 'base64').toString();
                writeFileSync(path.join(cryptoroot, 'msp', 'signcerts', `${id.id}.pem`), pemfile);
                writeFileSync(path.join(cryptoroot, 'msp', 'keystore', `cert_sk`), privateKey);

                const capem = path.join(cryptoroot, 'msp', 'cacerts', 'ca.pem');
                const cfgpath = path.join(cryptoroot, 'msp', 'config.yaml');

                // console.log(id);

                if (envvars[id.wallet]) {
                    envvars[id.wallet].push(`export CORE_PEER_MSPCONFIGPATH=${path.join(cryptoroot, 'msp')}`);
                }

                dockerCmd.push(
                    `docker exec -t microfab cat /opt/microfab/data/peer-${id.wallet.toLowerCase()}/msp/cacerts/ca.pem > ${capem}`,
                );
                dockerCmd.push(
                    `docker exec -t microfab cat /opt/microfab/data/peer-${id.wallet.toLowerCase()}/msp/config.yaml > ${cfgpath}`,
                );
            },
        );
        log({ msg: 'Environment variables' });
        console.log(envvars);
        log({ msg: 'Docker commands to get the final file parts' });
        console.log(dockerCmd);
        //await writeEnvVar(argv);
    }

    async asyncForEach(array: any, callback: callbackFn): Promise<void> {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index]);
        }
    }
    // async writeEnvVar(argv) {
    //     const cmds = `
    // export CORE_PEER_ADDRESS="localhost:18051"

    // # Identifity of the Organization
    // export CORE_PEER_LOCALMSPID="${argv.org}"

    // # Location of the wallet for the user to be used
    // export CORE_PEER_MSPCONFIGPATH="${repo_root}/${argv.org}/${argv.user}"

    // # If tls is enabled for the network communcations, and note the root certificate, and the Orderer's TLS cert
    // export CORE_PEER_TLS_ENABLED="true"
    // export CORE_PEER_TLS_ROOTCERT_FILE="${repo_root}/${argv.org}/tls-root.pem"
    // export ORDERER_TLS_CERT=${repo_root}/Orderer/ca-tls-root.pem

    // # Will need the TLS for each Peer
    // export AMPRETIA_PEER_TLS=${repo_root}/${argv.org}/ampretiapeer1tls/ca.crt

    // # Need the configuration directory, though no clear what is actually needed from it
    // export FABRIC_CFG_PATH=/usr/local/config/
    // `;

    //     fs.writeFileSync(path.join(envpath, 'envvar.sh'), cmds);
    // }
}
