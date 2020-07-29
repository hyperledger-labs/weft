/*
 * SPDX-License-Identifier: Apache-2.0
 */

import chalk from 'chalk';

export const log = ({ msg = '>', val = '', error = false }: { msg?: string; val?: string; error?: boolean }): void => {
    if (error) {
        console.log(chalk.red(msg) + ' ' + val);
    } else {
        console.log(chalk.white(msg) + ' ' + val);
    }
};
