import Identities from './identies';
import { MicrofabProcessor } from './microfab';
declare const Infrastructure: {
    MicrofabProcessor: typeof MicrofabProcessor;
};
export { EnvVars } from './microfab';
declare const Utility: {
    getGatewayProfile: (profilename: string) => any;
};
export { Identities, Infrastructure, Utility };
