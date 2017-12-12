/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  feb 10, 2017
 * 
 *  ORIGINAL AUTHOR:
 *  Martin Maechler, ETH Zurich
 * 
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998-2015 Ross Ihaka and the R Core team.
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

/*  DESCRIPTION --> see below */


/* From http://www.netlib.org/specfun/rjbesl	Fortran translated by f2c,...
 *	------------------------------=#----	Martin Maechler, ETH Zurich
 * Additional code for nu == alpha < 0  MM
 */

import {
    fmax2,
    enten_BESS,
    ensig_BESS,
    enmten_BESS,
    rtnsig_BESS,
    sqrt,
    fabs,
    ISNAN,
    ML_ERROR,
    ME,
    ML_NAN,
    xlrg_BESS_IJ,
    trunc,
    floor,
    MATHLIB_WARNING,
    MATHLIB_WARNING4,
    MATHLIB_WARNING2,
    min0,
    sin,
    pow,
    cos
} from '~common';

import {
    cospi,
    sinpi,
} from '~trigonometry';

import { bessel_y, bessel_y_ex } from './bessel_y';

import { Rf_gamma_cody } from '../gamma/gamma_cody';

export interface JBesselProperties {
    x: number;
    alpha: number;
    nb: number;
    b: number[];
    ncalc: number;
}

// unused now from R
export function bessel_j(x: number, alpha: number): number {

    let nb: number;
    let ncalc: number;
    let na: number;
    let bj: number[];
    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(alpha)) return x + alpha;
    if (x < 0) {
        ML_ERROR(ME.ME_RANGE, 'bessel_j');
        return ML_NAN;
    }
    na = floor(alpha);
    if (alpha < 0) {
        /* Using Abramowitz & Stegun  9.1.2
         * this may not be quite optimal (CPU and accuracy wise) */
        return (((alpha - na === 0.5) ? 0 : bessel_j(x, -alpha) * cospi(alpha)) +
            ((alpha === na) ? 0 : bessel_y(x, -alpha) * sinpi(alpha)));
    }
    else if (alpha > 1e7) {
        MATHLIB_WARNING('besselJ(x, nu): nu=%g too large for bessel_j() algorithm',
            alpha);
        return ML_NAN;
    }
    nb = 1 + trunc(na); /* nb-1 <= alpha < nb */
    alpha -= (nb - 1); // ==> alpha' in [0, 1)
    bj = new Array<number>(nb);
    bj.fill(0, 0);
    ncalc = 0;
    let input: JBesselProperties = { x, alpha, nb, b: bj, ncalc };
    J_bessel(input);
    ({ x, alpha, nb, ncalc } = input);
    if (ncalc !== nb) {/* error input */
        if (ncalc < 0)
            MATHLIB_WARNING4('bessel_j(%g): ncalc (=%d) != nb (=%d); alpha=%g. Arg. out of range?n',
                x, ncalc, nb, alpha);
        else
            MATHLIB_WARNING2('bessel_j(%g,nu=%g): precision lost in result\n',
                x, alpha + nb - 1);
    }
    x = bj[nb - 1];
    return x;
}

/* Called from R: modified version of bessel_j(), accepting a work array
 * instead of allocating one. */
export function bessel_j_ex(x: number, alpha: number, bj: number[]): number {

    let nb: number;
    let ncalc: number;
    let na: number;

    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(alpha)) return x + alpha;
    if (x < 0) {
        ML_ERROR(ME.ME_RANGE, 'bessel_j');
        return ML_NAN;
    }
    na = floor(alpha);
    if (alpha < 0) {
        /* Using Abramowitz & Stegun  9.1.2
         * this may not be quite optimal (CPU and accuracy wise) */
        return (((alpha - na === 0.5) ? 0 : bessel_j_ex(x, -alpha, bj) * cospi(alpha)) +
            ((alpha === na) ? 0 : bessel_y_ex(x, -alpha, bj) * sinpi(alpha)));
    }
    else if (alpha > 1e7) {
        MATHLIB_WARNING('besselJ(x, nu): nu=%g too large for bessel_j() algorithm', alpha);
        return ML_NAN;
    }
    nb = 1 + trunc(na); /* nb-1 <= alpha < nb */
    alpha -= (nb - 1); // ==> alpha' in [0, 1)
    ncalc = 0;
    let input: JBesselProperties = { x, alpha, nb, b: bj, ncalc };
    J_bessel(input);
    ({ x, alpha, nb, ncalc } = input);

    if (ncalc !== nb) {/* error input */
        if (ncalc < 0)
            MATHLIB_WARNING4('bessel_j(%g): ncalc (=%d) != nb (=%d); alpha=%g. Arg. out of range?n',
                x, ncalc, nb, alpha);
        else
            MATHLIB_WARNING2('bessel_j(%g,nu=%g): precision lost in result\n', x, alpha + nb - 1);
    }
    x = bj[nb - 1];
    return x;
}

function J_bessel(input: JBesselProperties): void {

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
    const pi2 = .636619772367581343075535;
    const twopi1 = 6.28125;
    const twopi2 = .001935307179586476925286767;

    /*---------------------------------------------------------------------
     *  Factorial(N)
     *--------------------------------------------------------------------- */
    const fact = [
        1., 1., 2., 6., 24., 120., 720., 5040., 40320.,
        362880., 3628800., 39916800., 479001600., 6227020800., 87178291200.,
        1.307674368e12, 2.0922789888e13, 3.55687428096e14, 6.402373705728e15,
        1.21645100408832e17, 2.43290200817664e18, 5.109094217170944e19,
        1.12400072777760768e21, 2.585201673888497664e22,
        6.2044840173323943936e23];

    /* Local variables */
    let nend: number;
    let intx: number;
    let nbmx: number;
    let i: number;
    let j: number;
    let k: number;
    let l: number;
    let m: number;
    let n: number;
    let nstart: number;

    let nu: number;
    let twonu: number;
    let capp: number;
    let capq: number;
    let pold: number;
    let vcos: number;
    let test: number;
    let vsin: number;
    let p: number;
    let s: number;
    let t: number;
    let z: number;
    let alpem: number;
    let halfx: number;
    let aa: number;
    let bb: number;
    let cc: number;
    let psave: number;
    let plast: number;
    // double
    let tover: number;
    let t1: number;
    let alp2em: number;
    let em: number;
    let en: number;
    let xc: number;
    let xk: number;
    let xm: number;
    let psavel: number;
    let gnu: number;
    let xin: number;
    let sum: number;

    let gotoL190: boolean = false;
    let gotoL250: boolean = false;
    let gotoL240: boolean = false;

    /* Parameter adjustment */
    // pointer adjusted??
    //--b;

    nu = input.alpha;
    twonu = nu + nu;

    /*-------------------------------------------------------------------
      Check for out of range arguments.
      -------------------------------------------------------------------*/
    if (input.nb > 0 && input.x >= 0. && 0. <= nu && nu < 1.) {

        input.ncalc = input.nb;
        if (input.x > xlrg_BESS_IJ) {
            ML_ERROR(ME.ME_RANGE, 'J_bessel');
            /* indeed, the limit is 0,
             * but the cutoff happens too early */
            for (i = 1; i <= input.nb; i++)
                input.b[i - 1] = 0.; /*was ML_POSINF (really nonsense) */
            return;
        }
        intx = trunc(input.x);
        /* Initialize result array to zero. */
        for (i = 1; i <= input.nb; ++i)
            input.b[i - 1] = 0.;

        /*===================================================================
          Branch into  3 cases :
          1) use 2-term ascending series for small X
          2) use asymptotic form for large X when NB is not too large
          3) use recursion otherwise
          ===================================================================*/

        if (input.x < rtnsig_BESS) {
            /* ---------------------------------------------------------------
               Two-term ascending series for small X.
               --------------------------------------------------------------- */
            alpem = 1. + nu;

            halfx = (input.x > enmten_BESS) ? .5 * input.x : 0.;
            aa = (nu !== 0.) ? pow(halfx, nu) / (nu * Rf_gamma_cody(nu)) : 1.;
            bb = (input.x + 1. > 1.) ? -halfx * halfx : 0.;
            input.b[0] = aa + aa * bb / alpem;
            if (input.x !== 0. && input.b[0] === 0.)
                input.ncalc = 0;

            if (input.nb !== 1) {
                if (input.x <= 0.) {
                    for (n = 2; n <= input.nb; ++n)
                        input.b[n - 1] = 0.;
                }
                else {
                    /* ----------------------------------------------
                       Calculate higher order functions.
                       ---------------------------------------------- */
                    if (bb === 0.)
                        tover = (enmten_BESS + enmten_BESS) / input.x;
                    else
                        tover = enmten_BESS / bb;
                    cc = halfx;
                    for (n = 2; n <= input.nb; ++n) {
                        aa /= alpem;
                        alpem += 1.;
                        aa *= cc;
                        if (aa <= tover * alpem)
                            aa = 0.;

                        input.b[n - 1] = aa + aa * bb / alpem;
                        if (input.b[n - 1] === 0. && input.ncalc > n)
                            input.ncalc = n - 1;
                    }
                }
            }
        } else if (input.x > 25. && input.nb <= intx + 1) {
            /* ------------------------------------------------------------
               Asymptotic series for X > 25 (and not too large nb)
               ------------------------------------------------------------ */
            xc = sqrt(pi2 / input.x);
            xin = 1 / (64 * input.x * input.x);
            if (input.x >= 130.) m = 4;
            else if (input.x >= 35.) m = 8;
            else m = 11;
            xm = 4. * m;
            /* ------------------------------------------------
               Argument reduction for SIN and COS routines.
               ------------------------------------------------ */
            t = trunc(input.x / (twopi1 + twopi2) + .5);
            z = (input.x - t * twopi1) - t * twopi2 - (nu + .5) / pi2;
            vsin = sin(z);
            vcos = cos(z);
            gnu = twonu;
            for (i = 1; i <= 2; ++i) {
                s = (xm - 1. - gnu) * (xm - 1. + gnu) * xin * .5;
                t = (gnu - (xm - 3.)) * (gnu + (xm - 3.));
                t1 = (gnu - (xm + 1.)) * (gnu + (xm + 1.));
                k = m + m;
                capp = s * t / fact[k];
                capq = s * t1 / fact[k + 1];
                xk = xm;
                for (; k >= 4; k -= 2) {/* k + 2(j-2) == 2m */
                    xk -= 4.;
                    s = (xk - 1. - gnu) * (xk - 1. + gnu);
                    t1 = t;
                    t = (gnu - (xk - 3.)) * (gnu + (xk - 3.));
                    capp = (capp + 1. / fact[k - 2]) * s * t * xin;
                    capq = (capq + 1. / fact[k - 1]) * s * t1 * xin;

                }
                capp += 1.;
                capq = (capq + 1.) * (gnu * gnu - 1.) * (.125 / input.x);
                input.b[i - 1] = xc * (capp * vcos - capq * vsin);
                if (input.nb === 1)
                    return;

        /* vsin <--> vcos */ t = vsin; vsin = -vcos; vcos = t;
                gnu += 2.;
            }
            /* -----------------------------------------------
               If  NB > 2, compute J(X,ORDER+I)	for I = 2, NB-1
               ----------------------------------------------- */
            if (input.nb > 2)
                for (gnu = twonu + 2., j = 3; j <= input.nb; j++ , gnu += 2.)
                    input.b[j - 1] = gnu * input.b[j - 1 - 1] / input.x - input.b[j - 2 - 1];
        }
        else {
            /* rtnsig_BESS <= x && ( x <= 25 || intx+1 < *nb ) :
               --------------------------------------------------------
               Use recurrence to generate results.
               First initialize the calculation of P*S.
               -------------------------------------------------------- */
            nbmx = input.nb - intx;
            n = intx + 1;
            en = (n + n) + twonu;
            plast = 1.;
            p = en / input.x;
            /* ---------------------------------------------------
               Calculate general significance test.
               --------------------------------------------------- */
            test = ensig_BESS + ensig_BESS;
            if (nbmx >= 3) {
                /* ------------------------------------------------------------
                   Calculate P*S until N = NB-1.  Check for possible overflow.
                   ---------------------------------------------------------- */
                tover = enten_BESS / ensig_BESS;
                nstart = intx + 2;
                nend = input.nb - 1;
                en = (nstart + nstart) - 2. + twonu;
                for (k = nstart; k <= nend; ++k) {
                    n = k;
                    en += 2.;
                    pold = plast;
                    plast = p;
                    p = en * plast / input.x - pold;
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
                            en += 2.;
                            pold = plast;
                            plast = p;
                            p = en * plast / input.x - pold;
                        } while (p <= 1.);

                        bb = en / input.x;
                        /* -----------------------------------------------
                           Calculate backward test and find NCALC,
                           the highest N such that the test is passed.
                           ----------------------------------------------- */
                        test = pold * plast * (.5 - .5 / (bb * bb));
                        test /= ensig_BESS;
                        p = plast * tover;
                        --n;
                        en -= 2.;
                        nend = min0(input.nb, n);
                        gotoL190 = false;
                        for (l = nstart; l <= nend; ++l) {
                            pold = psavel;
                            psavel = psave;
                            psave = en * psavel / input.x - pold;
                            if (psave * psavel > test) {
                                input.ncalc = l - 1;
                                gotoL190 = true;
                                break; //goto L190;
                            }
                        }
                        if (!gotoL190) {
                            input.ncalc = nend;
                        }
                        if (gotoL190) {
                            break;
                        }
                        //goto L190;
                    }
                }
                n = nend;
                en = (n + n) + twonu;
                /* -----------------------------------------------------
                   Calculate special significance test for NBMX > 2.
                   -----------------------------------------------------*/
                test = fmax2(test, sqrt(plast * ensig_BESS) * sqrt(p + p));
            }
            /* ------------------------------------------------
               Calculate P*S until significance test passes. */
            if (!gotoL190) {
                do {
                    ++n;
                    en += 2.;
                    pold = plast;
                    plast = p;
                    p = en * plast / input.x - pold;
                } while (p < test);
            }
            //L190:
            /*---------------------------------------------------------------
              Initialize the backward recursion and the normalization sum.
              --------------------------------------------------------------- */
            ++n;
            en += 2.;
            bb = 0.;
            aa = 1. / p;
            m = n / 2;
            em = m;
            m = (n << 1) - (m << 2);  /* = 2 n - 4 (n/2)
                       = 0 for even, 2 for odd n */
            if (m === 0)
                sum = 0.;
            else {
                alpem = em - 1. + nu;
                alp2em = em + em + nu;
                sum = aa * alpem * alp2em / em;
            }
            nend = n - input.nb;
            /* if (nend > 0) */
            /* --------------------------------------------------------
               Recur backward via difference equation, calculating
               (but not storing) b[N], until N = NB.
               -------------------------------------------------------- */
            for (l = 1; l <= nend; ++l) {
                --n;
                en -= 2.;
                cc = bb;
                bb = aa;
                aa = en * bb / input.x - cc;
                m = m ? 0 : 2; /* m = 2 - m failed on gcc4-20041019 */
                if (m !== 0) {
                    em -= 1.;
                    alp2em = em + em + nu;
                    if (n === 1)
                        break;

                    alpem = em - 1. + nu;
                    if (alpem === 0.)
                        alpem = 1.;
                    sum = (sum + aa * alp2em) * alpem / em;
                }
            }
            /*--------------------------------------------------
              Store b[NB].
              --------------------------------------------------*/
            gotoL250 = false;
            gotoL240 = false;
            input.b[n - 1] = aa;
            if (nend >= 0) {
                if (input.nb <= 1) {
                    if (nu + 1. === 1.)
                        alp2em = 1.;
                    else
                        alp2em = nu;
                    sum += input.b[1 - 1] * alp2em;
                    //goto L250;
                    gotoL250 = true;
                }
                else {/*-- nb >= 2 : ---------------------------
            Calculate and store b[NB-1].
            ----------------------------------------*/
                    --n;
                    en -= 2.;
                    input.b[n - 1] = en * aa / input.x - bb;
                    if (n === 1)
                        gotoL240 = true;

                    if (!gotoL240) {
                        m = m ? 0 : 2; /* m = 2 - m failed on gcc4-20041019 */
                        if (m !== 0) {
                            em -= 1.;
                            alp2em = em + em + nu;
                            alpem = em - 1. + nu;
                            if (alpem === 0.)
                                alpem = 1.;
                            sum = (sum + input.b[n - 1] * alp2em) * alpem / em;
                        }
                    }
                }
            }

            /* if (n - 2 != 0) */
            /* --------------------------------------------------------
               Calculate via difference equation and store b[N],
               until N = 2.
               -------------------------------------------------------- */
            //skip if L240 or L250
            if (!gotoL240 && !gotoL250) {
                for (n = n - 1; n >= 2; n--) {
                    en -= 2.;
                    input.b[n - 1] = en * input.b[n + 1 - 1] / input.x - input.b[n + 2 - 1];
                    m = m ? 0 : 2; /* m = 2 - m failed on gcc4-20041019 */
                    if (m !== 0) {
                        em -= 1.;
                        alp2em = em + em + nu;
                        alpem = em - 1. + nu;
                        if (alpem === 0.)
                            alpem = 1.;
                        sum = (sum + input.b[n] * alp2em) * alpem / em;
                    }
                }

                /* ---------------------------------------
                   Calculate b[1].
                   -----------------------------------------*/
                input.b[1 - 1] = 2. * (nu + 1.) * input.b[2 - 1] / input.x - input.b[3 - 1];
            }
            if (!gotoL250) {
                //L240:
                em -= 1.;
                alp2em = em + em + nu;
                if (alp2em === 0.)
                    alp2em = 1.;
                sum += input.b[1 - 1] * alp2em;
            }
            // L250:
            /* ---------------------------------------------------
               Normalize.  Divide all b[N] by sum.
               ---------------------------------------------------*/
            /*	    if (nu + 1. != 1.) poor test */
            if (fabs(nu) > 1e-15)
                sum *= (Rf_gamma_cody(nu) * pow(.5 * input.x, -nu));

            aa = enmten_BESS;
            if (sum > 1.)
                aa *= sum;
            for (n = 1; n <= input.nb; ++n) {
                if (fabs(input.b[n]) < aa)
                    input.b[n - 1] = 0.;
                else
                    input.b[n - 1] /= sum;
            }
        }

    }
    else {
        /* Error return -- X, NB, or ALPHA is out of range : */
        input.b[1 - 1] = 0.;
        input.ncalc = min0(input.nb, 0) - 1;
    }
}
