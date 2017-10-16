/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 14, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998-2015 The R Core Team
 *  based on AS243 (C) 1989 Royal Statistical Society
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, a copy is available at
 *  https://www.R-project.org/Licenses/
 */

/*  Algorithm AS 243  Lenth,R.V. (1989). Appl. Statist., Vol.38, 185-189.
 *  ----------------
 *  Cumulative probability at t of the non-central t-distribution
 *  with df degrees of freedom (may be fractional) and non-centrality
 *  parameter delta.
 *
 *  NOTE
 *
 *    Requires the following auxiliary routines:
 *
 *	lgammafn(x)	- log gamma function
 *	pbeta(x, a, b)	- incomplete beta function
 *	pnorm(x)	- normal distribution function
 *
 *  CONSTANTS
 *
 *    M_SQRT_2dPI  = 1/ {gamma(1.5) * sqrt(2)} = sqrt(2 / pi)
 *    M_LN_SQRT_PI = ln(sqrt(pi)) = ln(pi)/2
 */


/*----------- DEBUGGING -------------
 *
 *	make CFLAGS='-DDEBUG_pnt -g'

 * -- Feb.3, 1999; M.Maechler:
    - For 't > ncp > 20' (or so)	the result is completely WRONG!  <== no longer true
    - but for ncp > 100
 */

import {
    ML_ERR_return_NAN,
    R_FINITE,
    R_DT_0,
    R_DT_1,
    DBL_MIN_EXP,
    M_LN2,
    sqrt,
    REprintf,
    exp,
    ML_ERROR,
    ME,
    M_SQRT_2dPI,
    pow,
    M_LN_SQRT_PI,
    log,
    DBL_EPSILON,
    fabs,
    fmin2

} from './_general';

import {
    pt
} from './pt';

import {
    pnorm5 as pnorm
} from './pnorm';

import {
    expm1
} from './expm1';

import {
    lgammafn
} from './lgamma_fn';

import {
    pbeta
} from './pbeta';

import {
    R_DT_val
} from './log1p';

export function pnt(t: number, df: number, ncp: number, lower_tail: boolean, log_p: boolean): number {
    let albeta: number;
    let a: number;
    let b: number;
    let del: number;
    let errbd: number;
    let lambda: number;
    let rxb: number;
    let tt: number;
    let x: number;
    let geven: number;
    let godd: number;
    let p: number;
    let q: number;
    let s: number;
    let tnc: number;
    let xeven: number;
    let xodd: number;
    let it: number;
    let negdel: boolean;

    /* note - itrmax and errmax may be changed to suit one's needs. */

    const itrmax = 1000;
    const errmax = 1.e-12;

    if (df <= 0.0) return ML_ERR_return_NAN();
    if (ncp === 0.0) return pt(t, df, lower_tail, log_p);

    if (!R_FINITE(t))
        return (t < 0) ? R_DT_0(lower_tail, log_p) : R_DT_1(lower_tail, log_p);
    if (t >= 0.) {
        negdel = false;
        tt = t;
        del = ncp;
    }
    else {
        /* We deal quickly with left tail if extreme,
           since pt(q, df, ncp) <= pt(0, df, ncp) = \Phi(-ncp) */
        if (ncp > 40 && (!log_p || !lower_tail)) return R_DT_0(lower_tail, log_p);
        negdel = true; tt = -t; del = -ncp;
    }

    if (df > 4e5 || del * del > 2 * M_LN2 * (-(DBL_MIN_EXP))) {
        /*-- 2nd part: if del > 37.62, then p=0 below
          FIXME: test should depend on `df', `tt' AND `del' ! */
        /* Approx. from	 Abramowitz & Stegun 26.7.10 (p.949) */
        s = 1. / (4. * df);

        return pnorm((tt * (1. - s)), del,
            sqrt((1. + tt * tt * 2. * s)),
            lower_tail !== negdel, log_p);
    }

    /* initialize twin series */
    /* Guenther, J. (1978). Statist. Computn. Simuln. vol.6, 199. */

    x = t * t;
    rxb = df / (x + df); /* := (1 - x) {x below} -- but more accurately */
    x = x / (x + df); /* in [0,1) */

    REprintf('pnt(t=%7g, df=%7g, ncp=%7g) ==> x= %10g:', t, df, ncp, x);

    if (x > 0.) {/* <==>  t != 0 */
        lambda = del * del;
        p = .5 * exp(-.5 * lambda);

        REprintf('\t p=%10Lg\n', p);

        if (p === 0.) { /* underflow! */

            /*========== really use an other algorithm for this case !!! */
            ML_ERROR(ME.ME_UNDERFLOW, 'pnt');
            ML_ERROR(ME.ME_RANGE, 'pnt'); /* |ncp| too large */
            return R_DT_0(lower_tail, log_p);
        }

        REprintf('it  1e5*(godd,   geven)|          p           q           s'
            /* 1.3 1..4..7.9 1..4..7.9|1..4..7.901 1..4..7.901 1..4..7.901 */
            + '        pnt(*)     errbd\n');
        /* 1..4..7..0..34 1..4..7.9*/

        q = M_SQRT_2dPI * p * del;
        s = .5 - p;
        /* s = 0.5 - p = 0.5*(1 - exp(-.5 L)) =  -0.5*expm1(-.5 L)) */
        if (s < 1e-7)
            s = -0.5 * expm1(-0.5 * lambda);
        a = .5;
        b = .5 * df;
        /* rxb = (1 - x) ^ b   [ ~= 1 - b*x for tiny x --> see 'xeven' below]
         *       where '(1 - x)' =: rxb {accurately!} above */
        rxb = pow(rxb, b);
        albeta = M_LN_SQRT_PI + lgammafn(b) - lgammafn(.5 + b);
        xodd = pbeta(x, a, b, /*lower*/true, /*log_p*/false);
        godd = 2. * rxb * exp(a * log(x) - albeta);
        tnc = b * x;
        xeven = (tnc < DBL_EPSILON) ? tnc : 1. - rxb;
        geven = tnc * rxb;
        tnc = p * xodd + q * xeven;

        let finis = false;

        /* repeat until convergence or iteration limit */
        for (it = 1; it <= itrmax; it++) {
            a += 1.;
            xodd -= godd;
            xeven -= geven;
            godd *= x * (a + b - 1.) / a;
            geven *= x * (a + b - .5) / (a + .5);
            p *= lambda / (2 * it);
            q *= lambda / (2 * it + 1);
            tnc += p * xodd + q * xeven;
            s -= p;
            /* R 2.4.0 added test for rounding error here. */

            if (s < -1.e-10) { /* happens e.g. for (t,df,ncp)=(40,10,38.5), after 799 it.*/
                ML_ERROR(ME.ME_PRECISION, 'pnt');
                REprintf('s = %#14.7Lg < 0 !!! ---> non-convergence!!\n', s);
                finis = true;
                break;
            }
            if (s <= 0 && it > 1) {
                finis = true;
                break;
            }
            errbd = (2. * s * (xodd - godd));

            REprintf('%3d %#9.4g %#9.4g|%#11.4Lg %#11.4Lg %#11.4Lg %#14.10Lg %#9.4g\n',
                it, 1e5 * godd, 1e5 * geven, p, q, s, tnc, errbd);

            if (fabs(errbd) < errmax) {
                finis = true; /*convergence*/
                break;
            }
        }//for
        /* non-convergence:*/
        if (!finis) {
            ML_ERROR(ME.ME_NOCONV, 'pnt');
        }
    }
    else { /* x = t = 0 */
        tnc = 0.;
    }
    tnc += pnorm(- del, 0., 1., /*lower*/true, /*log_p*/false);

    lower_tail = lower_tail !== negdel; /* xor */
    if (tnc > 1 - 1e-10 && lower_tail)
        ML_ERROR(ME.ME_PRECISION, 'pnt{final}');

    return R_DT_val(lower_tail, log_p, fmin2(tnc, 1.) /* Precaution */);
}
