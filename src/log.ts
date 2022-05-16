/*
 * SPDX-License-Identifier: Apache-2.0
 */

import chalk from 'chalk';

let asCli = false;

export enum Type {
    INFO,
    NOTICE,
    WARN,
    ERROR,
}

export const log = ({ msg = '>', val = '', type = Type.INFO }: { msg?: string; val?: string; type?: Type }): void => {
    if (asCli) {
        switch (type) {
            case Type.ERROR:
                console.log(`${chalk.bold.red(msg)}  ${chalk.red(val)}`);
                break;
            case Type.WARN:
                console.log(`${chalk.bold.yellow(msg)}  ${chalk.green(val)}`);
                break;
            case Type.NOTICE:
                console.log(`${chalk.bold.green(msg)}  ${chalk.green(val)}`);
                break;
            default:
                console.log(`${chalk.bold.blue(msg)} ${chalk.blue(val)}`);
        }
    }
};

export const enableCliLog = (): void => {
    asCli = true;
};

export const disableCliLog = (): void => {
    asCli = false;
};
