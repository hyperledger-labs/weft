/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as path from 'path';
import * as fs from 'fs';
import TypescriptPackager from './typescriptPackage';
import JavacriptPackager from './javascriptPackage';
import { log } from '../log';

import * as crypto from 'crypto';
import CCAASPackager from './ccaasPackage';
import K8SPackager from './k8sPackage';
import JavaPackager from './javaPackager';
import GoPackager from './goPackage';

export enum Language {
    Typescript = 'TypeScript',
    Javascript = 'JavaScript',
    Go = 'Go',
    Java = 'Java',
    unknown = 'Unknown',
    auto = 'auto',
}

export enum Format {
    CCAAS = 'ccaas',
    K8S = 'k8s',
    FULL = 'full',
    unknow = 'unknown',
}

export interface PackagedInfo {
    packageId: string;
    packagePath: string;
}

export interface PackageConfig {
    path: string;
    archivePath: string;
    label: string;
    format: Format;
    cfg: ServiceCfg | k8sCfg | FullCfg;
}

export interface ServiceCfg {
    address: string;
    tlsRequired: boolean;
    timeout: string;
}

export interface k8sCfg {
    imageurl: string;
    pullsecret: string;
    pullpolicy: string;
}

export interface FullCfg {
    langauge: string;
}

export interface IPackager {
    pack(): Promise<void>;
}

export default class ChaincodePackage {
    private ccpath: string;
    private detectedLanguage: Language;
    private packageFormat: Format;
    private label: string;
    private archivePath: string;
    private cfg: ServiceCfg | k8sCfg | FullCfg;

    public constructor(config: PackageConfig) {
        this.ccpath = path.resolve(config.path);
        if (!fs.existsSync(this.ccpath)) {
            throw new Error(`Can not find ${this.ccpath} does not exist`);
        }
        this.label = config.label;
        this.cfg = config.cfg;
        this.packageFormat = config.format;
        this.archivePath = config.archivePath;
        this.detectedLanguage = Language.unknown;
    }

    public confirmLanguage(): Language {
        const lang = (this.cfg as FullCfg).langauge;

        if (lang === Language.auto) {
            log({ msg: 'Automatically detecting chaincode and contract language ...' });
            this.detectedLanguage = this.autoDetect();
        } else {
            switch (lang.toLocaleLowerCase()) {
                case 'java':
                    this.detectedLanguage = Language.Java;
                    break;
                case 'go':
                    this.detectedLanguage = Language.Go;
                    break;
                case 'javascript':
                    this.detectedLanguage = Language.Javascript;
                    break;
                case 'typescript':
                    this.detectedLanguage = Language.Typescript;
                    break;
                default:
                    throw new Error(`Can not match ${lang} to any knnown language`);
            }
        }

        log({ msg: `Detected "${this.detectedLanguage}"` });
        return this.detectedLanguage;
    }

    public async pack(): Promise<string> {
        let packager: IPackager;
        switch (this.packageFormat) {
            case Format.CCAAS:
                packager = new CCAASPackager(this.ccpath, this.label, this.cfg as ServiceCfg, this.archivePath);
                break;
            case Format.K8S:
                packager = new K8SPackager(this.ccpath, this.label, this.cfg as k8sCfg, this.archivePath);
                break;
            case Format.FULL:
                this.detectedLanguage = this.confirmLanguage();
                switch (this.detectedLanguage) {
                    case Language.Typescript:
                        packager = new TypescriptPackager(
                            this.ccpath,
                            this.label,
                            this.cfg as FullCfg,
                            this.archivePath,
                        );
                        break;
                    case Language.Javascript:
                        packager = new JavacriptPackager(
                            this.ccpath,
                            this.label,
                            this.cfg as FullCfg,
                            this.archivePath,
                        );
                        break;
                    case Language.Java:
                        packager = new JavaPackager(this.ccpath, this.label, this.cfg as FullCfg, this.archivePath);
                        break;
                    case Language.Go:
                        packager = new GoPackager(this.ccpath, this.label, this.cfg as FullCfg, this.archivePath);
                        break;
                    default:
                        throw new Error(`Language ${this.detectedLanguage} unknown`);
                }
                break;
            default:
                throw new Error(`Unknown package type ${this.packageFormat}`);
        }

        await packager.pack();
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fs.readFileSync(this.archivePath));
        return `${this.label}:${hashSum.digest('hex')}`;
    }

    private autoDetect() {
        if (this.ccpath.endsWith('.jar')) {
            return Language.Java;
        } else if (fs.existsSync(path.join(this.ccpath, 'package.json'))) {
            // node.js
            if (fs.existsSync(path.join(this.ccpath, 'tsconfig.json'))) {
                return Language.Typescript;
            } else {
                return Language.Javascript;
            }
        } else if (
            fs.existsSync(path.join(this.ccpath, 'build.gradle')) ||
            fs.existsSync(path.join(this.ccpath, 'build.gradle.kts')) ||
            fs.existsSync(path.join(this.ccpath, 'pom.xml'))
        ) {
            return Language.Java;
        } else {
            return Language.unknown;
        }
    }
}
