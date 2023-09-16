import createNS from '@mangos/debug-frontend';
import { ME, mapErrV2 } from '@common/logger';
import { rnormOne } from '@dist/normal/rnorm';
import { exp } from '@lib/r-func';

const debug = createNS('rlnorm');

export function rlnormOne(meanlog = 0, sdlog = 1): number {
    if (isNaN(meanlog) || !isFinite(sdlog) || sdlog < 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }
    return exp(rnormOne(meanlog, sdlog));
}
