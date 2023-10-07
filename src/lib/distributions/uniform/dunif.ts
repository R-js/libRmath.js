'use strict';

import createNS from '@mangos/debug-frontend';
import { mapErrV2, ME } from '@common/logger';
import { log as logfn, R_D__0 } from '@lib/r-func';

const debug = createNS('dunif');

export function dunif(x: number, min = 0, max = 1, log = false): number {
    if (isNaN(x) || isNaN(min) || isNaN(max)) {
        return x + min + max;
    }
    if (max <= min) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    if (min <= x && x <= max) {
        return log ? -logfn(max - min) : 1 / (max - min);
    }
    return R_D__0(log);
}
