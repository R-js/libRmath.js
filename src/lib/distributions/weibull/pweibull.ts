

import createNS from '@common/debug-frontend';

import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_D_exp, R_DT_0, pow, expm1 } from '@lib/r-func';
import { R_Log1_Exp } from '@dist/exp/expm1';

const printer = createNS('pweibull');

export function pweibull(q: number, shape: number, scale = 1, lowerTail = true, logP = false): number {
    if (isNaN(q) || isNaN(shape) || isNaN(scale)) {
        return q + shape + scale;
    }

    if (shape <= 0 || scale <= 0) {
        printer(DomainError);
        return NaN;
    }

    if (q <= 0) {
        return R_DT_0(lowerTail, logP);
    }
    q = -pow(q / scale, shape);
    return lowerTail ? (logP ? R_Log1_Exp(q) : -expm1(q)) : R_D_exp(logP, q);
}
