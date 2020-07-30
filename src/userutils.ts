/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import rimraf from 'rimraf';

export const resolveWalletPath = (walletPath: string): string => {
    let wp = path.resolve(walletPath);
    if (!fs.existsSync(wp)) {
        // so doesn't exist so try to check a default location
        const homeWalletPath = path.join(os.homedir(), '.ibpwallets', walletPath);
        if (!fs.existsSync(homeWalletPath)) {
            // give up
            throw new Error(`Can not locate wallet ${wp} or ${homeWalletPath}`);
        } else {
            wp = homeWalletPath;
        }
    }
    return wp;
};

export const resolveGatewayPath = (gatewayPath: string): string => {
    let cp = path.resolve(gatewayPath);
    if (!fs.existsSync(cp)) {
        // so doesn't exist so try to check a default location
        const gateway = path.join(os.homedir(), '.ibpgateways', gatewayPath);
        if (!fs.existsSync(gateway)) {
            // give up
            throw new Error(`Can not locate gateway ${cp}`);
        } else {
            cp = gateway;
        }
    }

    if (fs.statSync(cp).isDirectory()) {
        cp = path.join(cp, 'gateway.json');
    }

    return cp;
};

export const saneReadFile = (name: string): string => {
    const wp = path.resolve(name);
    if (!fs.existsSync(wp)) {
        // give up
        throw new Error(`Can not locate ${wp}`);
    }

    return fs.readFileSync(wp, 'utf8');
};

export const createIfAbsent = (name: string): void => {
    const wp = path.resolve(name);
    if (!fs.existsSync(wp)) {
        mkdirp.sync(wp);
    }
};

export const clean = (name: string): void => {
    const wp = path.resolve(name);
    if (fs.existsSync(wp)) {
        rimraf.sync(wp);
        mkdirp.sync(wp);
    }
};
