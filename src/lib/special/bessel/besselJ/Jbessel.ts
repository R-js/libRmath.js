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
import { ME, ML_ERROR } from '@common/logger';
import { Rf_gamma_cody } from '@special/bessel/gamma_cody';
import { enmten_BESS, ensig_BESS, enten_BESS, xlrg_BESS_IJ } from '../bessel-constants';
import { IBesselRC } from '../IBesselRC';

const { min, trunc, pow, sqrt, sin, cos, max, abs } = Math;

const printer = debug('J_bessel');

export function J_bessel(x: number, alpha: number, nb: number): IBesselRC {
    /*
     Calculates Bessel functions J_{n+alpha} (x)
     for non-negative argument x, and non-negative order n+alpha, n = 0,1,..,nb-1.
  
      Explanation of variables in the calling sequence.
  
     X     - Non-negative argument for which J's are to be calculated.
     ALPHA - Fractional part of order for which
       J's are to be calculated.  0 <= ALPHA < 1.
     NB    - Number of functions to be calculated, NB >= 1.
       The first function calculated is of order ALPHA, and the
       last is of order (NB - 1 + ALPHA).
     B     - Output vector of length NB.  If RJBESL
       terminates normally (NCALC=NB), the vector B contains the
       functions J/ALPHA/(X) through J/NB-1+ALPHA/(X).
     NCALC - Output variable indicating possible errors.
       Before using the vector B, the user should check that
       NCALC=NB, i.e., all orders have been calculated to
       the desired accuracy.	See the following
  
       ****************************************************************
  
     Error return codes
  
      In case of an error,  NCALC != NB, and not all J's are
      calculated to the desired accuracy.
  
      NCALC < 0:	An argument is out of range. For example,
         NBES <= 0, ALPHA < 0 or > 1, or X is too large.
         In this case, b[1] is set to zero, the remainder of the
         B-vector is not calculated, and NCALC is set to
         MIN(NB,0)-1 so that NCALC != NB.
  
      NB > NCALC > 0: Not all requested function values could
         be calculated accurately.  This usually occurs because NB is
         much larger than ABS(X).	 In this case, b[N] is calculated
         to the desired accuracy for N <= NCALC, but precision
         is lost for NCALC < N <= NB.  If b[N] does not vanish
         for N > NCALC (because it is too small to be represented),
         and b[N]/b[NCALC] = 10^(-K), then only the first NSIG - K
         significant figures of b[N] can be trusted.
  
  
      Acknowledgement
  
      This program is based on a program written by David J. Sookne
      (2) that computes values of the Bessel functions J or I of float
      argument and long order.  Modifications include the restriction
      of the computation to the J Bessel function of non-negative float
      argument, the extension of the computation to arbitrary positive
      order, and the elimination of most underflow.
  
      References:
  
      Olver, F.W.J., and Sookne, D.J. (1972)
      "A Note on Backward Recurrence Algorithms";
      Math. Comp. 26, 941-947.
  
      Sookne, D.J. (1973)
      "Bessel Functions of Real Argument and Integer Order";
      NBS Jour. of Res. B. 77B, 125-132.
  
      Latest modification: March 19, 1990
  
      Author: W. J. Cody
        Applied Mathematics Division
        Argonne National Laboratory
        Argonne, IL  60439
     *******************************************************************
     */

    /* ---------------------------------------------------------------------
      Mathematical constants
 
     PI2	  = 2 / PI
     TWOPI1 = first few significant digits of 2 * PI
     TWOPI2 = (2*PI - TWOPI1) to working precision, i.e.,
        TWOPI1 + TWOPI2 = 2 * PI to extra precision.
     --------------------------------------------------------------------- */
    const pi2 = 0.636619772367581343075535;
    const twopi1 = 6.28125;
    const twopi2 = 0.001935307179586476925286767;

    /*---------------------------------------------------------------------
     *  Factorial(N)
     *--------------------------------------------------------------------- */
    const fact: number[] = [
        1,
        1,
        2,
        6,
        24,
        120,
        720,
        5040,
        40320,
        362880,
        3628800,
        39916800,
        479001600,
        6227020800,
        87178291200,
        1.307674368e12,
        2.0922789888e13,
        3.55687428096e14,
        6.402373705728e15,
        1.21645100408832e17,
        2.43290200817664e18,
        5.109094217170944e19,
        1.12400072777760768e21,
        2.585201673888497664e22,
        6.2044840173323943936e23,
    ];

    /* Local variables */
    //const int lim = nb;
    const b2 = new Array(nb).fill(0);

    //START ints
    let i_nend;
    let nbmx;
    let i;
    let j;
    let l;
    let i_m;
    let n;
    let nstart;
    //END ints

    //START double
    let capp;
    let capq;
    let pold;
    let vcos;
    let test;
    let vsin;

    let p;
    let s;
    let t;
    let z;
    let alpem;
    let halfx;
    let aa;
    let bb;
    let cc;
    let psave;
    let plast;
    let tover;
    let t1;
    let alp2em;
    let em;
    let en;
    let xc;
    let xk;
    let xm;
    let psavel;
    let gnu;
    let xin;
    let sum;
    //END DOUBLE

    //int
    let ncalc;
    let gotoL190 = false;

    /* Parameter adjustment */
    //--b;

    const nu = alpha;
    const twonu = nu + nu;

    /*-------------------------------------------------------------------
      Check for out of range arguments.
      -------------------------------------------------------------------*/

    if (!(nb > 0 && x >= 0 && 0 <= nu && nu < 1)) {
        /* Error return -- X, NB, or ALPHA is out of range : */
        b2[0] = 0;
        ncalc = min(nb, 0) - 1;
        return { x, nb, ncalc };
    }

    ncalc = nb;
    if (x > xlrg_BESS_IJ) {
        ML_ERROR(ME.ME_RANGE, 'J_bessel', printer);
        /* indeed, the limit is 0,
         * but the cutoff happens too early */
        return { x: 0, nb, ncalc };
    }
    const intxj = trunc(x);

    /*===================================================================
      Branch into  3 cases :
      1) use 2-term ascending series for small X
      2) use asymptotic form for large X when NB is not too large
      3) use recursion otherwise
      ===================================================================*/

    if (x < 1 / 10000) {
        printer('x < 0.0001 , x=%d, nb=%d', x, nb);
        /* ---------------------------------------------------------------
           Two-term ascending series for small X.
           --------------------------------------------------------------- */
        alpem = 1 + nu;

        halfx = x > enmten_BESS ? 0.5 * x : 0;
        aa = nu !== 0 ? pow(halfx, nu) / (nu * Rf_gamma_cody(nu)) : 1;
        bb = x + 1 > 1 ? -halfx * halfx : 0;
        b2[0] = aa + (aa * bb) / alpem;
        if (x !== 0 && b2[0] === 0) ncalc = 0;

        if (nb !== 1) {
            if (x <= 0) {
                for (n = 2; n <= nb; ++n) b2[n - 1] = 0;
            } else {
                /* ----------------------------------------------
                   Calculate higher order functions.
                   ---------------------------------------------- */
                if (bb === 0) tover = (enmten_BESS + enmten_BESS) / x;
                else tover = enmten_BESS / bb;
                cc = halfx;
                for (n = 2; n <= nb; ++n) {
                    aa /= alpem;
                    alpem += 1;
                    aa *= cc;
                    if (aa <= tover * alpem) aa = 0;

                    b2[n - 1] = aa + (aa * bb) / alpem;
                    if (b2[n - 1] === 0 && ncalc > n) ncalc = n - 1;
                }
            }
        }
    } else if (x > 25 && nb <= intxj + 1) {
        printer('x > 25 and nb < int(x+1) :x=%d, nb=%d', x, nb);
        /* ------------------------------------------------------------
           Asymptotic series for X > 25 (and not too large nb)
           ------------------------------------------------------------ */
        xc = sqrt(pi2 / x);
        xin = 1 / (64 * x * x);
        if (x >= 130) i_m = 4;
        else if (x >= 35) i_m = 8;
        else i_m = 11;
        xm = 4 * i_m;
        /* ------------------------------------------------
           Argument reduction for SIN and COS routines.
           ------------------------------------------------ */
        t = trunc(x / (twopi1 + twopi2) + 0.5);
        z = x - t * twopi1 - t * twopi2 - (nu + 0.5) / pi2;
        vsin = sin(z);
        vcos = cos(z);
        gnu = twonu;
        for (i = 1; i <= 2; ++i) {
            s = (xm - 1 - gnu) * (xm - 1 + gnu) * xin * 0.5;
            t = (gnu - (xm - 3)) * (gnu + (xm - 3));
            t1 = (gnu - (xm + 1)) * (gnu + (xm + 1));
            let k = i_m + i_m;
            capp = (s * t) / fact[k];
            capq = (s * t1) / fact[k + 1];
            xk = xm;
            for (; k >= 4; k -= 2) {
                /* k + 2(j-2) == 2m */
                xk -= 4;
                s = (xk - 1 - gnu) * (xk - 1 + gnu);
                t1 = t;
                t = (gnu - (xk - 3)) * (gnu + (xk - 3));
                capp = (capp + 1 / fact[k - 2]) * s * t * xin;
                capq = (capq + 1 / fact[k - 1]) * s * t1 * xin;
            }
            capp += 1;
            capq = (capq + 1) * (gnu * gnu - 1) * (0.125 / x);
            b2[i - 1] = xc * (capp * vcos - capq * vsin);
            if (nb === 1) {
                //return (BesselRC) { 0, nb, ncalc };
                return { x: b2[nb - 1], nb, ncalc };
            }

            /* vsin <--> vcos */ t = vsin;
            vsin = -vcos;
            vcos = t;
            gnu += 2;
        }
        /* -----------------------------------------------
           If  NB > 2, compute J(X,ORDER+I)	for I = 2, NB-1
           ----------------------------------------------- */
        if (nb > 2)
            for (gnu = twonu + 2, j = 3; j <= nb; j++, gnu += 2) b2[j - 1] = (gnu * b2[j - 1 - 1]) / x - b2[j - 2 - 1];
    } else {
        printer('rest: x=%d, nb=%d\t', x, nb);
        /* rtnsig_BESS <= x && ( x <= 25 || intx+1 < *nb ) :
           --------------------------------------------------------
           Use recurrence to generate results.
           First initialize the calculation of P*S.
           -------------------------------------------------------- */
        nbmx = nb - intxj;
        n = intxj + 1;
        en = n + n + twonu;
        plast = 1;
        p = en / x;
        /* ---------------------------------------------------
           Calculate general significance test.
           --------------------------------------------------- */
        test = ensig_BESS + ensig_BESS;
        if (nbmx >= 3) {
            /* ------------------------------------------------------------
               Calculate P*S until N = NB-1.  Check for possible overflow.
               ---------------------------------------------------------- */
            tover = enten_BESS / ensig_BESS;
            nstart = intxj + 2;
            i_nend = nb - 1;
            en = nstart + nstart - 2 + twonu;
            for (let k = nstart; k <= i_nend; ++k) {
                n = k;
                en += 2;
                pold = plast;
                plast = p;
                p = (en * plast) / x - pold;
                if (p > tover) {
                    /* -------------------------------------------
                       To avoid overflow, divide P*S by TOVER.
                       Calculate P*S until ABS(P) > 1.
                       -------------------------------------------*/
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
                        p = (en * plast) / x - pold;
                    } while (p <= 1);

                    bb = en / x;
                    /* -----------------------------------------------
                       Calculate backward test and find NCALC,
                       the highest N such that the test is passed.
                       ----------------------------------------------- */
                    test = pold * plast * (0.5 - 0.5 / (bb * bb));
                    test /= ensig_BESS;
                    p = plast * tover;
                    --n;
                    en -= 2;
                    i_nend = min(nb, n);
                    for (l = nstart; l <= i_nend; ++l) {
                        pold = psavel;
                        psavel = psave;
                        psave = (en * psavel) / x - pold;
                        if (psave * psavel > test) {
                            ncalc = l - 1;
                            break;
                        }
                        ncalc = l;
                    }
                    gotoL190 = true;
                    break;
                } //if
            } //for
            n = i_nend;
            en = n + n + twonu;
            /* -----------------------------------------------------
               Calculate special significance test for NBMX > 2.
               -----------------------------------------------------*/
            test = max(test, sqrt(plast * ensig_BESS) * sqrt(p + p));
        }
        /* ------------------------------------------------
           Calculate P*S until significance test passes. */
        if (!gotoL190) {
            do {
                ++n;
                en += 2;
                pold = plast;
                plast = p;
                p = (en * plast) / x - pold;
            } while (p < test);
        }
        /*---------------------------------------------------------------
        Initialize the backward recursion and the normalization sum.
        --------------------------------------------------------------- */
        ++n;
        en += 2;
        bb = 0;
        aa = 1 / p;
        em = i_m = n >> 1; //integer devide by 2 with sign preservation
        i_m = (n << 1) - (i_m << 2); /* = 2 n - 4 (n/2)
               = 0 for even, 2 for odd n */
        if (i_m === 0) sum = 0;
        else {
            alpem = em - 1 + nu;
            alp2em = em + em + nu;
            sum = (aa * alpem * alp2em) / em;
        }
        i_nend = n - nb;
        /* if (nend > 0) */
        /* --------------------------------------------------------
           Recur backward via difference equation, calculating
           (but not storing) b[N], until N = NB.
           -------------------------------------------------------- */
        for (l = 1; l <= i_nend; ++l) {
            --n;
            en -= 2;
            cc = bb;
            bb = aa;
            aa = (en * bb) / x - cc;
            i_m = i_m ? 0 : 2; /* m = 2 - m failed on gcc4-20041019 */
            if (i_m !== 0) {
                em -= 1;
                alp2em = em + em + nu;
                if (n === 1) break;

                alpem = em - 1 + nu;
                if (alpem === 0) alpem = 1;
                sum = ((sum + aa * alp2em) * alpem) / em;
            }
        }
        /*--------------------------------------------------
          Store b[NB].
          --------------------------------------------------*/
        b2[n - 1] = aa;
        //one loop to get rid of "gotos"
        let gotoL240 = false;
        let gotoL250 = false;
        for (let cnt = 1; cnt > 0; cnt--) {
            if (i_nend >= 0) {
                if (nb <= 1) {
                    if (nu + 1 === 1) alp2em = 1;
                    else alp2em = nu;
                    sum += b2[0] * alp2em;
                    gotoL250 = true;
                    break;
                } else {
                    /*-- nb >= 2 : ---------------------------
            Calculate and store b[NB-1].
            ----------------------------------------*/
                    --n;
                    en -= 2;
                    b2[n - 1] = (en * aa) / x - bb;
                    if (n === 1) {
                        gotoL240 = true;
                        break;
                    }

                    i_m = i_m ? 0 : 2; /* m = 2 - m failed on gcc4-20041019 */
                    if (i_m !== 0) {
                        em -= 1;
                        alp2em = em + em + nu;
                        alpem = em - 1 + nu;
                        if (alpem === 0) alpem = 1;
                        sum = ((sum + b2[n - 1] * alp2em) * alpem) / em;
                    } //if
                } //if else
            } // if
        } //while the break

        /* if (n - 2 != 0) */
        /* --------------------------------------------------------
           Calculate via difference equation and store b[N],
           until N = 2.
           -------------------------------------------------------- */
        if (gotoL250 === false && gotoL240 === false) {
            for (n = n - 1; n >= 2; n--) {
                en -= 2;
                b2[n - 1] = (en * b2[n + 1 - 1]) / x - b2[n + 2 - 1];
                i_m = i_m ? 0 : 2; /* m = 2 - m failed on gcc4-20041019 */
                if (i_m !== 0) {
                    em -= 1;
                    alp2em = em + em + nu;
                    alpem = em - 1 + nu;
                    if (alpem === 0) alpem = 1;
                    sum = ((sum + b2[n - 1] * alp2em) * alpem) / em;
                }
            }
            /* ---------------------------------------
               Calculate b[1].
               -----------------------------------------*/
            b2[0] = (2 * (nu + 1) * b2[1]) / x - b2[2];
        }
        //L240:
        if (gotoL250 === false) {
            em -= 1;
            alp2em = em + em + nu;
            if (alp2em === 0) alp2em = 1;
            sum += b2[0] * alp2em;
        }
        //L250:
        /* ---------------------------------------------------
           Normalize.  Divide all b[N] by sum.
           ---------------------------------------------------*/
        /*	    if (nu + 1. != 1.) poor test */
        if (abs(nu) > 1e-15) sum *= Rf_gamma_cody(nu) * pow(0.5 * x, -nu);

        aa = enmten_BESS;
        if (sum > 1) aa *= sum;
        for (n = 1; n <= nb; ++n) {
            if (abs(b2[n - 1]) < aa) b2[n - 1] = 0;
            else b2[n - 1] /= sum;
        } //for
    } //if
    return { x: b2[nb - 1], nb, ncalc };
}
