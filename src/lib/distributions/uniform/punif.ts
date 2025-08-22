

import createNS from '@common/debug-frontend';
const printer = createNS('punif');

import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_D_val, R_DT_0, R_DT_1 } from '@lib/r-func';

export function punif(q: number, min = 0, max = 1, lowerTail = true, logP = false): number {
    if (isNaN(q) || isNaN(min) || isNaN(max)) {
        return q + min + max;
    }

    if (max < min) {
        return ML_ERR_return_NAN2(printer);
    }

    if (!isFinite(min) || !isFinite(max)) {
        return ML_ERR_return_NAN2(printer);
    }

    if (q >= max) {
        return R_DT_1(lowerTail, logP);
    }

    if (q <= min) {
        return R_DT_0(lowerTail, logP);
    }

    const dnom = 1 / (max - min);

    if (lowerTail) {
        return R_D_val(logP, q * dnom - min * dnom);
    }

    return R_D_val(logP, max * dnom - q * dnom);
}
