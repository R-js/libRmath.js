'use strict';

import { ME, mapErrV2 } from '@common/logger';
import { R_DT_0, R_DT_1, isFinite, floor } from '@lib/r-func';

import createNS from '@mangos/debug-frontend';
import { pgamma } from '@dist/gamma/pgamma';

const debug = createNS('ppois');

export function ppois(q: number, lambda: number, lowerTail = true, logP = false): number {
    if (isNaN(q) || isNaN(lambda)) return q + lambda;

    if (lambda < 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }
    if (q < 0) {
        return R_DT_0(lowerTail, logP);
    }
    if (lambda === 0) {
        return R_DT_1(lowerTail, logP);
    }
    if (!isFinite(q)) {
        return R_DT_1(lowerTail, logP);
    }
    q = floor(q + 1e-7);

    return pgamma(lambda, q + 1, 1, !lowerTail, logP);
}
