/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import tar from 'tar-stream';
import * as path from 'path';
import * as zlib from 'zlib';
import * as os from 'os';

export interface FileInfo {
    name: string;
    fqp: string;
}

export default class TGZHelper {
    private pack;
    private gzip;
    private streamDonePromise: Promise<string>;

    constructor(filename?: string) {
        this.pack = tar.pack(); // pack is a streams2 stream
        this.gzip = zlib.createGzip();

        if (!filename) {
            const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccp-'));
            filename = path.join(tmpdir, 'file.tar.gz');
        }

        const fileStream = fs.createWriteStream(filename);
        const outStream = this.pack.pipe(this.gzip).pipe(fileStream);

        this.streamDonePromise = new Promise((resolve, reject) => {
            outStream
                .on('finish', () => {
                    fs.stat(filename!, (err) => {
                        if (err) reject(err);
                        resolve(filename!);
                    });
                })
                .on('error', (err) => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    public async finalize(): Promise<string> {
        this.pack.finalize();
        return await this.streamDonePromise;
    }

    /** Add an entry containing 'text' under 'name' */
    public async entryText(text: string, name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pack.entry({ name }, text, (err) => {
                if (err) reject(err);
                // this.pack.finalize();
                resolve();
            });
        });
    }

    /** Add an entry from a file */
    public async entryFileinfo(fileinfo: FileInfo): Promise<void> {
        const buffer = fs.readFileSync(fileinfo.fqp);
        return new Promise((resolve, reject) => {
            this.pack.entry({ name: fileinfo.name }, buffer, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve();
            });
        });
    }

    /** Add an entry from a file */
    public async entryFile(filename: string, name: string): Promise<void> {
        const buffer = fs.readFileSync(filename);
        return new Promise((resolve, reject) => {
            this.pack.entry({ name }, buffer, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve();
            });
        });
    }
}
