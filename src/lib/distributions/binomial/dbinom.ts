import { debug } from '@mangos/debug';

import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';

import { M_LN_2PI, R_D__0, R_D__1, R_D_exp, R_D_negInonint, R_D_nonint_check } from '@lib/r-func';

import { bd0 } from '@lib/deviance';
import { stirlerr } from '@lib/stirling';

const printer = debug('dbinom');

function dbinom_raw(x: number, n: number, p: number, q: number, give_log: boolean): number {
    let lc: number;

    if (p === 0) return x === 0 ? R_D__1(give_log) : R_D__0(give_log);
    if (q === 0) return x === n ? R_D__1(give_log) : R_D__0(give_log);

    if (x === 0) {
        if (n === 0) return R_D__1(give_log);
        const lc = p < 0.1 ? -bd0(n, n * q) - n * p : n * Math.log(q);
        return R_D_exp(give_log, lc);
    }

    if (x === n) {
        lc = q < 0.1 ? -bd0(n, n * p) - n * q : n * Math.log(p);
        return R_D_exp(give_log, lc);
    }

    if (x < 0 || x > n) return R_D__0(give_log);

    /* n*p or n*q can underflow to zero if n and p or q are small.  This
       used to occur in dbeta, and gives NaN as from R 2.3.0.  */
    lc = stirlerr(n) - stirlerr(x) - stirlerr(n - x) - bd0(x, n * p) - bd0(n - x, n * q);

    /* f = (M_2PI*x*(n-x))/n; could overflow or underflow */
    /* Upto R 2.7.1:
     * lf = Math.log(M_2PI) + Math.log(x) + Math.log(n-x) - Math.log(n);
     * -- following is much better for  x << n : */
    const lf = M_LN_2PI + Math.log(x) + Math.log1p(-x / n);

    return R_D_exp(give_log, lc - 0.5 * lf);
}

function dbinom(x: number, n: number, prob: number, log = false): number {
    /* NaNs propagated correctly */
    if (isNaN(x) || isNaN(n) || isNaN(prob)) return x + n + prob;

    if (prob < 0 || prob > 1 || R_D_negInonint(n)) return ML_ERR_return_NAN2(printer, lineInfo4);

    const ch = R_D_nonint_check(log, x, printer);
    if (ch !== undefined) {
        return ch;
    }
    if (x < 0 || !isFinite(x)) return R_D__0(log);

    n = Math.round(n);
    x = Math.round(x);

    return dbinom_raw(x, n, prob, 1 - prob, log);
}

export { dbinom_raw, dbinom };
