import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { R_P_bounds_Inf_01 } from '@lib/r-func';

export function Rf_log1pexp(x: number): number {
    if (x <= 18) return Math.log1p(Math.exp(x));
    if (x > 33.3) return x;
    // else: 18.0 < x <= 33.3 :
    return x + Math.exp(-x);
}

const printer_plogis = debug('plogis');

export function plogis(x: number, location = 0, scale = 1, lowerTail = true, logP = false): number {
    if (isNaN(x) || isNaN(location) || isNaN(scale)) return NaN;

    if (scale <= 0.0) {
        return ML_ERR_return_NAN2(printer_plogis, lineInfo4);
    }

    x = (x - location) / scale;
    const rc = R_P_bounds_Inf_01(lowerTail, logP, x);
    if (rc !== undefined) {
        return rc;
    }

    if (logP) {
        // log(1 / (1 + exp( +- x ))) = -log(1 + exp( +- x))
        return -Rf_log1pexp(lowerTail ? -x : x);
    }
    return 1 / (1 + Math.exp(lowerTail ? -x : x));
}
