/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { log } from '../log';
import BasePackager, { StdFilter } from './basepackager';
import { FullCfg, IPackager } from './chaincodePackage';

export default class GoPackager extends BasePackager implements IPackager {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public constructor(ccpath: string, label: string, _config: FullCfg, archivePath: string) {
        super(ccpath, label, archivePath);
    }

    public async pack(): Promise<void> {
        const allFiles = await super.findSource(StdFilter);
        log({ msg: `Located ${allFiles.length} files ...` });
        await super.generateTgz('go', allFiles);
    }
}
