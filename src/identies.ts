/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as path from 'path';
import * as WalletMigration from 'fabric-wallet-migration';
import { Wallets, Wallet } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import { log, Type } from './log';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolveWalletPath } from './userutils';

/**
 * Class to help manage the transition between IBP and Application Wallet identities
 *
 * Also can managed with the help of the fabric-wallet-migration module, copying between
 * v1.4 SDK and v2.2 SDK wallets
 */
export default class Identities {
    private walletpath: string;
    private profile: any;
    private is14Wallet: boolean;

    /**
     * Create a new instance to perform work.
     *
     * @param walletpath Wallet path
     * @param profile Optional connection profile
     */
    public constructor(walletpath: string, is14Wallet = false, profile?: any) {
        this.walletpath = walletpath;
        this.profile = profile;
        this.is14Wallet = is14Wallet;
    }

    /**
     * Lists the identities to the console.
     */
    async list(): Promise<void> {
        const wallet = await this.getWallet(this.walletpath, this.is14Wallet);
        (await wallet.list()).forEach((s: string) => {
            log({ val: `${s}` });
        });
    }

    /** Migrates from the current wallet to a new destination.
     * It is an error to try to migrate from the same version.
     */
    async migrateWallet(walletToPath: string, target14: boolean): Promise<void> {
        if (target14 === this.is14Wallet) {
            throw new Error('Unable to migrated from same versions');
        }

        const walletTo = await this.getWallet(resolveWalletPath(walletToPath, true), target14);
        const walletFrom = await this.getWallet(resolveWalletPath(this.walletpath, false), !target14); // choose the opposite for the wallet type
        const identityLabels = await walletFrom.list();
        for (const label of identityLabels) {
            const identity = await walletFrom.get(label);
            if (identity) {
                await walletTo.put(label, identity);
            }
        }
    }

    /**
     * Copy a given identity from the wallet
     *
     * @param label name of the identity to copy
     * @param walletToPath path of the destination wallet
     * @param target14 what type of the destination wallet is
     */
    async copyTo(label: string, walletToPath: string, target14 = false): Promise<void> {
        const walletFrom = await this.getWallet(resolveWalletPath(this.walletpath, false));
        const walletTo = await this.getWallet(resolveWalletPath(walletToPath, false), target14);
        const identity = await walletFrom.get(label);
        if (identity) {
            await walletTo.put(label, identity);
        }
    }

    /**
     * Given a path create a new wallet
     *
     * @param walletPath
     * @param compat
     */
    private async getWallet(walletPath: string, compat?: boolean): Promise<Wallet> {
        let wallet;
        if (compat) {
            const walletStore = await WalletMigration.newFileSystemWalletStore(walletPath);
            wallet = new Wallet(walletStore);
        } else {
            wallet = await Wallets.newFileSystemWallet(walletPath);
        }
        return wallet;
    }

    async importFromCryptoConfig(dir: string, msp_id: string): Promise<void> {
        const cryptoDir = path.resolve(dir);
        if (!existsSync(cryptoDir)) {
            throw new Error(`Unable to find the directory ${dir}`);
        }

        // assume that the name is the core of the directory
        const name = path.basename(cryptoDir);

        const privateKeyPath = path.join(cryptoDir, 'msp', 'keystore', 'priv_sk');
        if (!existsSync(privateKeyPath)) {
            throw new Error(`Unable to find private key at ${privateKeyPath}`);
        }
        const privateKey = readFileSync(privateKeyPath, 'utf-8');

        const certPath = path.join(cryptoDir, 'msp', 'signcerts', `${name}-cert.pem`);
        if (!existsSync(certPath)) {
            throw new Error(`Unable to find private key at ${privateKeyPath}`);
        }
        const certificate = readFileSync(certPath, 'utf-8');

        // Create a new file system based wallet for managing identities.
        const walletPath = path.resolve(this.walletpath);
        const wallet = await this.getWallet(this.walletpath, this.is14Wallet);

        // Check to see if we've already got the user.
        const userIdentity = await wallet.get(name);
        if (userIdentity) {
            throw new Error(`An identity for the user "${name}" already exists in the wallet`);
        }

        const identity = {
            credentials: {
                certificate,
                privateKey,
            },
            mspId: msp_id,
            type: 'X.509',
        };

        await wallet.put(name, identity);

        log({ msg: `Added identity under label ${name} to the wallet at ${walletPath}` });
    }

    /**
     * Import a JSON string identity to the application wallet
     *
     * If the identity is already in the wallet and error is thrown.
     *
     * @param jsonIdentity JSON format string from IBP
     * @param mspid  MSPID to add to the identity if needed
     * @param compat is the
     */
    async importToWallet(jsonIdentity: string, mspid?: string): Promise<void> {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.resolve(this.walletpath);
        const wallet = await this.getWallet(this.walletpath, this.is14Wallet);

        const id = JSON.parse(jsonIdentity);

        if (!id.msp_id) {
            id.msp_id = mspid;
        }

        // Check to see if we've already got the user.
        const userIdentity = await wallet.get(id.name);
        if (userIdentity) {
            throw new Error(`An identity for the user "${id.name}" already exists in the wallet`);
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

    /** Take an identity from the applicable wallet and create a JSON file suitable for IBP
     * An error is thrown if the name is not in the wallet
     *
     * The destination must be wrtieable and will be overwritten
     *
     */

    async exportFromWallet(name: string, jsonfile: string): Promise<void> {
        const wallet = await this.getWallet(this.walletpath, this.is14Wallet);

        // Check to see if we've already got the user.
        const userIdentity = await wallet.get(name);
        if (!userIdentity) {
            log({ msg: `An identity for the user "${name}" does not exist in the wallet`, type: Type.ERROR });
            return;
        }

        const cert = (userIdentity as any).credentials.certificate;
        const privateKey = (userIdentity as any).credentials.privateKey;
        const jsonId = {
            name,
            cert: Buffer.from(cert).toString('base64'),
            private_key: Buffer.from(privateKey).toString('base64'),
        };

        writeFileSync(path.resolve(jsonfile), JSON.stringify(jsonId));

        log({ msg: `Exported identity under name ${name} to the JSON file ${jsonfile}` });
    }

    /**
     * Entroll the id specified, with the enroll password specified, and add it to the
     * wallet under name
     *
     * This requires this Indentities object to have been created with a connection profile
     *
     * @param name label to add the identity under
     * @param enrollid  enroll id
     * @param enrollpwd  enroll password
     */
    async enroll(name: string, enrollid: string, enrollpwd: string): Promise<void> {
        const wallet = await this.getWallet(this.walletpath, this.is14Wallet);
        // get the gateway profile

        if (!this.profile) {
            throw new Error('Gateway connection profile has not been specified');
        }

        const orgName = this.profile.client.organization;
        log({ msg: `Using the organization : ${orgName}` });

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

        let ca;
        if (caInfo.tlsCACerts) {
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
        } else {
            ca = new FabricCAServices(caInfo.url);
        }

        const userExists = await wallet.get(name);
        if (userExists) {
            throw new Error(`An identity for the client user ${name} already exists in the wallet`);
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: enrollid, enrollmentSecret: enrollpwd });
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

    /**
     * Registers a new user under the enroll id given
     * The connection profile is required for this function, and error is thrown if not present
     *
     * @param enrollid
     * @param adminUser
     * @param affiliation
     *
     * @return the enrollpwd
     */
    async register(enrollid: string, adminUser: string, affiliation = ''): Promise<string> {
        const wallet = await this.getWallet(this.walletpath, this.is14Wallet);
        // get the gateway profile

        if (!this.profile) {
            throw new Error('Gateway connection profile has not been specified');
        }

        const orgName = this.profile.client.organization;
        log({ msg: `Using the organization : ${orgName}` });

        // Create a new CA client for interacting with the CA.
        const cas = this.profile.organizations[orgName].certificateAuthorities;

        let caname;
        if (cas.length === 0) {
            throw new Error('No CAs listed in gateway');
        } else if (cas.length === 1) {
            caname = cas[0];
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get(adminUser);
        if (!adminIdentity) {
            const msg = `An identity for the admin user "${adminUser}" does not exist in the wallet`;
            log({ msg, type: Type.ERROR });
            throw new Error(msg);
        }
        const caInfo = this.profile.certificateAuthorities[caname];
        let ca;
        if (caInfo.tlsCACerts) {
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
        } else {
            ca = new FabricCAServices(caInfo.url);
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUserCtx = await provider.getUserContext(adminIdentity, adminUser);
        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register(
            {
                affiliation,
                enrollmentID: enrollid,
                role: 'client',
            },
            adminUserCtx,
        );

        return secret;
    }
}
