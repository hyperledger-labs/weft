/*
 * SPDX-License-Identifier: Apache-2.0
 */
import Identities from './identies';
import { MicrofabProcessor } from './microfab';
import { getGatewayProfile } from './gateways';

const Infrastructure = {
    MicrofabProcessor,
};

export { EnvVars } from './microfab';

const Utility = {
    getGatewayProfile,
};

export { Identities, Infrastructure, Utility };
