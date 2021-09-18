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
import { Rf_gamma_cody } from '@special/bessel/gamma_cody';
import {
    enmten_BESS,
    ensig_BESS,
    enten_BESS,
    exparg_BESS,
    nsig_BESS,
    rtnsig_BESS,
    xlrg_BESS_IJ,
} from '../bessel-constants';
import type { IBesselRC } from '../IBesselRC';

const { sqrt, pow, min, max: fmax, exp, trunc } = Math;
const { POSITIVE_INFINITY: ML_POSINF } = Number;

const printer = debug('I_bessel');

export function I_bessel(x: number, alpha: number, nb: number, ize: number): IBesselRC {
    /* -------------------------------------------------------------------
 
     This routine calculates Bessel functions I_(N+ALPHA) (X)
     for non-negative argument X, and non-negative order N+ALPHA,
     with or without exponential scaling.
 
 
     Explanation of variables in the calling sequence
 
     X     - Non-negative argument for which
         I's or exponentially scaled I's (I*EXP(-X))
         are to be calculated.	If I's are to be calculated,
         X must be less than exparg_BESS (IZE=1) or xlrg_BESS_IJ (IZE=2),
         (see bessel.h).
     ALPHA - Fractional part of order for which
         I's or exponentially scaled I's (I*EXP(-X)) are
         to be calculated.  0 <= ALPHA < 1.0.
     NB    - Number of functions to be calculated, NB > 0.
         The first function calculated is of order ALPHA, and the
         last is of order (NB - 1 + ALPHA).
     IZE   - Type.	IZE = 1 if unscaled I's are to be calculated,
                = 2 if exponentially scaled I's are to be calculated.
     BI    - Output vector of length NB.	If the routine
         terminates normally (NCALC=NB), the vector BI contains the
         functions I(ALPHA,X) through I(NB-1+ALPHA,X), or the
         corresponding exponentially scaled functions.
     NCALC - Output variable indicating possible errors.
         Before using the vector BI, the user should check that
         NCALC=NB, i.e., all orders have been calculated to
         the desired accuracy.	See error returns below.
 
 
     *******************************************************************
     *******************************************************************
 
     Error returns
 
      In case of an error,	NCALC != NB, and not all I's are
      calculated to the desired accuracy.
 
      NCALC < 0:  An argument is out of range. For example,
         NB <= 0, IZE is not 1 or 2, or IZE=1 and ABS(X) >= EXPARG_BESS.
         In this case, the BI-vector is not calculated, and NCALC is
         set to MIN0(NB,0)-1 so that NCALC != NB.
 
      NB > NCALC > 0: Not all requested function values could
         be calculated accurately.	This usually occurs because NB is
         much larger than ABS(X).  In this case, BI[N] is calculated
         to the desired accuracy for N <= NCALC, but precision
         is lost for NCALC < N <= NB.  If BI[N] does not vanish
         for N > NCALC (because it is too small to be represented),
         and BI[N]/BI[NCALC] = 10**(-K), then only the first NSIG-K
         significant figures of BI[N] can be trusted.
 
 
     Intrinsic functions required are:
 
         DBLE, EXP, gamma_cody, INT, MAX, MIN, REAL, SQRT
 
 
     Acknowledgement
 
      This program is based on a program written by David J.
      Sookne (2) that computes values of the Bessel functions J or
      I of float argument and long order.  Modifications include
      the restriction of the computation to the I Bessel function
      of non-negative float argument, the extension of the computation
      to arbitrary positive order, the inclusion of optional
      exponential scaling, and the elimination of most underflow.
      An earlier version was published in (3).
 
     References: "A Note on Backward Recurrence Algorithms," Olver,
              F. W. J., and Sookne, D. J., Math. Comp. 26, 1972,
              pp 941-947.
 
             "Bessel Functions of Real Argument and Integer Order,"
              Sookne, D. J., NBS Jour. of Res. B. 77B, 1973, pp
              125-132.
 
             "ALGORITHM 597, Sequence of Modified Bessel Functions
              of the First Kind," Cody, W. J., Trans. Math. Soft.,
              1983, pp. 242-245.
 
      Latest modification: May 30, 1989
 
      Modified by: W. J. Cody and L. Stoltz
               Applied Mathematics Division
               Argonne National Laboratory
               Argonne, IL  60439
    */

    /*-------------------------------------------------------------------
      Mathematical constants
      -------------------------------------------------------------------*/
    const const__ = 1.585;

    /* Local variables */
    //int
    let nend;
    let intx;
    let nbmx;
    let k;
    let l;
    let n;
    let nstart;

    //double
    let pold;
    let test;
    let p;
    let em;
    let en;
    let empal;
    let emp2al;
    let halfx;
    let aa;
    let bb;
    let cc;
    let psave;
    let plast;
    let tover;
    let psavel;
    let sum;

    //int
    let ncalc = nb;
    const bi2 = new Array<number>(nb).fill(0);
    /*Parameter adjustments */
    //--bi;
    const nu = alpha;
    const twonu = nu + nu;

    /*-------------------------------------------------------------------
      Check for X, NB, OR IZE out of range.
      ------------------------------------------------------------------- */
    if (nb > 0 && x >= 0 && 0 <= nu && nu < 1 && 1 <= ize && ize <= 2) {
        ncalc = nb;
        if (ize === 1 && x > exparg_BESS) {
            //for (k = 1; k <= nb; k++)
            //	bi2[k-1] = ML_POSINF; /* the limit *is* = Inf */
            return { x: ML_POSINF, nb, ncalc };
        }
        if (ize === 2 && x > xlrg_BESS_IJ) {
            //for (k = 1; k <= nb; k++)
            //	bi2[k-1] = 0.; /* The limit exp(-x) * I_nu(x) --> 0 : */
            return { x: 0, nb, ncalc };
        }
        intx = trunc(x); /* fine, since x <= xlrg_BESS_IJ <<< LONG_MAX */
        if (x >= rtnsig_BESS) {
            /* "non-small" x ( >= 1e-4 ) */
            /* -------------------------------------------------------------------
               Initialize the forward sweep, the P-sequence of Olver
               ------------------------------------------------------------------- */
            nbmx = nb - intx;
            n = intx + 1;
            en = n + n + twonu;
            plast = 1;
            p = en / x;
            /* ------------------------------------------------
               Calculate general significance test
               ------------------------------------------------ */
            test = ensig_BESS + ensig_BESS;
            if (intx * 2 > nsig_BESS * 5) {
                test = sqrt(test * p);
            } else {
                test /= pow(const__, intx);
            }
            let gotoL120 = false;
            if (nbmx >= 3) {
                /* --------------------------------------------------
                   Calculate P-sequence until N = NB-1
                   Check for possible overflow.
                   ------------------------------------------------ */
                tover = enten_BESS / ensig_BESS;
                nstart = intx + 2;
                nend = nb - 1;
                for (k = nstart; k <= nend; ++k) {
                    n = k;
                    en += 2;
                    pold = plast;
                    plast = p;
                    p = (en * plast) / x + pold;
                    if (p > tover) {
                        /* ------------------------------------------------
                           To avoid overflow, divide P-sequence by TOVER.
                           Calculate P-sequence until ABS(P) > 1.
                           ---------------------------------------------- */
                        tover = enten_BESS;
                        p /= tover;
                        plast /= tover;
                        psave = p;
                        psavel = plast;
                        nstart = n + 1;
                        do {
                            ++n;
                            en += 2;
                            pold = plast;
                            plast = p;
                            p = (en * plast) / x + pold;
                        } while (p <= 1);

                        bb = en / x;
                        /* ------------------------------------------------
                           Calculate backward test, and find NCALC,
                           the highest N such that the test is passed.
                           ------------------------------------------------ */
                        test = (pold * plast) / ensig_BESS;
                        test *= 0.5 - 0.5 / (bb * bb);
                        p = plast * tover;
                        --n;
                        en -= 2;
                        nend = min(nb, n);
                        for (l = nstart; l <= nend; ++l) {
                            ncalc = l - 1;
                            pold = psavel;
                            psavel = psave;
                            psave = (en * psavel) / x + pold;
                            if (psave * psavel > test) {
                                break;
                            }
                            ncalc = nend;
                        }
                        gotoL120 = true;
                        break;
                    } //if
                } //for
                if (gotoL120 === false) {
                    n = nend;
                    en = n + n + twonu;
                    /*---------------------------------------------------
                      Calculate special significance test for NBMX > 2.
                      --------------------------------------------------- */
                    test = fmax(test, sqrt(plast * ensig_BESS) * sqrt(p + p));
                }
            } //if
            /* --------------------------------------------------------
               Calculate P-sequence until significance test passed.
               -------------------------------------------------------- */
            if (gotoL120 === false) {
                do {
                    ++n;
                    en += 2;
                    pold = plast;
                    plast = p;
                    p = (en * plast) / x + pold;
                } while (p < test);
            }

            //L120:
            /* -------------------------------------------------------------------
             Initialize the backward recursion and the normalization sum.
             ------------------------------------------------------------------- */
            ++n;
            en += 2;
            bb = 0;
            aa = 1 / p;
            em = n - 1;
            empal = em + nu;
            emp2al = em - 1 + twonu;
            sum = (aa * empal * emp2al) / em;
            nend = n - nb;
            let gotoL230 = false;
            //let gotoL220 = false; //for doc purpose, because L220 follows the for loop immediatly
            //for loop used to skip over rest of code and simualte "goto"
            for (let cnt = 0; cnt < 1; cnt++) {
                if (nend < 0) {
                    /* -----------------------------------------------------
                       N < NB, so store BI[N] and set higher orders to 0..
                       ----------------------------------------------------- */
                    bi2[n - 1] = aa;
                    nend = -nend;
                    for (l = 1; l <= nend; ++l) {
                        bi2[n + l - 1] = 0;
                    }
                } else {
                    if (nend > 0) {
                        /* -----------------------------------------------------
                           Recur backward via difference equation,
                           calculating (but not storing) BI[N], until N = NB.
                           --------------------------------------------------- */

                        for (l = 1; l <= nend; ++l) {
                            --n;
                            en -= 2;
                            cc = bb;
                            bb = aa;
                            /* for x ~= 1500,  sum would overflow to 'inf' here,
                             * and the final bi[] /= sum would give 0 wrongly;
                             * RE-normalize (aa, sum) here -- no need to undo */
                            if (nend > 100 && aa > 1e200) {
                                /* multiply by  2^-900 = 1.18e-271 */
                                const pow05_to_900 = pow(2, -900);
                                cc = cc * pow05_to_900;
                                bb = bb * pow05_to_900;
                                sum = sum * pow05_to_900;
                            }
                            aa = (en * bb) / x + cc;
                            em -= 1;
                            emp2al -= 1;
                            if (n === 1) {
                                break;
                            }
                            if (n === 2) {
                                emp2al = 1;
                            }
                            empal -= 1;
                            sum = ((sum + aa * empal) * emp2al) / em;
                        }
                    }
                    /* ---------------------------------------------------
                       Store BI[NB]
                       --------------------------------------------------- */
                    bi2[n - 1] = aa;
                    if (nb <= 1) {
                        sum = sum + sum + aa;
                        gotoL230 = true;
                        break; //for loop used to skip over rest of code and simualte "goto"
                    }
                    /* -------------------------------------------------
                       Calculate and Store BI[NB-1]
                       ------------------------------------------------- */
                    --n;
                    en -= 2;
                    bi2[n - 1] = (en * aa) / x + bb;
                    if (n === 1) {
                        //gotoL220 = true;
                        break; //for loop used to skip over rest of code and simualte "goto"
                    }
                    em -= 1;
                    if (n === 2) emp2al = 1;
                    else emp2al -= 1;

                    empal -= 1;
                    sum = ((sum + bi2[n - 1] * empal) * emp2al) / em;
                } // if else
                nend = n - 2;
                if (nend > 0) {
                    /* --------------------------------------------
                       Calculate via difference equation
                       and store BI[N], until N = 2.
                       ------------------------------------------ */
                    for (l = 1; l <= nend; ++l) {
                        --n;
                        en -= 2;
                        bi2[n - 1] = (en * bi2[n]) / x + bi2[n + 1];
                        em -= 1;
                        if (n === 2) emp2al = 1;
                        else emp2al -= 1;
                        empal -= 1;
                        sum = ((sum + bi2[n - 1] * empal) * emp2al) / em;
                    } //for
                } //if
                /* ----------------------------------------------
                   Calculate BI[1]
                   -------------------------------------------- */
                bi2[0] = (2 * empal * bi2[1]) / x + bi2[2];
            } //for loop for "goto" simulation

            //L220:
            if (gotoL230 === false) {
                sum = sum + sum + bi2[0];
            }

            //L230:
            /* ---------------------------------------------------------
               Normalize.  Divide all BI[N] by sum.
               --------------------------------------------------------- */
            if (nu !== 0) sum *= Rf_gamma_cody(1 + nu) * pow(x * 0.5, -nu);
            if (ize === 1) sum *= exp(-x);
            aa = enmten_BESS;
            if (sum > 1) aa *= sum;
            for (n = 1; n <= nb; ++n) {
                if (bi2[n - 1] < aa) bi2[n - 1] = 0;
                else bi2[n - 1] /= sum;
            }
            const rc = { x: bi2[nb - 1], nb, ncalc };
            printer('normalize, devide all  Bi[N] by sum, result:%o', rc);
            return rc;
        } else {
            /* small x  < 1e-4 */
            /* -----------------------------------------------------------
               Two-term ascending series for small X.
               -----------------------------------------------------------*/
            aa = 1;
            empal = 1 + nu;

            /* No need to check for underflow */
            halfx = 0.5 * x;

            if (nu !== 0) aa = pow(halfx, nu) / Rf_gamma_cody(empal);
            if (ize === 2) aa *= exp(-x);
            bb = halfx * halfx;
            bi2[0] = aa + (aa * bb) / empal;
            if (x !== 0 && bi2[0] === 0) ncalc = 0;
            if (nb > 1) {
                if (x === 0) {
                    for (n = 2; n <= nb; ++n) bi2[n - 1] = 0;
                } else {
                    /* -------------------------------------------------
                       Calculate higher-order functions.
                       ------------------------------------------------- */
                    cc = halfx;
                    tover = (enmten_BESS + enmten_BESS) / x;
                    if (bb !== 0) tover = enmten_BESS / bb;
                    for (n = 2; n <= nb; ++n) {
                        aa /= empal;
                        empal += 1;
                        aa *= cc;
                        if (aa <= tover * empal) bi2[n - 1] = aa = 0;
                        else bi2[n - 1] = aa + (aa * bb) / empal;
                        if (bi2[n - 1] === 0 && ncalc > n) ncalc = n - 1;
                    }
                }
            }
        }
    } else {
        /* argument out of range */
        ncalc = min(nb, 0) - 1;
    }
    const rc = { x: bi2[nb - 1], nb, ncalc };
    printer('drop off, result:%o', rc);
    return rc;
}
