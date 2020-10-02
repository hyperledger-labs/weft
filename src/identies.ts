/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as path from 'path';
import * as WalletMigration from 'fabric-wallet-migration';
import { Wallets, Wallet } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import { log } from './log';
export default class Identities {
    private walletpath: string;
    private profile: any;

    public constructor(walletpath: string, profile?: any) {
        this.walletpath = walletpath;
        this.profile = profile;
    }

    async list(): Promise<void> {
        const walletPath = path.resolve(this.walletpath);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        (await wallet.list()).forEach((s: string) => {
            log({ val: `${s}` });
        });
    }

    async importToWallet(jsonIdentity: string, mspid?: string, compat?: boolean): Promise<void> {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.resolve(this.walletpath);
        let wallet;
        if (compat) {
            const walletStore = await WalletMigration.newFileSystemWalletStore(walletPath);
            wallet = new Wallet(walletStore);
        } else {
            wallet = await Wallets.newFileSystemWallet(walletPath);
        }

        const id = JSON.parse(jsonIdentity);

        if (!id.msp_id) {
            id.msp_id = mspid;
        }

        // Check to see if we've already got the user.
        const userIdentity = await wallet.get(id.name);
        if (userIdentity) {
            log({ msg: `An identity for the user "${id.name}" already exists in the wallet`, error: true });
            return;
        }

        const certificate = Buffer.from(id.cert, 'base64').toString();
        const privateKey = Buffer.from(id.private_key, 'base64').toString();
        const identity = {
            credentials: {
                certificate,
                privateKey,
            },
            mspId: id.msp_id,
            type: 'X.509',
        };

        await wallet.put(id.name, identity);

        log({ msg: `Added identity under label ${id.name} to the wallet at ${walletPath}` });
    }

    async enroll(name: string, enrollid: string, enrollpwd: string): Promise<void> {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.resolve(this.walletpath);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // get the gateway profile

        const orgName = this.profile.client.organization;
        console.log(`Using the organization : ${orgName}`);

        const orgmspid = this.profile.organizations[orgName].mspid;

        // Create a new CA client for interacting with the CA.
        const cas = this.profile.organizations[orgName].certificateAuthorities;

        let caname;
        if (cas.length === 0) {
            throw new Error('No CAs listed in gateway');
        } else if (cas.length === 1) {
            caname = cas[0];
        }
        const caInfo = this.profile.certificateAuthorities[caname];

        const caTLSCACerts = caInfo.tlsCACerts.pem;
        console.log('Creaging new FabricCAServices');
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
        console.log('created services');
        const userExists = await wallet.get(name);
        if (userExists) {
            console.log(`An identity for the client user ${name} already exists in the wallet`);
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        console.log(`calling enroll ${enrollid}  ${enrollpwd}`);
        const enrollment = await ca.enroll({ enrollmentID: enrollid, enrollmentSecret: enrollpwd });
        console.log('errorled');
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgmspid,
            type: 'X.509',
        };
        await wallet.put(name, x509Identity);
    }
}
