'use strict';
/* This is a conversion from libRmath.so to Typescript/Javascript
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
import { M_1_SQRT_2PI } from '@common/logger';
import { pnorm5 as pnorm } from '../normal/pnorm';

const { exp, pow } = Math;

const bb = 8;
const C2 = -50;
const wlar = 3;
const wincr1 = 2;
const wincr2 = 3;
const nleg = 12;
const ihalf = 6;

const xleg = [
    0.981560634246719250690549090149,
    0.904117256370474856678465866119,
    0.769902674194304687036893833213,
    0.587317954286617447296702418941,
    0.367831498998180193752691536644,
    0.125233408511468915472441369464,
];

const aleg = [
    0.047175336386511827194615961485,
    0.106939325995318430960254718194,
    0.160078328543346226334652529543,
    0.20316742672306592174906445581,
    0.233492536538354808760849898925,
    0.249147045813402785000562436043,
];

const C3 = 60;
const C1 = -30;

export function wprob(w: number, rr: number, cc: number): number {
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
    //
    //double
    //
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
    //
    // int
    //
    let j: number;

    qsqz = w * 0.5;

    /* if w >= 16 then the integral lower bound (occurs for c=20) */
    /* is 0.99999999999995 so return a value of 1. */

    if (qsqz >= bb) {
        return 1.0;
    }

    /* find (f(w/2) - 1) ^ cc */
    /* (first term in integral of hartley's form). */

    pr_w = 2 * pnorm(qsqz, 0, 1, true, false) - 1; /* erf(qsqz / M_SQRT2) */
    /* if pr_w ^ cc < 2e-22 then set pr_w = 0 */
    if (pr_w >= exp(C2 / cc)) pr_w = pow(pr_w, cc);
    else pr_w = 0.0;

    /* if w is large then the second component of the */
    /* integral is small, so fewer intervals are needed. */

    if (w > wlar) wincr = wincr1;
    else wincr = wincr2;

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
        a = 0.5 * (bub + blb);

        /* legendre quadrature with order = nleg */

        b = 0.5 * (bub - blb);

        for (let jj = 1; jj <= nleg; jj++) {
            if (ihalf < jj) {
                j = nleg - jj + 1;
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
            if (qexpo > C3) break;

            pplus = 2 * pnorm(ac, 0, 1, true, false);
            pminus = 2 * pnorm(ac, w, 1, true, false);

            /* if rinsum ^ (cc-1) < 9e-14, */
            /* then doesn't contribute to integral */

            rinsum = pplus * 0.5 - pminus * 0.5;
            if (rinsum >= exp(C1 / cc1)) {
                rinsum = aleg[j - 1] * exp(-(0.5 * qexpo)) * pow(rinsum, cc1);
                elsum += rinsum;
            }
        }
        elsum *= 2.0 * b * cc * M_1_SQRT_2PI;
        einsum += elsum;
        blb = bub;
        bub += binc;
    }

    /* if pr_w ^ rr < 9e-14, then return 0 */
    pr_w += einsum;
    if (pr_w <= exp(C1 / rr)) return 0;

    pr_w = pow(pr_w, rr);
    if (pr_w >= 1)
        /* 1 was iMax was eps */
        return 1;
    return pr_w;
} /* wprob() */
