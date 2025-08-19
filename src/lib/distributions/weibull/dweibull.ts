

import createNS from '@common/debug-frontend';

import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_D__0, pow, log as _log, exp } from '@lib/r-func';
const printer = createNS('dweibull');

export function dweibull(x: number, shape: number, scale = 1, log = false): number {
    if (isNaN(x) || isNaN(shape) || isNaN(scale)) {
        return x + shape + scale;
    }
    if (shape <= 0 || scale <= 0) {
        return ML_ERR_return_NAN2(printer);
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
