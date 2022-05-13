/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'path';
import * as fs from 'fs';
import { FullCfg, IPackager } from './chaincodePackage';

import { log } from '../log';
import BasePackager from './basepackager';

/** Specific packager for Typescript code.
 *
 * Will pacakge all the files that are in the tsconfig.json 'out' property (or lib by default)
 * along with package.json/package-lock.json/npm-shrinkwrap.json
 */
export default class TypescriptPackager extends BasePackager implements IPackager {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public constructor(ccpath: string, label: string, _config: FullCfg, archivePath: string) {
        super(ccpath, label, archivePath);
    }

    /**
     * Interface method to start the packaging
     */
    public async pack(): Promise<void> {
        // const innerTgz = new TGZHelper();

        // check the location of the built output, defaulting if needed
        const tsconfig = JSON.parse(fs.readFileSync(path.join(this.getCCPath(), 'tsconfig.json'), 'utf-8'));
        let outDir: string;
        if (tsconfig.compilerOptions && tsconfig.compilerOptions.outDir) {
            outDir = tsconfig.compilerOptions.outDir;
        } else {
            outDir = 'lib';
        }

        if (!fs.existsSync(path.join(this.getCCPath(), outDir))) {
            throw new Error(`Location of built code "${outDir}" can not be found`);
        } else {
            log({ msg: `Looking at built files in "${outDir}" ...` });
        }

        const filterFn = (source: string): string => {
            let prefix = 'src';
            if (source.startsWith('META-INF')) {
                prefix = '';
            } else if (source.startsWith(outDir)) {
                return path.join(prefix, source);
            } else if (source === 'package.json' || source === 'package-lock.json' || source == 'npm-shrinkwrap.json') {
                return path.join(prefix, source);
            }

            return '';
        };
        // Get all the files in the outDir, and add them to the 'innerTgz' file
        const allFiles = await super.findSource(filterFn);
        log({ msg: `Located ${allFiles.length} files ...` });
        await super.generateTgz('node', allFiles);
    }
}
