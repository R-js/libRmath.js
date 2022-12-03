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
import { debug } from '@mangos/debug';

import { ME, ML_ERROR2 } from '@common/logger';
import { sqxmin_BESS_K, xmax_BESS_K } from '../bessel-constants';
import { IBesselRC } from '../IBesselRC';

const M_SQRT_2dPI = 0.797884560802865355879892119869;
import {
    min,
    log,
    exp,
    abs,
    sinh,
    trunc,
    sqrt,
    max,
    DBL_MAX,
    DBL_EPSILON,
    DBL_MIN
} from '@lib/r-func';

const printer = debug('K_bessel');

export function K_bessel(x: number, alpha: number, nb: number, ize: number): IBesselRC {
    /*-------------------------------------------------------------------
  
      This routine calculates modified Bessel functions
      of the third kind, K_(N+ALPHA) (X), for non-negative
      argument X, and non-negative order N+ALPHA, with or without
      exponential scaling.
  
      Explanation of variables in the calling sequence
  
     X     - Non-negative argument for which
       K's or exponentially scaled K's (K*EXP(X))
       are to be calculated.	If K's are to be calculated,
       X must not be greater than XMAX_BESS_K.
     ALPHA - Fractional part of order for which
       K's or exponentially scaled K's (K*EXP(X)) are
       to be calculated.  0 <= ALPHA < 1.0.
     NB    - Number of functions to be calculated, NB > 0.
       The first function calculated is of order ALPHA, and the
       last is of order (NB - 1 + ALPHA).
     IZE   - Type.	IZE = 1 if unscaled K's are to be calculated,
          = 2 if exponentially scaled K's are to be calculated.
     BK    - Output vector of length NB.	If the
       routine terminates normally (NCALC=NB), the vector BK
       contains the functions K(ALPHA,X), ... , K(NB-1+ALPHA,X),
       or the corresponding exponentially scaled functions.
       If (0 < NCALC < NB), BK(I) contains correct function
       values for I <= NCALC, and contains the ratios
       K(ALPHA+I-1,X)/K(ALPHA+I-2,X) for the rest of the array.
     NCALC - Output variable indicating possible errors.
       Before using the vector BK, the user should check that
       NCALC=NB, i.e., all orders have been calculated to
       the desired accuracy.	See error returns below.
  
  
     *******************************************************************
  
     Error returns
  
      In case of an error, NCALC != NB, and not all K's are
      calculated to the desired accuracy.
  
      NCALC < -1:  An argument is out of range. For example,
      NB <= 0, IZE is not 1 or 2, or IZE=1 and ABS(X) >= XMAX_BESS_K.
      In this case, the B-vector is not calculated,
      and NCALC is set to MIN0(NB,0)-2	 so that NCALC != NB.
      NCALC = -1:  Either  K(ALPHA,X) >= XINF  or
      K(ALPHA+NB-1,X)/K(ALPHA+NB-2,X) >= XINF.	 In this case,
      the B-vector is not calculated.	Note that again
      NCALC != NB.
  
      0 < NCALC < NB: Not all requested function values could
      be calculated accurately.  BK(I) contains correct function
      values for I <= NCALC, and contains the ratios
      K(ALPHA+I-1,X)/K(ALPHA+I-2,X) for the rest of the array.
  
  
     Intrinsic functions required are:
  
       ABS, AINT, EXP, INT, LOG, MAX, MIN, SINH, SQRT
  
  
     Acknowledgement
  
      This program is based on a program written by J. B. Campbell
      (2) that computes values of the Bessel functions K of float
      argument and float order.  Modifications include the addition
      of non-scaled functions, parameterization of machine
      dependencies, and the use of more accurate approximations
      for SINH and SIN.
  
     References: "On Temme's Algorithm for the Modified Bessel
          Functions of the Third Kind," Campbell, J. B.,
          TOMS 6(4), Dec. 1980, pp. 581-586.
  
         "A FORTRAN IV Subroutine for the Modified Bessel
          Functions of the Third Kind of Real Order and Real
          Argument," Campbell, J. B., Report NRC/ERB-925,
          National Research Council, Canada.
  
      Latest modification: May 30, 1989
  
      Modified by: W. J. Cody and L. Stoltz
           Applied Mathematics Division
           Argonne National Laboratory
           Argonne, IL  60439
  
     -------------------------------------------------------------------
    */
    /*---------------------------------------------------------------------
     * Mathematical constants
     *	A = LOG(2) - Euler's constant
     *	D = SQRT(2/PI)
     ---------------------------------------------------------------------*/
    const a = 0.11593151565841244881;

    /*---------------------------------------------------------------------
      P, Q - Approximation for LOG(GAMMA(1+ALPHA))/ALPHA + Euler's constant
      Coefficients converted from hex to decimal and modified
      by W. J. Cody, 2/26/82 */
    const p = [
        0.805629875690432845,
        20.4045500205365151,
        157.705605106676174,
        536.671116469207504,
        900.382759291288778,
        730.923886650660393,
        229.299301509425145,
        0.822467033424113231,
    ];
    const q = [
        29.4601986247850434,
        277.577868510221208,
        1206.70325591027438,
        2762.91444159791519,
        3443.74050506564618,
        2210.63190113378647,
        572.267338359892221,
    ];
    /* R, S - Approximation for (1-ALPHA*PI/SIN(ALPHA*PI))/(2.D0*ALPHA) */
    const r = [
        -0.48672575865218401848,
        13.079485869097804016,
        -101.96490580880537526,
        347.65409106507813131,
        3.495898124521934782e-4,
    ];

    const s = [-25.579105509976461286, 212.57260432226544008, -610.69018684944109624, 422.69668805777760407];
    /* T    - Approximation for SINH(Y)/Y */
    const t = [
        1.6125990452916363814e-10,
        2.5051878502858255354e-8,
        2.7557319615147964774e-6,
        1.9841269840928373686e-4,
        0.0083333333333334751799,
        0.16666666666666666446,
    ];
    /*---------------------------------------------------------------------*/
    const estm = [52.0583, 5.7607, 2.7782, 14.4303, 185.3004, 9.3715];
    const estf = [41.8341, 7.1075, 6.4306, 42.511, 1.35633, 84.5096, 20];

    /* Local variables */
    //int
    let iend;
    let i;
    let j;
    let k;
    let m;
    let ii;
    let mplus1;

    //double
    let x2by4;
    let twox;
    let c;
    let blpha;
    let ratio;
    let wminf;
    let d1;
    let d2;
    let d3;
    let f0;
    let f1;
    let f2;
    let p0;
    let q0;
    let t1;
    let t2;
    let twonu;
    let dm;
    let bk1;
    let bk2;
    let nu;

    const bk = new Array<number>(nb).fill(0);

    ii = 0; /* -Wall */

    const ex = x;
    nu = alpha;
    let ncalc = min(nb, 0) - 2;

    if (nb > 0 && 0 <= nu && nu < 1 && 1 <= ize && ize <= 2) {
        for (let cnt = 0; cnt < 1; cnt++) {
            if (ex <= 0 || (ize === 1 && ex > xmax_BESS_K)) {
                if (ex <= 0) {
                    if (ex < 0) ML_ERROR2(ME.ME_RANGE, 'K_bessel', printer);
                    // for (i = 0; i < nb; i++)
                    bk[0] = Infinity;
                } /* would only have underflow */
                //for (i = 0; i < nb; i++)
                else bk[0] = 0;
                ncalc = nb;
                return { x: bk[0], nb, ncalc };
            }
            k = 0;
            if (nu < sqxmin_BESS_K) {
                nu = 0;
            } else if (nu > 0.5) {
                k = 1;
                nu -= 1;
            }
            twonu = nu + nu;
            iend = nb + k - 1;
            c = nu * nu;
            d3 = -c;
            if (ex <= 1) {
                /* ------------------------------------------------------------
                   Calculation of P0 = GAMMA(1+ALPHA) * (2/X)**ALPHA
                      Q0 = GAMMA(1-ALPHA) * (X/2)**ALPHA
                   ------------------------------------------------------------ */
                d1 = 0;
                d2 = p[0];
                t1 = 1;
                t2 = q[0];
                for (i = 2; i <= 7; i += 2) {
                    d1 = c * d1 + p[i - 1];
                    d2 = c * d2 + p[i];
                    t1 = c * t1 + q[i - 1];
                    t2 = c * t2 + q[i];
                }
                d1 = nu * d1;
                t1 = nu * t1;
                f1 = log(ex);
                f0 = a + nu * (p[7] - (nu * (d1 + d2)) / (t1 + t2)) - f1;
                q0 = exp(-nu * (a - nu * (p[7] + (nu * (d1 - d2)) / (t1 - t2)) - f1));
                f1 = nu * f0;
                p0 = exp(f1);
                /* -----------------------------------------------------------
                   Calculation of F0 =
                   ----------------------------------------------------------- */
                d1 = r[4];
                t1 = 1;
                for (i = 0; i < 4; ++i) {
                    d1 = c * d1 + r[i];
                    t1 = c * t1 + s[i];
                }
                /* d2 := sinh(f1)/ nu = sinh(f1)/(f1/f0)
                 *	   = f0 * sinh(f1)/f1 */
                if (abs(f1) <= 0.5) {
                    f1 *= f1;
                    d2 = 0;
                    for (i = 0; i < 6; ++i) {
                        d2 = f1 * d2 + t[i];
                    }
                    d2 = f0 + f0 * f1 * d2;
                } else {
                    d2 = sinh(f1) / nu;
                }
                f0 = d2 - (nu * d1) / (t1 * p0);
                if (ex <= 1e-10) {
                    /* ---------------------------------------------------------
                       X <= 1.0E-10
                       Calculation of K(ALPHA,X) and X*K(ALPHA+1,X)/K(ALPHA,X)
                       --------------------------------------------------------- */
                    bk[0] = f0 + ex * f0;
                    if (ize === 1) {
                        bk[0] -= ex * bk[0];
                    }
                    ratio = p0 / f0;
                    c = ex * DBL_MAX;
                    if (k !== 0) {
                        /* ---------------------------------------------------
                           Calculation of K(ALPHA,X)
                           and  X*K(ALPHA+1,X)/K(ALPHA,X),	ALPHA >= 1/2
                           --------------------------------------------------- */
                        ncalc = -1;
                        if (bk[0] >= c / ratio) {
                            return { x: bk[nb - 1], nb, ncalc };
                        }
                        bk[0] = (ratio * bk[0]) / ex;
                        twonu += 2;
                        ratio = twonu;
                    }
                    ncalc = 1;
                    if (nb === 1) return { x: bk[nb - 1], nb, ncalc };

                    /* -----------------------------------------------------
                       Calculate  K(ALPHA+L,X)/K(ALPHA+L-1,X),
                       L = 1, 2, ... , NB-1
                       ----------------------------------------------------- */
                    ncalc = -1;
                    for (i = 1; i < nb; ++i) {
                        if (ratio >= c) return { x: bk[nb - 1], nb, ncalc };

                        bk[i] = ratio / ex;
                        twonu += 2;
                        ratio = twonu;
                    }
                    ncalc = 1;
                    break; //goto L240
                } else {
                    /* ------------------------------------------------------
                       10^-10 < X <= 1.0
                       ------------------------------------------------------ */
                    c = 1;
                    x2by4 = (ex * ex) / 4;
                    p0 = 0.5 * p0;
                    q0 = 0.5 * q0;
                    d1 = -1;
                    d2 = 0;
                    bk1 = 0;
                    bk2 = 0;
                    f1 = f0;
                    f2 = p0;
                    do {
                        d1 += 2;
                        d2 += 1;
                        d3 = d1 + d3;
                        c = (x2by4 * c) / d2;
                        f0 = (d2 * f0 + p0 + q0) / d3;
                        p0 /= d2 - nu;
                        q0 /= d2 + nu;
                        t1 = c * f0;
                        t2 = c * (p0 - d2 * f0);
                        bk1 += t1;
                        bk2 += t2;
                    } while (abs(t1 / (f1 + bk1)) > DBL_EPSILON || abs(t2 / (f2 + bk2)) > DBL_EPSILON);
                    bk1 = f1 + bk1;
                    bk2 = (2 * (f2 + bk2)) / ex;
                    if (ize === 2) {
                        d1 = exp(ex);
                        bk1 *= d1;
                        bk2 *= d1;
                    }
                    wminf = estf[0] * ex + estf[1];
                }
            } else if (DBL_EPSILON * ex > 1) {
                /* -------------------------------------------------
                   X > 1./EPS
                   ------------------------------------------------- */
                ncalc = nb;
                bk1 = 1 / (M_SQRT_2dPI * sqrt(ex));
                //for (i = 0; i < nb; ++i)
                //  bk[i] = bk1;
                return { x: bk1, nb, ncalc };
            } else {
                /* -------------------------------------------------------
                   X > 1.0
                   ------------------------------------------------------- */
                twox = ex + ex;
                blpha = 0;
                ratio = 0;
                if (ex <= 4) {
                    /* ----------------------------------------------------------
                       Calculation of K(ALPHA+1,X)/K(ALPHA,X),  1.0 <= X <= 4.0
                       ----------------------------------------------------------*/
                    d2 = trunc(estm[0] / ex + estm[1]);
                    m = trunc(d2);
                    d1 = d2 + d2;
                    d2 -= 0.5;
                    d2 *= d2;
                    for (i = 2; i <= m; ++i) {
                        d1 -= 2;
                        d2 -= d1;
                        ratio = (d3 + d2) / (twox + d1 - ratio);
                    }
                    /* -----------------------------------------------------------
                       Calculation of I(|ALPHA|,X) and I(|ALPHA|+1,X) by backward
                       recurrence and K(ALPHA,X) from the wronskian
                       -----------------------------------------------------------*/
                    d2 = trunc(estm[2] * ex + estm[3]);
                    m = trunc(d2);
                    c = abs(nu);
                    d3 = c + c;
                    d1 = d3 - 1;
                    f1 = DBL_MIN;
                    f0 = ((2 * (c + d2)) / ex + (0.5 * ex) / (c + d2 + 1)) * DBL_MIN;
                    for (i = 3; i <= m; ++i) {
                        d2 -= 1;
                        f2 = (d3 + d2 + d2) * f0;
                        blpha = (1 + d1 / d2) * (f2 + blpha);
                        f2 = f2 / ex + f1;
                        f1 = f0;
                        f0 = f2;
                    }
                    f1 = ((d3 + 2) * f0) / ex + f1;
                    d1 = 0;
                    t1 = 1;
                    for (i = 1; i <= 7; ++i) {
                        d1 = c * d1 + p[i - 1];
                        t1 = c * t1 + q[i - 1];
                    }
                    p0 = exp(c * (a + c * (p[7] - (c * d1) / t1) - log(ex))) / ex;
                    f2 = ((c + 0.5 - ratio) * f1) / ex;
                    bk1 = p0 + ((d3 * f0 - f2 + f0 + blpha) / (f2 + f1 + f0)) * p0;
                    if (ize === 1) {
                        bk1 *= exp(-ex);
                    }
                    wminf = estf[2] * ex + estf[3];
                } else {
                    /* ---------------------------------------------------------
                       Calculation of K(ALPHA,X) and K(ALPHA+1,X)/K(ALPHA,X), by
                       backward recurrence, for  X > 4.0
                       ----------------------------------------------------------*/
                    dm = trunc(estm[4] / ex + estm[5]);
                    m = trunc(dm);
                    d2 = dm - 0.5;
                    d2 *= d2;
                    d1 = dm + dm;
                    for (i = 2; i <= m; ++i) {
                        dm -= 1;
                        d1 -= 2;
                        d2 -= d1;
                        ratio = (d3 + d2) / (twox + d1 - ratio);
                        blpha = (ratio + ratio * blpha) / dm;
                    }
                    bk1 = 1 / ((M_SQRT_2dPI + M_SQRT_2dPI * blpha) * sqrt(ex));
                    if (ize === 1) bk1 *= exp(-ex);
                    wminf = estf[4] * (ex - abs(ex - estf[6])) + estf[5];
                }
                /* ---------------------------------------------------------
                   Calculation of K(ALPHA+1,X)
                   from K(ALPHA,X) and  K(ALPHA+1,X)/K(ALPHA,X)
                   --------------------------------------------------------- */
                bk2 = bk1 + (bk1 * (nu + 0.5 - ratio)) / ex;
            }
            /*--------------------------------------------------------------------
              Calculation of 'NCALC', K(ALPHA+I,X),	I  =  0, 1, ... , NCALC-1,
              &	  K(ALPHA+I,X)/K(ALPHA+I-1,X),	I = NCALC, NCALC+1, ... , NB-1
              -------------------------------------------------------------------*/
            ncalc = nb;
            bk[0] = bk1;
            if (iend === 0) return { x: bk[nb - 1], nb, ncalc };

            j = 1 - k;
            if (j >= 0) bk[j] = bk2;

            if (iend === 1) return { x: bk[nb - 1], nb, ncalc };

            m = min(trunc(wminf - nu), iend);
            for (i = 2; i <= m; ++i) {
                t1 = bk1;
                bk1 = bk2;
                twonu += 2;
                if (ex < 1) {
                    if (bk1 >= (DBL_MAX / twonu) * ex) break;
                } else {
                    if (bk1 / ex >= DBL_MAX / twonu) break;
                }
                bk2 = (twonu / ex) * bk1 + t1;
                ii = i;
                ++j;
                if (j >= 0) {
                    bk[j] = bk2;
                }
            }

            m = ii;
            if (m === iend) {
                return { x: bk[nb - 1], nb, ncalc };
            }
            ratio = bk2 / bk1;
            mplus1 = m + 1;
            ncalc = -1;
            for (i = mplus1; i <= iend; ++i) {
                twonu += 2;
                ratio = twonu / ex + 1 / ratio;
                ++j;
                if (j >= 1) {
                    bk[j] = ratio;
                } else {
                    if (bk2 >= DBL_MAX / ratio) return { x: bk[nb - 1], nb, ncalc };

                    bk2 *= ratio;
                }
            }
            ncalc = max(1, mplus1 - k);
            if (ncalc === 1) bk[0] = bk2;
            if (nb === 1) {
                return { x: bk2, nb, ncalc };
            }
        } //for loop "goto" guard
        //gotoL420:
        for (i = ncalc; i < nb; ++i) {
            /* i ==  ncalc */
            bk[i] *= bk[i - 1];
            ncalc++;
        }
    }
    return { x: bk[nb - 1], nb, ncalc };
}
