/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 18, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998       Ross Ihaka
 *  Copyright (C) 2000--2007 The R Core Team
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
 *  SYNOPSIS
 *
 *    #include <Rmath.h>
 *    double ptukey(q, rr, cc, df, lower_tail, log_p);
 *
 *  DESCRIPTION
 *
 *    Computes the probability that the maximum of rr studentized
 *    ranges, each based on cc means and with df degrees of freedom
 *    for the standard error, is less than q.
 *
 *    The algorithm is based on that of the reference.
 *
 *  REFERENCE
 *
 *    Copenhaver, Margaret Diponzio & Holland, Burt S.
 *    Multiple comparisons of simple effects in
 *    the two-way analysis of variance with fixed effects.
 *    Journal of Statistical Computation and Simulation,
 *    Vol.30, pp.1-15, 1988.
*/

const nleg = 12;
const ihalf = 6;

import {
    exp,
    pow,
    M_1_SQRT_2PI,
    ISNAN,
    ML_ERR_return_NAN,
    R_FINITE,
    R_DT_0,
    R_DT_1,
    log,
    M_LN2,
    sqrt,
    ML_ERROR,
    ME
} from '~common';

import { INormal } from '~normal';

import { lgammafn } from '../gamma/lgamma_fn';

import { R_DT_val } from '~log';

export function wprob(w: number, rr: number, cc: number, normal: INormal): number {
    /*  wprob() :
    
        This function calculates probability integral of Hartley's
        form of the range.
    
        w     = value of range
        rr    = no. of rows or groups
        cc    = no. of columns or treatments
        ir    = error flag = 1 if pr_w probability > 1
        pr_w = returned probability integral from (0, w)
    
        program will not terminate if ir is raised.
    
        bb = upper limit of legendre integration
        iMax = maximum acceptable value of integral
        nleg = order of legendre quadrature
        ihalf = int ((nleg + 1) / 2)
        wlar = value of range above which wincr1 intervals are used to
               calculate second part of integral,
               else wincr2 intervals are used.
        C1, C2, C3 = values which are used as cutoffs for terminating
        or modifying a calculation.
    
        M_1_SQRT_2PI = 1 / sqrt(2 * pi);  from abramowitz & stegun, p. 3.
        M_SQRT2 = sqrt(2)
        xleg = legendre 12-point nodes
        aleg = legendre 12-point coefficients
     */

    /* looks like this is suboptimal for double precision.
       (see how C1-C3 are used) <MM>
    */
    /* const double iMax  = 1.; not used if = 1*/
    const C1 = -30.;
    const C2 = -50.;
    const C3 = 60.;
    const bb = 8.;
    const wlar = 3.;
    const wincr1 = 2.;
    const wincr2 = 3.;
    const xleg = [
        0.981560634246719250690549090149,
        0.904117256370474856678465866119,
        0.769902674194304687036893833213,
        0.587317954286617447296702418941,
        0.367831498998180193752691536644,
        0.125233408511468915472441369464
    ];
    const aleg = [
        0.047175336386511827194615961485,
        0.106939325995318430960254718194,
        0.160078328543346226334652529543,
        0.203167426723065921749064455810,
        0.233492536538354808760849898925,
        0.249147045813402785000562436043
    ];
    let a: number;
    let ac: number;
    let pr_w: number;
    let b: number;
    let binc: number;
    let c: number;
    let cc1: number;
    let pminus: number;
    let pplus: number;
    let qexpo: number;
    let qsqz: number;
    let rinsum: number;
    let wi: number;
    let wincr: number;
    let xx: number;
    let blb: number;
    let bub: number;
    let einsum: number;
    let elsum: number;
    let j: number;
    let jj: number;


    qsqz = w * 0.5;

    /* if w >= 16 then the integral lower bound (occurs for c=20) */
    /* is 0.99999999999995 so return a value of 1. */

    if (qsqz >= bb)
        return 1.0;

    /* find (f(w/2) - 1) ^ cc */
    /* (first term in integral of hartley's form). */

    pr_w = 2 * normal.pnorm(qsqz, 0., 1., true, false) - 1.; /* erf(qsqz / M_SQRT2) */
    /* if pr_w ^ cc < 2e-22 then set pr_w = 0 */
    if (pr_w >= exp(C2 / cc))
        pr_w = pow(pr_w, cc);
    else
        pr_w = 0.0;

    /* if w is large then the second component of the */
    /* integral is small, so fewer intervals are needed. */

    if (w > wlar)
        wincr = wincr1;
    else
        wincr = wincr2;

    /* find the integral of second term of hartley's form */
    /* for the integral of the range for equal-length */
    /* intervals using legendre quadrature.  limits of */
    /* integration are from (w/2, 8).  two or three */
    /* equal-length intervals are used. */

    /* blb and bub are lower and upper limits of integration. */

    blb = qsqz;
    binc = (bb - qsqz) / wincr;
    bub = blb + binc;
    einsum = 0.0;

    /* integrate over each interval */

    cc1 = cc - 1.0;
    for (wi = 1; wi <= wincr; wi++) {
        elsum = 0.0;
        a = (0.5 * (bub + blb));

        /* legendre quadrature with order = nleg */

        b = (0.5 * (bub - blb));

        for (jj = 1; jj <= nleg; jj++) {
            if (ihalf < jj) {
                j = (nleg - jj) + 1;
                xx = xleg[j - 1];
            } else {
                j = jj;
                xx = -xleg[j - 1];
            }
            c = b * xx;
            ac = a + c;

            /* if exp(-qexpo/2) < 9e-14, */
            /* then doesn't contribute to integral */

            qexpo = ac * ac;
            if (qexpo > C3)
                break;

            pplus = 2 * normal.pnorm(ac, 0., 1., true, false);
            pminus = 2 * normal.pnorm(ac, w, 1., true, false);

            /* if rinsum ^ (cc-1) < 9e-14, */
            /* then doesn't contribute to integral */

            rinsum = (pplus * 0.5) - (pminus * 0.5);
            if (rinsum >= exp(C1 / cc1)) {
                rinsum = (aleg[j - 1] * exp(-(0.5 * qexpo))) * pow(rinsum, cc1);
                elsum += rinsum;
            }
        }
        elsum *= (((2.0 * b) * cc) * M_1_SQRT_2PI);
        einsum += elsum;
        blb = bub;
        bub += binc;
    }

    /* if pr_w ^ rr < 9e-14, then return 0 */
    pr_w += einsum;
    if (pr_w <= exp(C1 / rr))
        return 0.;

    pr_w = pow(pr_w, rr);
    if (pr_w >= 1.)/* 1 was iMax was eps */
        return 1.;
    return pr_w;
} /* wprob() */


export function ptukey(
    q: number, 
    rr: number, 
    cc: number, 
    df: number, 
    lower_tail: boolean, 
    log_p: boolean, 
    normal: INormal) {
    /*  function ptukey() [was qprob() ]:
    
        q = value of studentized range
        rr = no. of rows or groups
        cc = no. of columns or treatments
        df = degrees of freedom of error term
        ir[0] = error flag = 1 if wprob probability > 1
        ir[1] = error flag = 1 if qprob probability > 1
    
        qprob = returned probability integral over [0, q]
    
        The program will not terminate if ir[0] or ir[1] are raised.
    
        All references in wprob to Abramowitz and Stegun
        are from the following reference:
    
        Abramowitz, Milton and Stegun, Irene A.
        Handbook of Mathematical Functions.
        New York:  Dover publications, Inc. (1970).
    
        All constants taken from this text are
        given to 25 significant digits.
    
        nlegq = order of legendre quadrature
        ihalfq = int ((nlegq + 1) / 2)
        eps = max. allowable value of integral
        eps1 & eps2 = values below which there is
                  no contribution to integral.
    
        d.f. <= dhaf:	integral is divided into ulen1 length intervals.  else
        d.f. <= dquar:	integral is divided into ulen2 length intervals.  else
        d.f. <= deigh:	integral is divided into ulen3 length intervals.  else
        d.f. <= dlarg:	integral is divided into ulen4 length intervals.
    
        d.f. > dlarg:	the range is used to calculate integral.
    
        M_LN2 = log(2)
    
        xlegq = legendre 16-point nodes
        alegq = legendre 16-point coefficients
    
        The coefficients and nodes for the legendre quadrature used in
        qprob and wprob were calculated using the algorithms found in:
    
        Stroud, A. H. and Secrest, D.
        Gaussian Quadrature Formulas.
        Englewood Cliffs,
        New Jersey:  Prentice-Hall, Inc, 1966.
    
        All values matched the tables (provided in same reference)
        to 30 significant digits.
    
        f(x) = .5 + erf(x / sqrt(2)) / 2      for x > 0
    
        f(x) = erfc( -x / sqrt(2)) / 2	      for x < 0
    
        where f(x) is standard normal c. d. f.
    
        if degrees of freedom large, approximate integral
        with range distribution.
     */
    const nlegq = 16;
    const ihalfq = 8;

    /*  const double eps = 1.0; not used if = 1 */
    const eps1 = -30.0;
    const eps2 = 1.0e-14;
    const dhaf = 100.0;
    const dquar = 800.0;
    const deigh = 5000.0;
    const dlarg = 25000.0;
    const ulen1 = 1.0;
    const ulen2 = 0.5;
    const ulen3 = 0.25;
    const ulen4 = 0.125;
    const xlegq = [
        0.989400934991649932596154173450,
        0.944575023073232576077988415535,
        0.865631202387831743880467897712,
        0.755404408355003033895101194847,
        0.617876244402643748446671764049,
        0.458016777657227386342419442984,
        0.281603550779258913230460501460,
        0.950125098376374401853193354250e-1
    ];
    const alegq = [
        0.271524594117540948517805724560e-1,
        0.622535239386478928628438369944e-1,
        0.951585116824927848099251076022e-1,
        0.124628971255533872052476282192,
        0.149595988816576732081501730547,
        0.169156519395002538189312079030,
        0.182603415044923588866763667969,
        0.189450610455068496285396723208
    ];
    let ans: number;
    let f2: number;
    let f21: number;
    let f2lf: number;
    let ff4: number;
    let otsum: number;
    let qsqz: number;
    let rotsum: number;
    let t1: number;
    let twa1: number;
    let ulen: number;
    let wprb: number;
    let i: number;
    let j: number;
    let jj: number;


    if (ISNAN(q) || ISNAN(rr) || ISNAN(cc) || ISNAN(df)) {
        return ML_ERR_return_NAN();
    }


    if (q <= 0) {
        return R_DT_0(lower_tail, log_p);
    }

    /* df must be > 1 */
    /* there must be at least two values */

    if (df < 2 || rr < 1 || cc < 2) ML_ERR_return_NAN;

    if (!R_FINITE(q))
        return R_DT_1(lower_tail, log_p);

    if (df > dlarg)
        return R_DT_val(lower_tail, log_p, wprob(q, rr, cc, normal));

    /* calculate leading constant */

    f2 = df * 0.5;
    /* lgammafn(u) = log(gamma(u)) */
    f2lf = ((f2 * log(df)) - (df * M_LN2)) - lgammafn(f2);
    f21 = f2 - 1.0;

    /* integral is divided into unit, half-unit, quarter-unit, or */
    /* eighth-unit length intervals depending on the value of the */
    /* degrees of freedom. */

    ff4 = df * 0.25;
    if (df <= dhaf) ulen = ulen1;
    else if (df <= dquar) ulen = ulen2;
    else if (df <= deigh) ulen = ulen3;
    else ulen = ulen4;

    f2lf += log(ulen);

    /* integrate over each subinterval */

    ans = 0.0;
    otsum = 0.0; // to let typscript linting know it is used , it is within the for loop
    for (i = 1; i <= 50; i++) {
        otsum = 0.0;

        /* legendre quadrature with order = nlegq */
        /* nodes (stored in xlegq) are symmetric around zero. */

        twa1 = (2 * i - 1) * ulen;

        for (jj = 1; jj <= nlegq; jj++) {
            if (ihalfq < jj) {
                j = jj - ihalfq - 1;
                t1 = (f2lf + (f21 * log(twa1 + (xlegq[j] * ulen))))
                    - (((xlegq[j] * ulen) + twa1) * ff4);
            } else {
                j = jj - 1;
                t1 = (f2lf + (f21 * log(twa1 - (xlegq[j] * ulen))))
                    + (((xlegq[j] * ulen) - twa1) * ff4);

            }

            /* if exp(t1) < 9e-14, then doesn't contribute to integral */
            if (t1 >= eps1) {
                if (ihalfq < jj) {
                    qsqz = q * sqrt(((xlegq[j] * ulen) + twa1) * 0.5);
                } else {
                    qsqz = q * sqrt(((-(xlegq[j] * ulen)) + twa1) * 0.5);
                }

                /* call wprob to find integral of range portion */

                wprb = wprob(qsqz, rr, cc, normal);
                rotsum = (wprb * alegq[j]) * exp(t1);
                otsum += rotsum;
            }
            /* end legendre integral for interval i */
            /* L200: */
        }

        /* if integral for interval i < 1e-14, then stop.
         * However, in order to avoid small area under left tail,
         * at least  1 / ulen  intervals are calculated.
         */
        if (i * ulen >= 1.0 && otsum <= eps2)
            break;

        /* end of interval i */
        /* L330: */

        ans += otsum;
    }

    if (otsum > eps2) { /* not converged */
        ML_ERROR(ME.ME_PRECISION, 'ptukey');
    }
    if (ans > 1.)
        ans = 1.;
    return R_DT_val(lower_tail, log_p, ans);
}
