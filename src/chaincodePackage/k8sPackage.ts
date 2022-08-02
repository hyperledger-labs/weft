/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { IPackager, k8sCfg } from './chaincodePackage';
import TGZHelper from './tgzHelper';

export default class K8SPackager implements IPackager {
    // private config: PackageConfig;

    private archivePath: string;
    private label: string;
    private cfg: k8sCfg;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public constructor(_ccpath: string, label: string, config: k8sCfg, archivePath: string) {
        this.label = label;
        this.cfg = config;
        this.archivePath = archivePath;
    }

    public async pack(): Promise<void> {
        await this.asService();
    }

    private async asService(): Promise<void> {
        const connection = {
            imageurl: this.cfg.imageurl,
            pullsecret: this.cfg.pullsecret,
            pullpolicy: this.cfg.pullpolicy,
        };
        const innerTgz = new TGZHelper();
        await innerTgz.entryText(JSON.stringify(connection), 'src/connection.json');
        // finalize the innerTgz, should flush to disk
        const tmp = await innerTgz.finalize();

        // create the outer tgz.
        const outerTgz = new TGZHelper(this.archivePath);
        const metadata = { type: 'k8s', label: this.label };

        await outerTgz.entryText(JSON.stringify(metadata), 'metadata.json');
        await outerTgz.entryFile(tmp, 'code.tar.gz');
        await outerTgz.finalize();
    }
}
