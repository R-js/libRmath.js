import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_D_exp, R_DT_0 } from '@lib/r-func';

import createNS from '@common/debug-frontend';
import { R_Log1_Exp } from './expm1';

const printer = createNS('pexp');

export function pexp(q: number, scale: number, lower_tail: boolean, log_p: boolean): number {
    if (isNaN(q) || isNaN(scale)) {
        return q + scale;
    }
    if (scale < 0) {
        printer(DomainError);
        return NaN;
    }

    if (q <= 0) {
        return R_DT_0(lower_tail, log_p);
    }
    /* same as weibull( shape = 1): */
    q = -(q / scale);
    return lower_tail ? (log_p ? R_Log1_Exp(q) : -Math.expm1(q)) : R_D_exp(log_p, q);
}
