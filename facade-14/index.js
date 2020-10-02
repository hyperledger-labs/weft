/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet,  X509WalletMixin } = require('fabric-network');
const path = require('path')
const importToWallet = async (walletpath, jsonIdentity,mspid) => {

    const wp = path.resolve(walletpath);
    const wallet = new FileSystemWallet(wp);

    const id = JSON.parse(jsonIdentity);

    if (!id.msp_id) {
        id.msp_id = mspid;
    }
    const certificate = Buffer.from(id.cert, 'base64').toString();
    const privateKey = Buffer.from(id.private_key, 'base64').toString();

    const userIdentity = X509WalletMixin.createIdentity( id.msp_id, certificate, privateKey);
    await wallet.import(id.name, userIdentity);

}

module.exports= { importToWallet };