import createNS from '@mangos/debug-frontend';

import { ME, mapErrV2, R_Q_P01_boundaries } from '@common/logger';

import { log } from '@lib/r-func';

import { R_Log1_Exp } from '@dist/exp/expm1';

const debug = createNS('qlogis');

export function qlogis(p: number, location = 0, scale = 1, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(location) || isNaN(scale)) {
        return NaN;
    }

    const rc = R_Q_P01_boundaries(lowerTail, logP, p, -Infinity, Infinity);
    if (rc !== undefined) {
        return rc;
    }

    if (scale < 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }
    if (scale === 0) return location;

    /* p := logit(p) = log( p / (1-p) )	 : */
    if (logP) {
        if (lowerTail) p = p - R_Log1_Exp(p);
        else p = R_Log1_Exp(p) - p;
    } else p = log(lowerTail ? p / (1 - p) : (1 - p) / p);

    return location + scale * p;
}
