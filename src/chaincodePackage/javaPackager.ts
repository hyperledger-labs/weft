/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'path';
import { FullCfg, IPackager } from './chaincodePackage';

import { log } from '../log';
import BasePackager, { MetaOnlyFilter, StdFilter } from './basepackager';
import { FileInfo } from './tgzHelper';

/** Specific packager for Typescript code.
 *
 * If the path is a JAR file that will be packaged, along with any META-INF directory as a peer
 * If the path is a directory with one of more JARS, they will be packaged, along with any
 *  META-INFO drecitory as a direct descendant
 *
 * If it is a directory, then if it has a build.gradle/build.gradle.kts or pom.xml then all files will be packaged
 * into src, with the META-INF
 */
export default class JavaPackager extends BasePackager implements IPackager {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public constructor(ccpath: string, label: string, _config: FullCfg, archivePath: string) {
        super(ccpath, label, archivePath);
    }

    /**
     * Interface method to start the packaging
     */
    public async pack(): Promise<void> {
        let allFiles;
        const ccPath = this.getCCPath();
        const fileReferenced = this.getFileReferenced();

        if (fileReferenced) {
            allFiles = await super.findSource(MetaOnlyFilter);
            // add the extra file
            const f: FileInfo = { name: path.join('src', fileReferenced), fqp: path.join(ccPath, fileReferenced) };

            allFiles.push(f);
        } else {
            allFiles = await super.findSource(StdFilter);
        }

        // Get all the files in the outDir, and add them to the 'innerTgz' file
        log({ msg: `Located ${allFiles.length} files ...` });
        await super.generateTgz('java', allFiles);
    }
}
