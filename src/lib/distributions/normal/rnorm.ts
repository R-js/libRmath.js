'use strict';

import createNS from '@mangos/debug-frontend';

import { ME, mapErrV2 } from '@common/logger';
import { globalNorm } from '@rng/global-rng';

const debug = createNS('rnorm');

export function rnormOne(mean = 0, sd = 1): number {
    const rng = globalNorm();
    if (isNaN(mean) || !isFinite(sd) || sd < 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }
    if (sd === 0 || !isFinite(mean)) {
        return mean; /* includes mean = +/- Inf with finite sd */
    }
    return mean + sd * rng.random();
}
