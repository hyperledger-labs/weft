/*
# Copyright Hyperledger Fabric Contributors. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

import { spawn } from 'child_process';

// A general purpose structure that can be used for any command.
// This defines the important 'spawn' command. This executes the command
// with the arguments that have been specified.
// It is set to inherit the environment variables, uses the default sell, and inherits the
// stdio/stderr streams. (Inheriting means that the formating colour, etc is maintained)
//
// spawn() MUST be the last item chained sequence
//
// It also blanks the arguments supplied, so the instance of the cmd can be reused
// It returns a promise that is resolved when the exit code is 0, and rejected for any other code

class Cmd {
    cmd = '';
    args: string[] = [];
    stdoutstr: string[] = [];

    public constructor(c: string) {
        this.cmd = c;
    }

    // can override the cwd
    public spawn(cwd = process.cwd()) {
        const promise = new Promise((resolve, reject) => {
            const _name = this.toString();
            // eslint-disable-next-line no-console
            console.log(`spawning:: ${_name} in ${cwd}`);
            const call = spawn(this.cmd, this.args, {
                env: process.env,
                shell: true,
                stdio: ['inherit', 'pipe', 'inherit'],
                cwd,
            });
            this.args = [];
            this.stdoutstr = [];
            call.on('exit', (code) => {
                // eslint-disable-next-line no-console
                console.log(`spawning:: ${_name} code::${code}`);
                if (code === 0) {
                    resolve(0);
                } else {
                    reject(code);
                }
            });
            call.stdout.on('data', (data) => {
                const s = data.toString('utf8');
                console.log(s.slice(0, s.length - 1));
                this.stdoutstr.push(s);
            });
            return call;
        });

        return promise;
    }

    public toString(): string {
        return `${this.cmd} ${this.args.join(' ')}`;
    }
}

export const shellcmds = async (cmds: string[]): Promise<string[]> => {
    const retvals = [];
    for (const c of cmds) {
        const cmd = new Cmd(c);
        await cmd.spawn();
        retvals.push(cmd.stdoutstr.join(' '));
    }
    return retvals;
};
