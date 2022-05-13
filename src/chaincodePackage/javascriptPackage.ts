/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { FullCfg, IPackager } from './chaincodePackage';
import { log } from '../log';
import BasePackager, { NodeStdFilter } from './basepackager';

export default class JavacriptPackager extends BasePackager implements IPackager {
    // private config: PackageConfig;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public constructor(ccpath: string, label: string, _config: FullCfg, archivePath: string) {
        super(ccpath, label, archivePath);
    }

    public async pack(): Promise<void> {
        const allFiles = await super.findSource(NodeStdFilter, ['.fabricignore', '.npmignore']);
        log({ msg: `Located ${allFiles.length} files ...` });
        await super.generateTgz('node', allFiles);
    }
}
