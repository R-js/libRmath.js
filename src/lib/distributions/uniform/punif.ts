

import { debug } from '@mangos/debug';
const printer = debug('punif');

import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { R_D_val, R_DT_0, R_DT_1 } from '@lib/r-func';

export function punif(q: number, min = 0, max = 1, lowerTail = true, logP = false): number {
    if (isNaN(q) || isNaN(min) || isNaN(max)) {
        return q + min + max;
    }

    if (max < min) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    if (!isFinite(min) || !isFinite(max)) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
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
