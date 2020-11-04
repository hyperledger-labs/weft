/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

const JSON_EXT = /json/gi;
const YAML_EXT = /ya?ml/gi;

/**
 * Loads the profile at the given filename.
 *
 * File can either by yaml or json, error is thrown is the file does
 * not exist at the location given.
 *
 * @param profilename filename of the gateway connection profile
 * @return Gateway profile as an object
 */
export const getGatewayProfile = (profilename: string): any => {
    const ccpPath = path.resolve(profilename);
    if (!fs.existsSync(ccpPath)) {
        throw new Error(`Gateway ${ccpPath} does not exist`);
    }

    const type = path.extname(ccpPath);

    if (JSON_EXT.exec(type)) {
        return JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    } else if (YAML_EXT.exec(type)) {
        return yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'));
    } else {
        throw new Error(`Extension of ${ccpPath} not recognised`);
    }
};
