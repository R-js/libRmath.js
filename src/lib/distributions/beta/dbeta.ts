import createNs from '@mangos/debug-frontend';

import { ME, mapErrV2 } from '@common/logger';

import { R_D__0, R_D_exp, R_D_val, log, log1p } from '@lib/r-func';

import { dbinom_raw } from '@dist/binomial/dbinom';

import { lbeta } from '@special/beta';

const debug = createNs('dbeta');

export function dbeta_scalar(x: number, a: number, b: number, asLog: boolean): number {
    if (isNaN(x) || isNaN(a) || isNaN(b)) return x + a + b;

    if (a < 0 || b < 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }
    if (x < 0 || x > 1) return asLog ? 0 : 1.0;

    // limit cases for (a,b), leading to point masses

    if (a === 0 || b === 0 || !isFinite(a) || !isFinite(b)) {
        if (a === 0 && b === 0) {
            // point mass 1/2 at each of {0,1} :
            if (x === 0 || x === 1) return Infinity;
            else return R_D__0(asLog);
        }
        if (a === 0 || a / b === 0) {
            // point mass 1 at 0
            if (x === 0) return Infinity;
            else return R_D__0(asLog);
        }
        if (b === 0 || b / a === 0) {
            // point mass 1 at 1
            if (x === 1) return Infinity;
            else return R_D__0(asLog);
        }
        // else, remaining case:  a = b = Inf : point mass 1 at 1/2
        if (x === 0.5) return Infinity;
        else return R_D__0(asLog);
    }

    if (x === 0) {
        if (a > 1) return R_D__0(asLog);
        if (a < 1) return Infinity;
        /* a == 1 : */ return R_D_val(asLog, b);
    }
    if (x === 1) {
        if (b > 1) return R_D__0(asLog);
        if (b < 1) return Infinity;
        /* b == 1 : */ return R_D_val(asLog, a);
    }

    let lval: number;
    if (a <= 2 || b <= 2) lval = (a - 1) * log(x) + (b - 1) * log1p(-x) - lbeta(a, b);
    else {
        lval = log(a + b - 1) + dbinom_raw(a - 1, a + b - 2, x, 1 - x, true);
    }
    return R_D_exp(asLog, lval);
}
