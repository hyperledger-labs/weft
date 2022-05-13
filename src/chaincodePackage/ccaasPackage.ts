/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { IPackager, ServiceCfg } from './chaincodePackage';
import TGZHelper from './tgzHelper';

export default class CCAASPackager implements IPackager {
    private archivePath: string;
    private label: string;
    private cfg: ServiceCfg;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public constructor(_ccpath: string, label: string, config: ServiceCfg, archivePath: string) {
        this.label = label;
        this.cfg = config;
        this.archivePath = archivePath;
    }

    public async pack(): Promise<void> {
        await this.asService();
    }

    private async asService(): Promise<void> {
        const connection = {
            address: this.cfg.address,
            dial_timeout: this.cfg.timeout,
            tls_required: this.cfg.tlsRequired,
        };
        const innerTgz = new TGZHelper();
        await innerTgz.entryText(JSON.stringify(connection), 'src/connection.json');
        // finalize the innerTgz, should flush to disk
        const tmp = await innerTgz.finalize();

        // create the outer tgz.
        const outerTgz = new TGZHelper(this.archivePath);
        const metadata = { type: 'node', label: this.label };

        await outerTgz.entryText(JSON.stringify(metadata), 'metadata.json');
        await outerTgz.entryFile(tmp, 'code.tar.gz');
        await outerTgz.finalize();
    }
}
