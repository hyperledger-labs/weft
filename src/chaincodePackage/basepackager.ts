import * as path from 'path';
import * as fs from 'fs';
import walk from 'ignore-walk';
import TGZHelper, { FileInfo } from './tgzHelper';
import { log } from '../log';

interface FilterFunction {
    (source: string): string;
}

export const MetaOnlyFilter: FilterFunction = (source: string): string => {
    if (source.startsWith('META-INF')) {
        return source;
    }
    return '';
};

export const StdFilter: FilterFunction = (source: string): string => {
    let prefix = 'src';
    if (source.startsWith('META-INF')) {
        prefix = '';
    }

    return path.join(prefix, source);
};

export const NodeStdFilter: FilterFunction = (source: string): string => {
    let prefix = 'src';
    if (source.startsWith('META-INF')) {
        prefix = '';
    } else if (source.startsWith('node_modules')) {
        return '';
    }

    return path.join(prefix, source);
};

export default class BasePackager {
    private _ccpath;
    private _label;
    private _archivePath;
    private _fileReferenced: string | undefined;

    public constructor(ccpath: string, label: string, archivePath: string) {
        this._archivePath = archivePath;

        const stat = fs.lstatSync(ccpath);
        if (stat.isFile()) {
            this._ccpath = path.dirname(ccpath);
            this._fileReferenced = path.basename(ccpath);
        } else {
            this._ccpath = ccpath;
        }
        this._ccpath = ccpath;
        this._label = label;
    }

    public getCCPath(): string {
        return this._ccpath;
    }

    public getFileReferenced(): string | undefined {
        return this._fileReferenced;
    }

    public getLabel(): string {
        return this._label;
    }

    public getArchivePath(): string {
        return this._archivePath;
    }

    /**
     * Given an input 'filePath', recursively parse the filesystem for any files
     * that fit the criteria for being valid node chaincode source
     *
     * @param filePath
     * @returns {Promise}
     */
    public async findSource(filterFn: FilterFunction, ignoreFiles = ['.fabricignore']): Promise<FileInfo[]> {
        let files = await walk({
            path: this.getCCPath(),
            // applies filtering based on the same rules as "npm publish":
            // if .npmignore exists, uses rules it specifies
            ignoreFiles,
            // follow symlink dirs
            follow: true,
        });

        const descriptors: FileInfo[] = [];

        if (!files) {
            files = [];
        }

        files.forEach((entry) => {
            const namePath = filterFn(entry);
            if (namePath && namePath !== '') {
                const desc: FileInfo = {
                    name: namePath.split('\\').join('/'), // for windows style paths
                    fqp: path.join(this.getCCPath(), entry),
                };

                descriptors.push(desc);
            }
        });

        return descriptors;
    }

    public async generateTgz(type: string, allFiles: FileInfo[]): Promise<void> {
        const innerTgz = new TGZHelper();

        for (let i = 0; i < allFiles.length; i++) {
            log({ msg: `File #${i} ${allFiles[i].name}` });
            await innerTgz.entryFileinfo(allFiles[i]);
        }

        // finalize the innerTgz, should flush to disk
        const tmp = await innerTgz.finalize();

        // create the outer tgz.
        const outerTgz = new TGZHelper(this.getArchivePath());
        const metadata = { type, label: this.getLabel() };

        await outerTgz.entryText(JSON.stringify(metadata), 'metadata.json');
        await outerTgz.entryFile(tmp, 'code.tar.gz');
        await outerTgz.finalize();
    }
}
