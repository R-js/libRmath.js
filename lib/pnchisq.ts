/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 14, 2017
 * 
 *  Algorithm AS 275 Appl.Statist. (1992), vol.41, no.2
 *  original  (C) 1992	     Royal Statistical Society
 *
 *  Computes the noncentral chi-squared distribution function with
 *  positive real degrees of freedom df and nonnegative noncentrality
 *  parameter ncp.  pnchisq_raw is based on
 *
 *    Ding, C. G. (1992)
 *    Algorithm AS275: Computing the non-central chi-squared
 *    distribution function. Appl.Statist., 41, 478-482.

 *  Other parts
 *  Copyright (C) 2000-2015  The R Core Team
 *  Copyright (C) 2003-2015  The R Foundation
 */


/*----------- DEBUGGING -------------
 *
 *	make CFLAGS='-DDEBUG_pnch ....'
(cd `R-devel RHOME`/src/nmath; gcc -I. -I../../src/include -I../../../R/src/include -I/usr/local/include -DHAVE_CONFIG_H -fopenmp -g -O0 -pedantic -Wall --std=gnu99 -DDEBUG_pnch -DDEBUG_q -Wcast-align -Wclobbered  -c ../../../R/src/nmath/pnchisq.c -o pnchisq.o )

 * -- Feb.6, 2000 (R pre0.99); M.Maechler:  still have
 * bad precision & non-convergence in some cases (x ~= f, both LARGE)
 */


import {
    M_LN2,
    DBL_MIN_EXP,
    ISNAN,
    R_FINITE,
    ML_ERR_return_NAN,
    DBL_EPSILON,
    ME,
    ML_ERROR,
    REprintf,
    fmax2,
    fmin2,
    R_D__1,
    M_LN10,
    R_D_exp,
    R_DT_0,
    R_DT_1,
    log,
    ML_NEGINF,
    exp,
    fabs,
    sqrt,
    M_LN_SQRT_2PI,
    MATHLIB_WARNING2

} from './_general';

import { log1p, R_DT_val } from './log1p';

import { expm1, R_Log1_Exp } from './expm1';

import { lgammafn } from './lgamma_fn';

import { logspace_add } from './pgamma';

import { pchisq } from './pchisq';

export const _dbl_min_exp = M_LN2 * DBL_MIN_EXP;
/*= -708.3964 for IEEE double precision */

export function pnchisq(x: number, df: number, ncp: number, lower_tail: boolean, log_p: boolean): number {
    let ans;

    if (ISNAN(x) || ISNAN(df) || ISNAN(ncp))
        return x + df + ncp;
    if (!R_FINITE(df) || !R_FINITE(ncp)) {
        return ML_ERR_return_NAN();
    }


    if (df < 0. || ncp < 0.) {
        return ML_ERR_return_NAN();
    }

    ans = pnchisq_raw(x, df, ncp, 1e-12, 8 * DBL_EPSILON, 1000000, lower_tail, log_p);
    if (ncp >= 80) {
        if (lower_tail) {
            ans = fmin2(ans, R_D__1(log_p));  /* e.g., pchisq(555, 1.01, ncp = 80) */
        } else { /* !lower_tail */
            /* since we computed the other tail cancellation is likely */
            if (ans < (log_p ? (-10. * M_LN10) : 1e-10)) ML_ERROR(ME.ME_PRECISION, 'pnchisq');
            if (!log_p) ans = fmax2(ans, 0.0);  /* Precaution PR#7099 */
        }
    }
    if (!log_p || ans < -1e-8)
        return ans;
    else { // log_p  &&  ans > -1e-8
        // prob. = exp(ans) is near one: we can do better using the other tail
        REprintf("   pnchisq_raw(*, log_p): ans=%g => 2nd call, other tail\n", ans);

        // FIXME: (sum,sum2) will be the same (=> return them as well and reuse here ?)
        ans = pnchisq_raw(x, df, ncp, 1e-12, 8 * DBL_EPSILON, 1000000, !lower_tail, false);
        return log1p(-ans);
    }
}

export function pnchisq_raw(
    x: number,
    f: number,
    theta: number /* = ncp */,
    errmax: number,
    reltol: number,
    itrmax: number,
    lower_tail: boolean,
    log_p: boolean): number {

    let lam, x2, f2, term, bound, f_x_2n, f_2n;
    let l_lam = -1., l_x = -1.; /* initialized for -Wall */
    let n;
    let lamSml: boolean;
    let tSml: boolean;
    let is_r: boolean;
    let is_b: boolean;
    let is_it: boolean;

    let ans: number;
    let u: number;
    let v: number;
    let t: number;
    let lt: number;
    let lu = -1;

    if (x <= 0.) {
        if (x == 0. && f == 0.) {

            return lower_tail ? R_D_exp(log_p, (-0.5 * theta)) : (log_p ? R_Log1_Exp((-0.5 * theta)) : -expm1((-0.5 * theta)));
        }
        /* x < 0  or {x==0, f > 0} */
        return R_DT_0(lower_tail, log_p);
    }
    if (!R_FINITE(x)) return R_DT_1(lower_tail, log_p);

    /* This is principally for use from qnchisq */

    if (theta < 80) { /* use 110 for Inf, as ppois(110, 80/2, lower.tail=FALSE) is 2e-20 */
        let ans;
        let i;
        // Have  pgamma(x,s) < x^s / Gamma(s+1) (< and ~= for small x)
        // ==> pchisq(x, f) = pgamma(x, f/2, 2) = pgamma(x/2, f/2)
        //                  <  (x/2)^(f/2) / Gamma(f/2+1) < eps
        // <==>  f/2 * log(x/2) - log(Gamma(f/2+1)) < log(eps) ( ~= -708.3964 )
        // <==>        log(x/2) < 2/f*(log(Gamma(f/2+1)) + log(eps))
        // <==> log(x) < log(2) + 2/f*(log(Gamma(f/2+1)) + log(eps))
        if (lower_tail && f > 0. &&
            log(x) < M_LN2 + 2 / f * (lgammafn(f / 2. + 1) + _dbl_min_exp)) {
            // all  pchisq(x, f+2*i, lower_tail, FALSE), i=0,...,110 would underflow to 0.
            // ==> work in log scale
            let lambda = 0.5 * theta;
            let sum, sum2, pr = -lambda;
            sum = sum2 = ML_NEGINF;
            /* we need to renormalize here: the result could be very close to 1 */
            for (i = 0; i < 110; pr += log(lambda) - log(++i)) {
                sum2 = logspace_add(sum2, pr);
                sum = logspace_add(sum, pr + pchisq(x, f + 2 * i, lower_tail, true));
                if (sum2 >= -1e-15) /*<=> EXP(sum2) >= 1-1e-15 */ break;
            }
            ans = sum - sum2;
            REprintf("pnchisq(x=%g, f=%g, th.=%g); th. < 80, logspace: i=%d, ans=(sum=%g)-(sum2=%g)\n",
                x, f, theta, i, sum, sum2);

            return (log_p ? ans : exp(ans));
        }
        else {
            let lambda = 0.5 * theta;
            let sum = 0, sum2 = 0, pr = exp(-lambda); // does this need a feature test?
            /* we need to renormalize here: the result could be very close to 1 */
            for (i = 0; i < 110; pr *= lambda / ++i) {
                // pr == exp(-lambda) lambda^i / i!  ==  dpois(i, lambda)
                sum2 += pr;
                // pchisq(*, i, *) is  strictly decreasing to 0 for lower_tail=TRUE
                //                 and strictly increasing to 1 for lower_tail=FALSE
                sum += pr * pchisq(x, f + 2 * i, lower_tail, true);
                if (sum2 >= 1 - 1e-15) break;
            }
            ans = sum / sum2;

            REprintf('pnchisq(x=%g, f=%g, theta=%g); theta < 80: i=%d, sum=%g, sum2=%g\n',
                x, f, theta, i, sum, sum2);

            return (log_p ? log(ans) : ans);
        }
    } // if(theta < 80)

    // else: theta == ncp >= 80 --------------------------------------------

    REprintf('pnchisq(x=%g, f=%g, theta=%g >= 80): ', x, f, theta);

    // Series expansion ------- FIXME: log_p=TRUE, lower_tail=FALSE only applied at end

    lam = .5 * theta;
    lamSml = (-lam < _dbl_min_exp);
    if (lamSml) {
        /* MATHLIB_ERROR(
           "non centrality parameter (= %g) too large for current algorithm",
           theta) */
        u = 0;
        lu = -lam;/* == ln(u) */
        l_lam = log(lam);
    } else {
        u = exp(-lam);
    }

    /* evaluate the first term */
    v = u;
    x2 = .5 * x;
    f2 = .5 * f;
    f_x_2n = f - x;


    REprintf('-- v=exp(-th/2)=%g, x/2= %g, f/2= %g\n', v, x2, f2);


    if (f2 * DBL_EPSILON > 0.125 && /* very large f and x ~= f: probably needs */
        fabs(t = x2 - f2) <         /* another algorithm anyway */
        sqrt(DBL_EPSILON) * f2) {
        /* evade cancellation error */
        /* t = exp((1 - t)*(2 - t/(f2 + 1))) / sqrt(2*M_PI*(f2 + 1));*/
        lt = (1 - t) * (2 - t / (f2 + 1)) - M_LN_SQRT_2PI - 0.5 * log(f2 + 1);

        REprintf(' (case I) ==> ');

    }
    else {
        /* Usual case 2: careful not to overflow .. : */
        lt = f2 * log(x2) - x2 - lgammafn(f2 + 1);
    }

    REprintf(' lt= %g', lt);


    tSml = (lt < _dbl_min_exp);
    if (tSml) {

        REprintf(' is very small\n');

        if (x > f + theta + 5 * sqrt(2 * (f + 2 * theta))) {
            /* x > E[X] + 5* sigma(X) */
            return R_DT_1(lower_tail, log_p); /* FIXME: could be more accurate than 0. */
        } /* else */
        l_x = log(x);
        ans = term = 0.; t = 0;
    }
    else {
        t = exp(lt);
        REprintf(', t=exp(lt)= %g\n', t);
        ans = term = (v * t);
    }

    for (n = 1, f_2n = f + 2., f_x_2n += 2.; ; n++ , f_2n += 2, f_x_2n += 2) {
        REprintf('\n _OL_: n=%d', n);
        /* f_2n    === f + 2*n
         * f_x_2n  === f - x + 2*n   > 0  <==> (f+2n)  >   x */
        if (f_x_2n > 0) {
            /* find the error bound and check for convergence */

            bound = (t * x / f_x_2n);

            REprintf('\n L10: n=%d; term= %g; bound= %g', n, term, bound);

            is_r = is_it = false;
            /* convergence only if BOTH absolute and relative error < 'bnd' */
            if (((is_b = (bound <= errmax)) &&
                (is_r = (term <= reltol * ans))) || (is_it = (n > itrmax))) {

                REprintf('BREAK n=%d %s; bound= %g %s, rel.err= %g %s\n',
                    n, (is_it ? '> itrmax' : ''),
                    bound, (is_b ? '<= errmax' : ''),
                    term / ans, (is_r ? '<= reltol' : ''));

                break; /* out completely */
            }

        }

        /* evaluate the next term of the */
        /* expansion and then the partial sum */

        if (lamSml) {
            lu += l_lam - log(n); /* u = u* lam / n */
            if (lu >= _dbl_min_exp) {
                /* no underflow anymore ==> change regime */

                REprintf(' n=%d; nomore underflow in u = exp(lu) ==> change\n',
                    n);

                v = u = exp(lu); /* the first non-0 'u' */
                lamSml = false;
            }
        } else {
            u *= lam / n;
            v += u;
        }
        if (tSml) {
            lt += l_x - log(f_2n);/* t <- t * (x / f2n) */
            if (lt >= _dbl_min_exp) {
                /* no underflow anymore ==> change regime */

                REprintf('  n=%d; nomore underflow in t = exp(lt) ==> change\n', n);

                t = exp(lt); /* the first non-0 't' */
                tSml = false;
            }
        } else {
            t *= x / f_2n;
        }
        if (!lamSml && !tSml) {
            term = (v * t);
            ans += term;
        }

    } /* for(n ...) */

    if (is_it) {
        MATHLIB_WARNING2('pnchisq(x=%g, ..): not converged in %d iter.',
            x, itrmax);
    }

    REprintf('\n == L_End: n=%d; term= %g; bound=%g\n', n, term, bound);

    let dans = ans;
    return R_DT_val(lower_tail, log_p, dans);
}
