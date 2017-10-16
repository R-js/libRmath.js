/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 14, 2017
 *
 *  ORIGINAL AUTHOR
 *  Copyright (C) 2000-2013 The R Core Team
 *
 *  Algorithm AS 226 Appl. Statist. (1987) Vol. 36, No. 2
 *  by Russell V. Lenth
 *  Incorporates modification AS R84 from AS Vol. 39, pp311-2, 1990
 *                        and AS R95 from AS Vol. 44, pp551-2, 1995
 *  by H. Frick and Min Long Lam.
 *  original (C) Royal Statistical Society 1987, 1990, 1995
 *
 *  Returns the cumulative probability of x for the non-central
 *  beta distribution with parameters a, b and non-centrality ncp.
 *
 *  Auxiliary routines required:
 *	lgamma - log-gamma function
 *      pbeta  - incomplete-beta function {nowadays: pbeta_raw() -> bratio()}
 */

import {
    ML_ERR_return_NAN,
    floor,
    fmax2,
    sqrt,
    log,
    exp,
    ML_ERROR,
    ME,
    ISNAN,
    R_P_bounds_01

} from './_general';

import { log1p } from './log1p';

import { lgammafn } from './lgamma_fn';

import { Toms708, NumberW } from './toms708';

export function pnbeta_raw(x: number, o_x: number, a: number, b: number, ncp: number) {

    /* o_x  == 1 - x  but maybe more accurate */

    /* change errmax and itrmax if desired;
     * original (AS 226, R84) had  (errmax; itrmax) = (1e-6; 100) */
    const errmax = 1.0e-9;
    const itrmax = 10000;  /* 100 is not enough for pf(ncp=200)
                     see PR#11277 */

    let a0;
    let lbeta;
    let c;
    let errbd;
    let x0;
    let temp = new NumberW(0);
    let tmp_c = new NumberW(0);
    let ierr = new NumberW(0);

    let ans;
    let ax;
    let gx;
    let q;
    let sumq;

    if (ncp < 0. || a <= 0. || b <= 0.) {
        return ML_ERR_return_NAN();
    }

    if (x < 0. || o_x > 1. || (x === 0. && o_x === 1.)) return 0.;
    if (x > 1. || o_x < 0. || (x === 1. && o_x === 0.)) return 1.;

    c = ncp / 2.;

    /* initialize the series */

    x0 = floor(fmax2(c - 7. * sqrt(c), 0.));
    a0 = a + x0;
    lbeta = lgammafn(a0) + lgammafn(b) - lgammafn(a0 + b);
    /* temp = pbeta_raw(x, a0, b, TRUE, FALSE), but using (x, o_x): */
    Toms708.bratio(a0, b, x, o_x, temp, tmp_c, ierr, false);

    gx = exp(a0 * log(x) + b * (x < .5 ? log1p(-x) : log(o_x))
        - lbeta - log(a0));
    if (a0 > a)
        q = exp(-c + x0 * log(c) - lgammafn(x0 + 1.));
    else
        q = exp(-c);

    sumq = 1. - q;
    ans = ax = q * temp.val;

    /* recurse over subsequent terms until convergence is achieved */
    let j = floor(x0); // x0 could be billions, and is in package EnvStats
    do {
        j++;
        temp.val -= gx;
        gx *= x * (a + b + j - 1.) / (a + j);
        q *= c / j;
        sumq -= q;
        ax = temp.val * q;
        ans += ax;
        errbd = ((temp.val - gx) * sumq);
    }
    while (errbd > errmax && j < itrmax + x0);

    if (errbd > errmax)
        ML_ERROR(ME.ME_PRECISION, 'pnbeta');
    if (j >= itrmax + x0)
        ML_ERROR(ME.ME_NOCONV, 'pnbeta');

    return ans;
}

export function pnbeta2(x: number, o_x: number, a: number, b: number, ncp: number,   /* o_x  == 1 - x  but maybe more accurate */
    lower_tail: boolean, log_p: boolean) {
    let ans = pnbeta_raw(x, o_x, a, b, ncp);


    /* return R_DT_val(ans), but we want to warn about cancellation here */
    if (lower_tail) {
        return (log_p ? log(ans) : ans);
    }
    else {
        if (ans > 1. - 1e-10) ML_ERROR(ME.ME_PRECISION, 'pnbeta');
        if (ans > 1.0) ans = 1.0;  /* Precaution */
        /* include standalone case */
        return (log_p ? log1p(- ans) : (1. - ans));

    }
}

export function pnbeta(x: number, a: number, b: number, ncp: number, lower_tail: boolean, log_p: boolean) {

    if (ISNAN(x) || ISNAN(a) || ISNAN(b) || ISNAN(ncp))
        return x + a + b + ncp;


    let rc = R_P_bounds_01(lower_tail, log_p, x, 0., 1.);
    if (rc !== undefined) {
        return rc;
    }
    return pnbeta2(x, 1 - x, a, b, ncp, lower_tail, log_p);
}
