'use strict';

import createNS from '@mangos/debug-frontend';
import { mapErrV2, ME } from '@common/logger';
import { globalUni } from '@rng/global-rng';

const debug = createNS('runif');

export function runifOne(min: number, max: number): number {
    const u = globalUni();

    if (!(isFinite(min) && isFinite(max) && max > min)) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }
    const s = u.random();
    return (max - min) * s + min;
}
