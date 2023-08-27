import createNS from '@mangos/debug-frontend';

import { ME, mapErrV2 } from '@common/logger';
import { R_D__0 } from '@lib/r-func';

const debug = createNS('dexp');

export function dexp(x: number, scale: number, give_log: boolean): number {
    /* NaNs propagated correctly */
    if (Number.isNaN(x) || Number.isNaN(scale)) {
        return NaN;
    }

    if (scale <= 0.0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    if (x < 0) {
        return R_D__0(give_log);
    }
    return give_log ? -x / scale - Math.log(scale) : Math.exp(-x / scale) / scale;
}
