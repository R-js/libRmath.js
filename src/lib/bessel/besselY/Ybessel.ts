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
import { cospi } from '../../trigonometry/cospi';
import { sinpi } from '../../trigonometry/sinpi';
import { M_eps_sinc, thresh_BESS_Y, xlrg_BESS_Y } from '../bessel-constants';
import { IBesselRC } from '../IBesselRC';

const M_SQRT_2dPI = 0.797884560802865355879892119869;
const M_1_PI = 0.3183098861837907;
const M_PI_2 = 1.5707963267948966;

const { min, trunc, sqrt, sin, cos, log, abs, pow, PI: M_PI } = Math;
const { MIN_VALUE: DBL_MIN, EPSILON: DBL_EPSILON, NEGATIVE_INFINITY: ML_NEGINF, MAX_VALUE: DBL_MAX } = Number;

const printer = debug('Y_bessel');

export function Y_bessel(x: number, alpha: number, nb: number): IBesselRC {
    /* ----------------------------------------------------------------------
 
      This routine calculates Bessel functions Y_(N+ALPHA) (X)
     v for non-negative argument X, and non-negative order N+ALPHA.
 
 
      Explanation of variables in the calling sequence
 
      X     - Non-negative argument for which
          Y's are to be calculated.
      ALPHA - Fractional part of order for which
          Y's are to be calculated.  0 <= ALPHA < 1.0.
      NB    - Number of functions to be calculated, NB > 0.
          The first function calculated is of order ALPHA, and the
          last is of order (NB - 1 + ALPHA).
      BY    - Output vector of length NB.	If the
          routine terminates normally (NCALC=NB), the vector BY
          contains the functions Y(ALPHA,X), ... , Y(NB-1+ALPHA,X),
          If (0 < NCALC < NB), BY(I) contains correct function
          values for I <= NCALC, and contains the ratios
          Y(ALPHA+I-1,X)/Y(ALPHA+I-2,X) for the rest of the array.
      NCALC - Output variable indicating possible errors.
          Before using the vector BY, the user should check that
          NCALC=NB, i.e., all orders have been calculated to
          the desired accuracy.	See error returns below.
 
 
      *******************************************************************
 
      Error returns
 
       In case of an error, NCALC != NB, and not all Y's are
       calculated to the desired accuracy.
 
       NCALC < -1:  An argument is out of range. For example,
         NB <= 0, IZE is not 1 or 2, or IZE=1 and ABS(X) >=
         XMAX.  In this case, BY[0] = 0.0, the remainder of the
         BY-vector is not calculated, and NCALC is set to
         MIN0(NB,0)-2  so that NCALC != NB.
       NCALC = -1:  Y(ALPHA,X) >= XINF.  The requested function
         values are set to 0.0.
       1 < NCALC < NB: Not all requested function values could
         be calculated accurately.  BY(I) contains correct function
         values for I <= NCALC, and and the remaining NB-NCALC
         array elements contain 0.0.
 
 
      Intrinsic functions required are:
 
          DBLE, EXP, INT, MAX, MIN, REAL, SQRT
 
 
      Acknowledgement
 
         This program draws heavily on Temme's Algol program for Y(a,x)
         and Y(a+1,x) and on Campbell's programs for Y_nu(x).	Temme's
         scheme is used for  x < THRESH, and Campbell's scheme is used
         in the asymptotic region.  Segments of code from both sources
         have been translated into Fortran 77, merged, and heavily modified.
         Modifications include parameterization of machine dependencies,
         use of a new approximation for ln(gamma(x)), and built-in
         protection against over/underflow.
 
      References: "Bessel functions J_nu(x) and Y_nu(x) of float
               order and float argument," Campbell, J. B.,
               Comp. Phy. Comm. 18, 1979, pp. 133-142.
 
              "On the numerical evaluation of the ordinary
               Bessel function of the second kind," Temme,
               N. M., J. Comput. Phys. 21, 1976, pp. 343-350.
 
       Latest modification: March 19, 1990
 
       Modified by: W. J. Cody
                Applied Mathematics Division
                Argonne National Laboratory
                Argonne, IL  60439
      ----------------------------------------------------------------------*/

    /* ----------------------------------------------------------------------
      Mathematical constants
        FIVPI = 5*PI
        PIM5 = 5*PI - 15
     ----------------------------------------------------------------------*/
    const fivpi = 15.707963267948966192;
    const pim5 = 0.70796326794896619231;

    /*----------------------------------------------------------------------
          Coefficients for Chebyshev polynomial expansion of
          1/gamma(1-x), abs(x) <= .5
          ----------------------------------------------------------------------*/
    const ch = [
        -6.7735241822398840964e-24,
        -6.1455180116049879894e-23,
        2.9017595056104745456e-21,
        1.3639417919073099464e-19,
        2.3826220476859635824e-18,
        -9.0642907957550702534e-18,
        -1.4943667065169001769e-15,
        -3.3919078305362211264e-14,
        -1.7023776642512729175e-13,
        9.1609750938768647911e-12,
        2.4230957900482704055e-10,
        1.7451364971382984243e-9,
        -3.3126119768180852711e-8,
        -8.6592079961391259661e-7,
        -4.9717367041957398581e-6,
        7.6309597585908126618e-5,
        0.0012719271366545622927,
        0.0017063050710955562222,
        -0.07685284084478667369,
        -0.28387654227602353814,
        0.92187029365045265648,
    ];

    /* Local variables */

    //ints
    let i: number;
    let k: number;
    let na: number;
    let ncalc: number;

    //doubles
    let alfa;
    let div;
    let ddiv;
    let even;
    let gamma;
    let term;
    let cosmu;
    let sinmu;

    let b;
    let c;
    let d;
    let e;
    let f;
    let g;
    let h;
    let p;
    let q;
    let r;
    let s;
    let d1;
    let d2;
    let q0;
    let pa;
    let pa1;
    let qa;
    let qa1;
    let en;
    let ya;
    let ya1;
    let twobyx;
    let den;
    let odd;
    let aye;
    let dmu;
    let x2;
    let xna;
    let en1 = (ya = ya1 = 0); /* -Wall */

    const ex = x;
    let nu = alpha;
    const by = new Array(nb).fill(0);
    if (!(nb > 0 && 0 <= nu && nu < 1)) {
        printer('violaton: abort nb=%d, nu=%d', nb, nu);
        by[0] = 0;
        ncalc = min(nb, 0) - 1;
        return { x: 0, nb, ncalc };
    }

    if (ex < DBL_MIN || ex > xlrg_BESS_Y) {
        /* Warning is not really appropriate, give
         * proper limit:
         * ML_ERROR(ME_RANGE, "Y_bessel"); */
        printer('range issue: x < DBL_MIN but still bigger then 1e8 x=(%d)', ex);
        ncalc = nb;
        if (ex > xlrg_BESS_Y) by[0] = 0;
        /*was ML_POSINF */ else if (ex < DBL_MIN) by[0] = ML_NEGINF;
        return { x: by[0], nb, ncalc };
    }
    xna = trunc(nu + 0.5);
    na = trunc(xna);
    if (na === 1) {
        /* <==>  .5 <= *alpha < 1	 <==>  -5. <= nu < 0 */
        nu -= xna;
    }
    if (nu === -0.5) {
        p = M_SQRT_2dPI / sqrt(ex);
        ya = p * sin(ex);
        ya1 = -p * cos(ex);
    } else if (ex < 3) {
        /* -------------------------------------------------------------
		   Use Temme's scheme for small X
		   ------------------------------------------------------------- */
        b = ex * 0.5;
        d = -log(b);
        f = nu * d;
        e = pow(b, -nu);
        if (abs(nu) < M_eps_sinc) c = M_1_PI;
        else c = nu / sinpi(nu);

        /* ------------------------------------------------------------
		   Computation of sinh(f)/f
		   ------------------------------------------------------------ */
        if (abs(f) < 1) {
            x2 = f * f;
            en = 19;
            s = 1;
            for (i = 1; i <= 9; ++i) {
                s = (s * x2) / en / (en - 1) + 1;
                en -= 2;
            }
        } else {
            s = ((e - 1 / e) * 0.5) / f;
        }
        /* --------------------------------------------------------
		   Computation of 1/gamma(1-a) using Chebyshev polynomials */
        x2 = nu * nu * 8;
        aye = ch[0];
        even = 0;
        alfa = ch[1];
        odd = 0;
        for (i = 3; i <= 19; i += 2) {
            even = -(aye + aye + even);
            aye = -even * x2 - aye + ch[i - 1];
            odd = -(alfa + alfa + odd);
            alfa = -odd * x2 - alfa + ch[i];
        }
        even = (even * 0.5 + aye) * x2 - aye + ch[20];
        odd = (odd + alfa) * 2;
        gamma = odd * nu + even;
        /* End of computation of 1/gamma(1-a)
		   ----------------------------------------------------------- */
        g = e * gamma;
        e = (e + 1 / e) * 0.5;
        f = 2 * c * (odd * e + even * s * d);
        e = nu * nu;
        p = g * c;
        q = M_1_PI / g;
        c = nu * M_PI_2;
        if (abs(c) < M_eps_sinc) r = 1;
        else r = sinpi(nu / 2) / c;

        r = M_PI * c * r * r;
        c = 1;
        d = -b * b;
        h = 0;
        ya = f + r * q;
        ya1 = p;
        en = 1;

        while (abs(g / (1 + abs(ya))) + abs(h / (1 + abs(ya1))) > DBL_EPSILON) {
            f = (f * en + p + q) / (en * en - e);
            c *= d / en;
            p /= en - nu;
            q /= en + nu;
            g = c * (f + r * q);
            h = c * p - en * g;
            ya += g;
            ya1 += h;
            en += 1;
        }
        ya = -ya;
        ya1 = -ya1 / b;
    } else if (ex < thresh_BESS_Y) {
        /* --------------------------------------------------------------
		   Use Temme's scheme for moderate X :  3 <= x < 16
		   -------------------------------------------------------------- */
        c = (0.5 - nu) * (0.5 + nu);
        b = ex + ex;
        e = (ex * M_1_PI * cospi(nu)) / DBL_EPSILON;
        e *= e;
        p = 1;
        q = -ex;
        r = 1 + ex * ex;
        s = r;
        en = 2;
        while (r * en * en < e) {
            en1 = en + 1;
            d = (en - 1 + c / en) / s;
            p = (en + en - p * d) / en1;
            q = (-b + q * d) / en1;
            s = p * p + q * q;
            r *= s;
            en = en1;
        }
        f = p / s;
        p = f;
        g = -q / s;
        q = g;

        for (;;) {
            //L220:
            en -= 1;
            if (en > 0) {
                r = en1 * (2 - p) - 2;
                s = b + en1 * q;
                d = (en - 1 + c / en) / (r * r + s * s);
                p = d * r;
                q = d * s;
                e = f + 1;
                f = p * e - g * q;
                g = q * e + p * g;
                en1 = en;
                continue;
                //goto L220;
            }
            break;
        }
        f = 1 + f;
        d = f * f + g * g;
        pa = f / d;
        qa = -g / d;
        d = nu + 0.5 - p;
        q += ex;
        pa1 = (pa * q - qa * d) / ex;
        qa1 = (qa * q + pa * d) / ex;
        b = ex - M_PI_2 * (nu + 0.5);
        c = cos(b);
        s = sin(b);
        d = M_SQRT_2dPI / sqrt(ex);
        ya = d * (pa * s + qa * c);
        ya1 = d * (qa1 * s - pa1 * c);
    } else {
        /* x > thresh_BESS_Y */
        /* ----------------------------------------------------------
           Use Campbell's asymptotic scheme.
           ---------------------------------------------------------- */
        na = 0;
        d1 = trunc(ex / fivpi);
        i = trunc(d1);
        dmu = ex - 15 * d1 - d1 * pim5 - (alpha + 0.5) * M_PI_2;
        if (i - ((i / 2) << 1) === 0) {
            cosmu = cos(dmu);
            sinmu = sin(dmu);
        } else {
            cosmu = -cos(dmu);
            sinmu = -sin(dmu);
        }
        ddiv = 8 * ex;
        dmu = alpha;
        den = sqrt(ex);
        for (k = 1; k <= 2; ++k) {
            p = cosmu;
            cosmu = sinmu;
            sinmu = -p;
            d1 = (2 * dmu - 1) * (2 * dmu + 1);
            d2 = 0;
            div = ddiv;
            p = 0;
            q = 0;
            q0 = d1 / div;
            term = q0;
            for (i = 2; i <= 20; ++i) {
                d2 += 8;
                d1 -= d2;
                div += ddiv;
                term = (-term * d1) / div;
                p += term;
                d2 += 8;
                d1 -= d2;
                div += ddiv;
                term *= d1 / div;
                q += term;
                if (abs(term) <= DBL_EPSILON) {
                    break;
                }
            }
            p += 1;
            q += q0;
            if (k === 1) ya = (M_SQRT_2dPI * (p * cosmu - q * sinmu)) / den;
            else ya1 = (M_SQRT_2dPI * (p * cosmu - q * sinmu)) / den;
            dmu += 1;
        }
    }
    if (na === 1) {
        h = (2 * (nu + 1)) / ex;
        if (h > 1) {
            if (abs(ya1) > DBL_MAX / h) {
                h = 0;
                ya = 0;
            }
        }
        h = h * ya1 - ya;
        ya = ya1;
        ya1 = h;
    }
    /* ---------------------------------------------------------------
	   Now have first one or two Y's
	   --------------------------------------------------------------- */
    by[0] = ya;
    ncalc = 1;
    if (nb > 1) {
        by[1] = ya1;
        if (ya1 !== 0) {
            aye = 1 + alpha;
            twobyx = 2 / ex;
            ncalc = 2;
            for (i = 2; i < nb; ++i) {
                if (twobyx < 1) {
                    if (abs(by[i - 1]) * twobyx >= DBL_MAX / aye) break;
                    //goto L450;
                } else {
                    if (abs(by[i - 1]) >= DBL_MAX / aye / twobyx) break;
                    //goto L450;
                }
                by[i] = twobyx * aye * by[i - 1] - by[i - 2];
                aye += 1;
                ++ncalc;
            } //for
        } //if
    } //if
    //L450:
    // for (i = ncalc; i < nb; ++i)
    //   by[i] = ML_NEGINF; /* was 0 */
    return { x: by[ncalc - 1], nb, ncalc };
}
