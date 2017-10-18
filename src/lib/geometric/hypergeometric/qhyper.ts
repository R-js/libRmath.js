/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 19, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2014 The R Core Team
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
 *
 *  DESCRIPTION
 *
 *    The quantile function of the hypergeometric distribution.
 */


import {
    ISNAN,
    R_FINITE,
    R_forceint,
    ML_ERR_return_NAN,
    fmax2,
    fmin2,
    R_Q_P01_boundaries,
    exp,
    log,
    DBL_EPSILON,
    
} from '~common';

import { R_DT_qIv } from '~exp';

import { lfastchoose } from '~common';

export function qhyper(p: number, NR: number, NB: number, n: number,
    lower_tail: boolean, log_p: boolean): number {
    /* This is basically the same code as  ./phyper.c  *used* to be --> FIXME! */
    let N;
    let xstart;
    let xend;
    let xr;
    let xb;
    let sum;
    let term;
    let small_N;

    if (ISNAN(p) || ISNAN(NR) || ISNAN(NB) || ISNAN(n))
        return p + NR + NB + n;

    if (!R_FINITE(p) || !R_FINITE(NR) || !R_FINITE(NB) || !R_FINITE(n))
        return ML_ERR_return_NAN();

    NR = R_forceint(NR);
    NB = R_forceint(NB);
    N = NR + NB;
    n = R_forceint(n);
    if (NR < 0 || NB < 0 || n < 0 || n > N)
        return ML_ERR_return_NAN();

    /* Goal:  Find  xr (= #{red balls in sample}) such that
     *   phyper(xr,  NR,NB, n) >= p > phyper(xr - 1,  NR,NB, n)
     */

    xstart = fmax2(0, n - NB);
    xend = fmin2(n, NR);

    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, xstart, xend);
    if (rc !== undefined){
        return rc;
    }
    xr = xstart;
    xb = n - xr; /* always ( = #{black balls in sample} ) */

    small_N = (N < 1000); /* won't have underflow in product below */
    /* if N is small,  term := product.ratio( bin.coef );
       otherwise work with its logarithm to protect against underflow */
    term = lfastchoose(NR, xr) + lfastchoose(NB, xb) - lfastchoose(N, n);
    if (small_N) term = exp(term);
    NR -= xr;
    NB -= xb;

    if (!lower_tail || log_p) {
        p = R_DT_qIv(lower_tail , log_p, p);
    }
    p *= 1 - 1000 * DBL_EPSILON; /* was 64, but failed on FreeBSD sometimes */
    sum = small_N ? term : exp(term);

    while (sum < p && xr < xend) {
        xr++;
        NB++;
        if (small_N) term *= (NR / xr) * (xb / NB);
        else term += log((NR / xr) * (xb / NB));
        sum += small_N ? term : exp(term);
        xb--;
        NR--;
    }
    return xr;
}
