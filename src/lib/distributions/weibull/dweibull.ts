'use strict';

import createNS from '@mangos/debug-frontend';

import { mapErrV2, ME } from '@common/logger';
import { R_D__0, pow, log as _log, exp } from '@lib/r-func';
const debug = createNS('dweibull');

export function dweibull(x: number, shape: number, scale = 1, log = false): number {
    if (isNaN(x) || isNaN(shape) || isNaN(scale)) {
        return x + shape + scale;
    }
    if (shape <= 0 || scale <= 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    if (x < 0) {
        return R_D__0(log);
    }
    if (!isFinite(x)) {
        return R_D__0(log);
    }
    /* need to handle x == 0 separately */
    if (x === 0 && shape < 1) {
        return Infinity;
    }
    const tmp1 = pow(x / scale, shape - 1);
    const tmp2 = tmp1 * (x / scale);
    /* These are incorrect if tmp1 == 0 */
    return log ? -tmp2 + _log((shape * tmp1) / scale) : (shape * tmp1 * exp(-tmp2)) / scale;
}
