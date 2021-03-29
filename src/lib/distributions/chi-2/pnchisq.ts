/* This is a conversion from LIB-R-MATH to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { debug } from 'debug';
import { ML_ERR_return_NAN, ML_ERROR, ME } from '@common/logger'
import {
    M_LN_SQRT_2PI,
    R_D__1,
    R_D_exp,
    R_DT_0,
    R_DT_1,
    R_DT_val,
} from '$constants';

import { R_Log1_Exp } from '@dist/exp/expm1';
import { lgammafn_sign as lgammafn } from '@special/gamma/lgammafn_sign';
import { logspace_add } from '@dist/gamma/logspace-add';
import { pchisq } from './pchisq';

export const DBL_MAX_EXP = Math.log2(Number.MAX_VALUE);
export const DBL_MIN_EXP = Math.log2(Number.MIN_VALUE);

const _dbl_min_exp = Math.LN2 * DBL_MIN_EXP;
/*= -708.3964 for IEEE double precision */

const printer = debug('pnchisq');

export function pnchisq(x: number, df: number, ncp: number, lower_tail: boolean, log_p: boolean): number {
    let ans;

    if (isNaN(x) || isNaN(df) || isNaN(ncp)) {
        return NaN;
    }
    if (!isFinite(df) || !isFinite(ncp)) {
        return ML_ERR_return_NAN(printer);
    }

    if (df < 0 || ncp < 0) {
        return ML_ERR_return_NAN(printer);
    }

    ans = pnchisq_raw(x, df, ncp, 1e-12, 8 * Number.EPSILON, 1000000, lower_tail, log_p);
    if (ncp >= 80) {
        if (lower_tail) {
            ans = Math.min(ans, R_D__1(log_p)); /* e.g., pchisq(555, 1.01, ncp = 80) */
        } else {
            /* !lower_tail */
            /* since we computed the other tail cancellation is likely */
            if (ans < (log_p ? -10 * Math.LN10 : 1e-10)) ML_ERROR(ME.ME_PRECISION, 'pnchisq', printer);
            if (!log_p) ans = Math.max(ans, 0.0); /* Precaution PR#7099 */
        }
    }
    if (!log_p || ans < -1e-8) {
        return ans;
    }

    // log_p  &&  ans > -1e-8
    // prob. = Math.exp(ans) is near one: we can do better using the other tail
    printer('   pnchisq_raw(*, log_p): ans=%d => 2nd call, other tail', ans);

    // FIXME: (sum,sum2) will be the same (=> return them as well and reuse here ?)
    ans = pnchisq_raw(x, df, ncp, 1e-12, 8 * Number.EPSILON, 1000000, !lower_tail, false);
    return Math.log1p(-ans);
}

export function pnchisq_raw(
    x: number,
    f: number,
    theta: number /* = ncp */,
    errmax: number,
    reltol: number,
    itrmax: number,
    lower_tail: boolean,
    log_p: boolean,
): number {
    //double
    let term;
    let bound;
    let f_x_2n;
    let f_2n;
    let l_lam = -1;
    let l_x = -1; /* initialized for -Wall */
    //Rboolean
    let lamSml: boolean;
    let tSml: boolean;
    let is_r: boolean;
    let is_b: boolean;
    let is_it: boolean;

    //LDOUBLE
    let ans: number;
    let u: number;
    let v: number;
    let t: number;
    let lt: number;
    let lu = -1;

    if (x <= 0) {
        if (x === 0 && f === 0) {
            const _L = -0.5 * theta;
            const result = lower_tail ? R_D_exp(log_p, _L) : log_p ? R_Log1_Exp(_L) : -Math.expm1(_L);
            printer('result1:%d', result);
            return result;
        }
        /* x < 0  or {x==0, f > 0} */
        return R_DT_0(lower_tail, log_p);
    }
    if (!isFinite(x)) return R_DT_1(lower_tail, log_p);

    /* This is principally for use from qnchisq */

    if (theta < 80) {
        /* use 110 for Inf, as ppois(110, 80/2, lower.tail=FALSE) is 2e-20 */
        //double
        let ans;
        //int
        let i;
        // Have  pgamma(x,s) < x^s / Gamma(s+1) (< and ~= for small x)
        // === = > pchisq(x, f) = pgamma(x, f/2, 2) = pgamma(x/2, f/2)
        //                  <  (x/2)^(f/2) / Gamma(f/2+1) < eps
        // <==>  f/2 * log(x/2) - log(Gamma(f/2+1)) < log(eps) ( ~= -708.3964 )
        // <==>        log(x/2) < 2/f*(log(Gamma(f/2+1)) + log(eps))
        // <==> log(x) < log(2) + 2/f*(log(Gamma(f/2+1)) + log(eps))
        if (lower_tail && f > 0 && Math.log(x) < Math.LN2 + (2 / f) * (lgammafn(f / 2 + 1) + _dbl_min_exp)) {
            // all  pchisq(x, f+2*i, lower_tail, FALSE), i=0,...,110 would underflow to 0.
            // === = > work in log scale
            const lambda = 0.5 * theta;
            let sum = -Infinity;
            let sum2 = -Infinity;
            let pr = -lambda;
            /* we need to renormalize here: the result could be very close to 1 */
            for (i = 0; i < 110; pr += Math.log(lambda) - Math.log(++i)) {
                sum2 = logspace_add(sum2, pr);
                sum = logspace_add(sum, pr + pchisq(x, f + 2 * i, lower_tail, true));
                if (sum2 >= -1e-15) {
                    /*<=> EXP(sum2) >= 1-1e-15 */
                    break;
                }
            }
            ans = sum - sum2;
            printer(
                'pnchisq(x=%d, f=%d, th.=%d); th. < 80, logspace: i=%d, ans=(sum=%d)-(sum2=%d)',
                x,
                f,
                theta,
                i,
                sum,
                sum2,
            );

            return log_p ? ans : Math.exp(ans);
        } else {
            const lambda = 0.5 * theta;
            let sum = 0;
            let sum2 = 0;
            let pr = Math.exp(-lambda); // does this need a feature test?
            /* we need to renormalize here: the result could be very close to 1 */
            for (i = 0; i < 110; pr *= lambda / ++i) {
                // pr === =  exp(-lambda) lambda^i / i!  ===   dpois(i, lambda)
                sum2 += pr;
                // pchisq(*, i, *) is  strictly decreasing to 0 for lower_tail=TRUE
                //                 and strictly increasing to 1 for lower_tail=FALSE
                sum += pr * pchisq(x, f + 2 * i, lower_tail, false);
                if (sum2 >= 1 - 1e-15) break;
            }
            ans = sum / sum2;

            printer('pnchisq(x=%d, f=%d, theta=%d); theta < 80: i=%d, sum=%d, sum2=%d', x, f, theta, i, sum, sum2);

            return log_p ? Math.log(ans) : ans;
        }
    } // if(theta < 80)

    // else: theta ===  ncp >= 80 --------------------------------------------

    printer('pnchisq(x=%d, f=%d, theta=%d >= 80): ', x, f, theta);

    // Series expansion ------- FIXME: log_p=TRUE, lower_tail=FALSE only applied at end

    const lam = 0.5 * theta;
    lamSml = -lam < _dbl_min_exp;
    if (lamSml) {
        /* MATHLIB_ERROR(
           "non centrality parameter (= %g) too large for current algorithm",
           theta) */
        u = 0;
        lu = -lam; /* ===  ln(u) */
        l_lam = Math.log(lam);
    } else {
        u = Math.exp(-lam);
    }

    /* evaluate the first term */
    v = u;
    const x2 = 0.5 * x;
    const f2 = 0.5 * f;
    f_x_2n = f - x;

    printer('-- v=exp(-th/2)=%d, x/2= %d, f/2= %d', v, x2, f2);

    if (
        f2 * Number.EPSILON > 0.125 /* very large f and x ~= f: probably needs */ &&
        Math.abs((t = x2 - f2)) /* another algorithm anyway */ < Math.sqrt(Number.EPSILON) * f2
    ) {
        /* evade cancellation error */
        /* t = Math.exp((1 - t)*(2 - t/(f2 + 1))) / Math.sqrt(2*M_PI*(f2 + 1));*/
        lt = (1 - t) * (2 - t / (f2 + 1)) - M_LN_SQRT_2PI - 0.5 * Math.log(f2 + 1);

        printer(' (case I) === > ');
    } else {
        /* Usual case 2: careful not to overflow .. : */
        lt = f2 * Math.log(x2) - x2 - lgammafn(f2 + 1);
    }

    printer(' lt= %d', lt);

    tSml = lt < _dbl_min_exp;
    if (tSml) {
        printer(' is very small');

        if (x > f + theta + 5 * Math.sqrt(2 * (f + 2 * theta))) {
            /* x > E[X] + 5* sigma(X) */
            return R_DT_1(lower_tail, log_p); /* FIXME: could be more accurate than 0. */
        } /* else */
        l_x = Math.log(x);
        ans = term = 0;
        t = 0;
    } else {
        t = Math.exp(lt);
        printer(', t=Math.exp(lt)= %d', t);
        term = v * t;
        ans = term;
    }

    let n; //cant put it inside the for below((
    for (n = 1, f_2n = f + 2, f_x_2n += 2; ; n++, f_2n += 2, f_x_2n += 2) {
        printer(' _OL_: n=%d', n);
        /* f_2n    === = f + 2*n
         * f_x_2n  === = f - x + 2*n   > 0  <==> (f+2n)  >   x */
        if (f_x_2n > 0) {
            /* find the error bound and check for convergence */

            bound = (t * x) / f_x_2n;

            printer(' L10: n=%d; term= %d; bound= %d', n, term, bound);

            is_r = is_it = false;
            /* convergence only if BOTH absolute and relative error < 'bnd' */
            if (((is_b = bound <= errmax) && (is_r = term <= reltol * ans)) || (is_it = n > itrmax)) {
                printer(
                    'BREAK n=%d %s; bound= %d %s, rel.err= %d %s',
                    n,
                    is_it ? '> itrmax' : '',
                    bound,
                    is_b ? '<= errmax' : '',
                    term / ans,
                    is_r ? '<= reltol' : '',
                );
                break; /* out completely */
            }
        }

        /* evaluate the next term of the */
        /* expansion and then the partial sum */

        if (lamSml) {
            lu += l_lam - Math.log(n); /* u = u* lam / n */
            if (lu >= _dbl_min_exp) {
                /* no underflow anymore === > change regime */

                printer(' n=%d; nomore underflow in u = Math.exp(lu) === > change', n);

                v = u = Math.exp(lu); /* the first non-0 'u' */
                lamSml = false;
            }
        } else {
            u *= lam / n;
            v += u;
        }
        if (tSml) {
            lt += l_x - Math.log(f_2n); /* t <- t * (x / f2n) */
            if (lt >= _dbl_min_exp) {
                /* no underflow anymore === > change regime */

                printer('  n=%d; nomore underflow in t = Math.exp(lt) === > change', n);

                t = Math.exp(lt); /* the first non-0 't' */
                tSml = false;
            }
        } else {
            t *= x / f_2n;
        }
        if (!lamSml && !tSml) {
            term = v * t;
            ans += term;
        }
    } /* for(n ...) */

    if (is_it) {
        printer('pnchisq(x=%d, ..): not converged in %d iter.', x, itrmax);
    }

    printer(' ===  L_End: n=%d; term= %d; bound=%d', n, term, bound);

    return R_DT_val(lower_tail, log_p, ans);
}
