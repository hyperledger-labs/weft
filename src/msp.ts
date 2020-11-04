/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'path';
import { writeFileSync } from 'fs';
import * as mkdirp from 'mkdirp';
import sanitize from 'sanitize-filename';

// import { log } from './log';

export default class MSP {
    /** create the directory structure for the msp directory
     *
     */
    public createStructure(cryptoroot: string): void {
        mkdirp.sync(path.join(cryptoroot, 'msp'));
        mkdirp.sync(path.join(cryptoroot, 'msp', 'cacerts'));
        mkdirp.sync(path.join(cryptoroot, 'msp', 'keystore'));
        mkdirp.sync(path.join(cryptoroot, 'msp', 'signcerts'));
        mkdirp.sync(path.join(cryptoroot, 'msp', 'admincerts'));
        mkdirp.sync(path.join(cryptoroot, 'tls'));
    }

    /**
     * Write an individual id based on the jsonIdentity supplied
     *
     * @param rootdir
     * @param jsonIdentity
     * @param mspid
     */
    public writeId(rootdir: string, jsonIdentity: string, mspid?: string): void {
        const id = JSON.parse(jsonIdentity);

        if (!id.msp_id) {
            id.msp_id = mspid;
        }
        id.id = sanitize(id.name);
        const cryptoroot = path.resolve(rootdir, id.id);
        this.createStructure(cryptoroot);

        const privateKey = Buffer.from(id.private_key, 'base64').toString();
        const pemfile = Buffer.from(id.cert, 'base64').toString();
        const capem = Buffer.from(id.ca, 'base64').toString();
        writeFileSync(path.join(cryptoroot, 'msp', 'signcerts', `${id.id}.pem`), pemfile);
        writeFileSync(path.join(cryptoroot, 'msp', 'admincerts', `${id.id}.pem`), pemfile);
        writeFileSync(path.join(cryptoroot, 'msp', 'keystore', `cert_sk`), privateKey);
        writeFileSync(path.join(cryptoroot, 'msp', 'cacerts', 'ca.pem'), capem);
    }
}
