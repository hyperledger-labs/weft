/*
 * SPDX-License-Identifier: Apache-2.0
 */

import chalk from 'chalk';

let asCli = false;

export const log = ({ msg = '>', val = '', error = false }: { msg?: string; val?: string; error?: boolean }): void => {
    if (asCli) {
        if (error) {
            console.log(chalk.bold.red(msg) + ' ' + val);
        } else {
            console.log(chalk.blue(msg) + ' ' + val);
        }
    }
};

export const enableCliLog = (): void => {
    asCli = true;
};

export const disableCliLog = (): void => {
    asCli = false;
};
