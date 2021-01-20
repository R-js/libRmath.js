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

 *  SYNOPSIS
 *
 *    #include <Rmath.h>
 *    void dpsifn(double x, int n, int kode, int m,
 *		  double *ans, int *nz, int *ierr)
 *    double digamma(double x);
 *    double trigamma(double x)
 *    double tetragamma(double x)
 *    double pentagamma(double x)
 *
 *  DESCRIPTION
 *
 *    Compute the derivatives of the psi function
 *    and polygamma functions.
 *
 *    The following definitions are used in dpsifn:
 *
 *    Definition 1
 *
 *	 psi(x) = d/dx (ln(gamma(x)),  the first derivative of
 *				       the log gamma function.
 *
 *    Definition 2
 *		     k	 k
 *	 psi(k,x) = d /dx (psi(x)),    the k-th derivative
 *				       of psi(x).
 *
 *
 *    "dpsifn" computes a sequence of scaled derivatives of
 *    the psi function; i.e. for fixed x and m it computes
 *    the m-member sequence
 *
 *		  (-1)^(k+1) / gamma(k+1) * psi(k,x)
 *		     for k = n,...,n+m-1
 *
 *    where psi(k,x) is as defined above.   For kode=1, dpsifn
 *    returns the scaled derivatives as described.  kode=2 is
 *    operative only when k=0 and in that case dpsifn returns
 *    -psi(x) + ln(x).	That is, the logarithmic behavior for
 *    large x is removed when kode=2 and k=0.  When sums or
 *    differences of psi functions are computed the logarithmic
 *    terms can be combined analytically and computed separately
 *    to help retain significant digits.
 *
 *    Note that dpsifn(x, 0, 1, 1, ans) results in ans = -psi(x).
 *
 *  INPUT
 *
 *	x     - argument, x > 0.
 *
 *	n     - first member of the sequence, 0 <= n <= 100
 *		n == 0 gives ans(1) = -psi(x)	    for kode=1
 *				      -psi(x)+ln(x) for kode=2
 *
 *	kode  - selection parameter
 *		kode == 1 returns scaled derivatives of the
 *		psi function.
 *		kode == 2 returns scaled derivatives of the
 *		psi function except when n=0. In this case,
 *		ans(1) = -psi(x) + ln(x) is returned.
 *
 *	m     - number of members of the sequence, m >= 1
 *
 *  OUTPUT
 *
 *	ans   - a vector of length at least m whose first m
 *		components contain the sequence of derivatives
 *		scaled according to kode.
 *
 *	nz    - underflow flag
 *		nz == 0, a normal return
 *		nz != 0, underflow, last nz components of ans are
 *			 set to zero, ans(m-k+1)=0.0, k=1,...,nz
 *
 *	ierr  - error flag
 *		ierr=0, a normal return, computation completed
 *		ierr=1, input error,	 no computation
 *		ierr=2, overflow,	 x too small or n+m-1 too
 *			large or both
 *		ierr=3, error,		 n too large. dimensioned
 *			array trmr(nmax) is not large enough for n
 *
 *    The nominal computational accuracy is the maximum of unit
 *    roundoff (d1mach(4)) and 1e-18 since critical constants
 *    are given to only 18 digits.
 *
 *    The basic method of evaluation is the asymptotic expansion
 *    for large x >= xmin followed by backward recursion on a two
 *    term recursion relation
 *
 *	     w(x+1) + x^(-n-1) = w(x).
 *
 *    this is supplemented by a series
 *
 *	     sum( (x+k)^(-n-1) , k=0,1,2,... )
 *
 *    which converges rapidly for large n. both xmin and the
 *    number of terms of the series are calculated from the unit
 *    roundoff of the machine environment.
 *
 *  AUTHOR
 *
 *    Amos, D. E.	(Fortran)
 *    Ross Ihaka	(C Translation)
 *    Martin Maechler   (x < 0, and psigamma())
 *
 *  REFERENCES
 *
 *    Handbook of Mathematical Functions,
 *    National Bureau of Standards Applied Mathematics Series 55,
 *    Edited by M. Abramowitz and I. A. Stegun, equations 6.3.5,
 *    6.3.18, 6.4.6, 6.4.9 and 6.4.10, pp.258-260, 1964.
 *
 *    D. E. Amos, (1983). "A Portable Fortran Subroutine for
 *    Derivatives of the Psi Function", Algorithm 610,
 *    TOMS 9(4), pp. 494-502.
 *
 *    Routines called: Rf_d1mach, Rf_i1mach.
 */

*/
import { debug } from 'debug';
import { DBL_MANT_DIG, DBL_MAX_EXP, DBL_MIN_EXP, imin2, M_LOG10_2, R_pow_di } from '$constants';
import type { NumArray } from '$constants';
import { isArray, isEmptyArray, emptyFloat64Array } from '$constants';

const printer = debug('dpsifn');

const { NaN: ML_NAN, POSITIVE_INFINITY: ML_POSINF, isNaN: ISNAN, EPSILON: DBL_EPSILON } = Number;

const n_max = 100;

const { pow, abs: fabs, max: fmax2, min: fmin2, exp, log, sin, cos, PI: M_PI, round, round: R_forceint } = Math;

const trm = new Float64Array(23);
const trmr = new Float64Array(n_max + 1);

const lrg = 1 / (2 * DBL_EPSILON);
/* From R, currently only used for kode = 1, m = 1 : */
function dpsifn(
    x: number,
    n: number,
    kode: number,
    m: number,
    ans: Float64Array,
    nz: Uint8Array,
    ierr: Uint8Array,
): void {
    const bvalues = [
        /* Bernoulli Numbers */
        1.0,
        -5.0e-1,
        1.66666666666666667e-1,
        -3.33333333333333333e-2,
        2.38095238095238095e-2,
        -3.33333333333333333e-2,
        7.57575757575757576e-2,
        -2.53113553113553114e-1,
        1.16666666666666667,
        -7.09215686274509804,
        5.49711779448621554e1,
        -5.29124242424242424e2,
        6.1921231884057971e3,
        -8.65802531135531136e4,
        1.42551716666666667e6,
        -2.7298231067816092e7,
        6.01580873900642368e8,
        -1.51163157670921569e10,
        4.29614643061166667e11,
        -1.37116552050883328e13,
        4.88332318973593167e14,
        -1.92965793419400681e16,
    ];
    //  ints
    let nx: number;
    let xinc = 0 as number;
    let xdmln = 0 as number;
    let i; //i
    let j; //j
    let k; //k
    let mm; //mm
    let mx; //mx
    let nn; //nn
    let np; //np
    let fn; //fn

    //double
    let arg;
    let den;
    let eps;
    let fln;
    let fx;
    let rln;
    //let rxsq;
    let s;
    let slope;
    let t;
    //let ta;
    let tk;
    let tol;
    let tols;
    let tss;
    //let tst;
    let tt;
    let t1;
    let t2;
    let xdmy = 0;
    let xln = 0.0; /* -Wall */
    let xm;
    let xmin;
    let xq;
    let yint;
    // array

    trm.fill(0);
    trmr.fill(0);

    ierr[0] = 0;

    if (n < 0 || kode < 1 || kode > 2 || m < 1) {
        ierr[0] = 1;
        return;
    }

    if (x <= 0) {
        /* use	Abramowitz & Stegun 6.4.7 "Reflection Formula"
         *	psi(k, x) = (-1)^k psi(k, 1-x)	-  pi^{n+1} (d/dx)^n cot(x)
         */
        if (x === round(x)) {
            /* non-positive integer : +Inf or NaN depends on n */
            for (j = 0; j < m; j++ /* k = j + n : */) ans[j] = (j + n) % 2 ? ML_POSINF : ML_NAN;
            return;
        }
        /* This could cancel badly */
        dpsifn(1 - x, n, /*kode = */ 1, m, ans, nz, ierr);
        /* ans[j] === (-1)^(k+1) / gamma(k+1) * psi(k, 1 - x)
         *	     for j = 0:(m-1) ,	k = n + j
         */

        /* Cheat for now: only work for	 m = 1, n in {0,1,2,3} : */
        if (m > 1 || n > 3) {
            /* doesn't happen for digamma() .. pentagamma() */
            /* not yet implemented */
            ierr[0] = 4;
            return;
        }
        x *= M_PI; /* pi * x */
        if (n === 0) tt = cos(x) / sin(x);
        else if (n === 1) tt = -1 / R_pow_di(sin(x), 2);
        else if (n === 2) tt = (2 * cos(x)) / R_pow_di(sin(x), 3);
        else if (n === 3) tt = (-2 * (2 * R_pow_di(cos(x), 2) + 1)) / R_pow_di(sin(x), 4);
        /* can not happen! */ else tt = ML_NAN;
        /* end cheat */

        s = n % 2 ? -1 : 1; /* s = (-1)^n */
        /* t := pi^(n+1) * d_n(x) / gamma(n+1)	, where
         *		   d_n(x) := (d/dx)^n cot(x)*/
        t1 = t2 = s = 1;
        for (k = 0, j = k - n; j < m; k++, j++, s = -s) {
            /* k === n+j , s = (-1)^k */
            t1 *= M_PI; /* t1 === pi^(k+1) */
            if (k >= 2) t2 *= k; /* t2 === k! === gamma(k+1) */
            if (j >= 0)
                /* by cheat above,  tt === d_k(x) */
                ans[j] = s * (ans[j] + (t1 / t2) * tt);
        }
        if (n === 0 && kode === 2)
            /* unused from R, but "wrong": xln === 0 :*/
            ans[0] += xln;
        return;
    } /* x <= 0 */

    /* else :  x > 0 */
    nz[0] = 0;
    xln = log(x);
    if (kode === 1 && m === 1) {
        /* the R case  ---  for very large x: */
        if (n === 0 && x * xln > lrg) {
            ans[0] = -xln;
            return;
        } else if (n >= 1 && x > n * lrg) {
            ans[0] = exp(-n * xln) / n; /* === x^-n / n  ===  1/(n * x^n) */
            return;
        }
    }
    mm = m;
    nx = imin2(-DBL_MIN_EXP, DBL_MAX_EXP); /* = 1021 */
    const r1m5 = M_LOG10_2;
    const r1m4 = Number.EPSILON * 0.5;
    const wdtol = fmax2(r1m4, 0.5e-18); /* 1.11e-16 */

    /* elim = approximate exponential over and underflow limit */
    const elim = 2.302 * (nx * r1m5 - 3.0); /* = 700.6174... */

    let L10 = false; // goto flag
    let L20 = false;
    let L30 = false;

    while (true) {
        nn = n + mm - 1;
        fn = nn;
        t = (fn + 1) * xln;

        /* overflow and underflow test for small and large x */

        if (fabs(t) > elim) {
            if (t <= 0.0) {
                nz[0] = 0;
                ierr[0] = 2;
                return;
            }
        } else {
            if (x < wdtol) {
                ans[0] = R_pow_di(x, -n - 1);
                if (mm !== 1) {
                    for (k = 1; k < mm; k++) ans[k] = ans[k - 1] / x;
                }
                if (n === 0 && kode === 2) ans[0] += xln;
                return;
            }

            /* compute xmin and the number of terms of the series,  fln+1 */

            rln = r1m5 * DBL_MANT_DIG;
            rln = fmin2(rln, 18.06);
            fln = fmax2(rln, 3.0) - 3.0;
            yint = 3.5 + 0.4 * fln;
            slope = 0.21 + fln * (0.0006038 * fln + 0.008677);
            xm = yint + slope * fn;
            mx = (xm >> 0) + 1;
            xmin = mx;
            //
            if (n !== 0) {
                xm = -2.302 * rln - fmin2(0.0, xln);
                arg = xm / n;
                arg = fmin2(0.0, arg);
                eps = exp(arg);
                xm = 1.0 - eps;
                if (fabs(arg) < 1.0e-3) xm = -arg;
                fln = (x * xm) / eps;
                xm = xmin - x;
                if (xm > 7.0 && fln < 15.0) break;
            }
            xdmy = x;
            xdmln = xln;
            xinc = 0.0;
            if (x < xmin) {
                nx = x >> 0;
                xinc = xmin - nx;
                xdmy = x + xinc;
                xdmln = log(xdmy);
            }

            /* generate w(n+mm-1, x) by the asymptotic expansion */

            t = fn * xdmln;
            t1 = xdmln + xdmln;
            t2 = t + xdmln;
            tk = fmax2(fabs(t), fmax2(fabs(t1), fabs(t2)));
            if (tk <= elim) {
                /* for all but large x */
                L10 = true;
                break;
            } // if
        } // if else
        nz[0]++; /* underflow */
        mm--;
        ans[mm] = 0;
        if (mm === 0) {
            return;
        }
    } /* end{for()} */
    if (!L10) {
        nn = (fln >> 0) + 1;
        np = n + 1;
        t1 = (n + 1) * xln;
        t = exp(-t1);
        s = t;
        den = x;
        for (i = 1; i <= nn; i++) {
            den += 1;
            trm[i] = pow(den, -np);
            s += trm[i];
        }
        ans[0] = s;
        if (n === 0 && kode === 2) ans[0] = s + xln;

        if (mm !== 1) {
            /* generate higher derivatives, j > n */

            tol = wdtol / 5.0;
            for (j = 1; j < mm; j++) {
                t /= x;
                s = t;
                tols = t * tol;
                den = x;
                for (i = 1; i <= nn; i++) {
                    den += 1;
                    trm[i] /= den;
                    s += trm[i];
                    if (trm[i] < tols) break;
                } //for
                ans[j] = s;
            } //for
        }
        return;
    }
    //L10:
    tss = exp(-t);
    tt = 0.5 / xdmy;
    t1 = tt;
    const tst = wdtol * tt;
    if (nn !== 0) t1 = tt + 1.0 / fn;
    const rxsq = 1.0 / (xdmy * xdmy);
    const ta = 0.5 * rxsq;
    t = (fn + 1) * ta;
    s = t * bvalues[2];
    //

    if (fabs(s) >= tst) {
        tk = 2.0;
        for (k = 4; k <= 22; k++) {
            t = t * ((tk + fn + 1) / (tk + 1.0)) * ((tk + fn) / (tk + 2.0)) * rxsq;
            trm[k] = t * bvalues[k - 1];
            if (fabs(trm[k]) < tst) break;
            s += trm[k];
            tk += 2;
        } //for
    } //if
    s = (s + t1) * tss;
    // while (true) is a goto capture
    while (true) {
        if (xinc !== 0.0) {
            /* backward recur from xdmy to x */

            nx = xinc >> 0;
            np = nn + 1;
            if (nx > n_max) {
                nz[0] = 0;
                ierr[0] = 3;
                return;
            } else {
                if (nn === 0) {
                    L20 = true;
                    break;
                }
                xm = xinc - 1.0;
                fx = x + xm;

                /* this loop should not be changed. fx is accurate when x is small */
                for (i = 1; i <= nx; i++) {
                    trmr[i] = pow(fx, -np);
                    s += trmr[i];
                    xm -= 1;
                    fx = x + xm;
                }
            }
        }

        ans[mm - 1] = s;
        if (fn === 0) {
            L30 = true;
            break;
        }
        /* generate lower derivatives,  j < n+mm-1 */
        for (j = 2; j <= mm; j++) {
            fn--;
            tss *= xdmy;
            t1 = tt;
            if (fn !== 0) t1 = tt + 1.0 / fn;
            t = (fn + 1) * ta;
            s = t * bvalues[2];
            if (fabs(s) >= tst) {
                tk = 4 + fn;
                for (k = 4; k <= 22; k++) {
                    trm[k] = (trm[k] * (fn + 1)) / tk;
                    if (fabs(trm[k]) < tst) break;
                    s += trm[k];
                    tk += 2;
                }
            }
            s = (s + t1) * tss;
            if (xinc !== 0.0) {
                if (fn === 0) {
                    L20 = true;
                    break;
                }
                xm = xinc - 1.0;
                fx = x + xm;
                for (i = 1; i <= nx; i++) {
                    trmr[i] = trmr[i] * fx;
                    s += trmr[i];
                    xm -= 1;
                    fx = x + xm;
                }
            }
            ans[mm - j] = s;
            if (fn === 0) {
                L30 = true;
                break;
                //goto L30;
            }
        } //for
        return;
    } // goto capture end
    //L20:
    printer(L20 ? 'goto L20 was set!' : 'goto L20 was not set');

    if (!L30) {
        for (i = 1; i <= nx; i++) {
            s += 1 / (x + (nx - i));
            /* avoid disastrous cancellation, PR#13714 */
        }
    }
    //L30:
    if (kode !== 2)
        /* always */
        ans[0] = s - xdmln;
    else if (xdmy !== x) {
        xq = xdmy / x;
        ans[0] = s - log(xq);
    }
    return;
} /* dpsifn() */

/*
#ifdef MATHLIB_STANDALONE
# define ML_TREAT_psigam(_IERR_)	\
    if(_IERR_ !== 0) {			\
    errno = EDOM;			\
    return ML_NAN;			\
    }
#else
# define ML_TREAT_psigam(_IERR_)	\
    if(_IERR_ !== 0)			\
    return ML_NAN
#endif
*/
const print_psigamma = debug('psigamma');

function _render(
    x: NumArray,
    calculate: (x: number, ans: Float64Array, nz: Uint8Array, ierr: Uint8Array) => void,
    final: (_ans: number) => number,
) {
    if (typeof x === 'number') {
        x = new Float64Array([x]);
    }
    if (isEmptyArray(x)) {
        return emptyFloat64Array;
    }
    if (!isArray(x)) {
        throw new TypeError(`argument not of number, number[], Float64Array, Float32Array`);
    }
    const rc =
        x instanceof Float64Array
            ? new Float64Array(x.length)
            : x instanceof Float32Array
            ? new Float32Array(x.length)
            : new Float64Array(x);

    const ans = new Float64Array(1);
    const nz = new Uint8Array();
    const ierr = new Uint8Array(1);

    for (let i = 0; i < x.length; i++) {
        ans[0] = 0;
        nz[0] = 0;
        ierr[0] = 0;
        if (ISNAN(x[i])) {
            rc[i] = x[i];
            continue;
        }
        calculate(x[i], ans, nz, ierr);
        if (ierr[0] !== 0) {
            rc[i] = NaN;
            continue;
        }
        rc[i] = final(ans[0]);
    }
    return rc;
}

export function psigamma(x: NumArray, deriv: number): Float32Array | Float64Array {
    deriv = R_forceint(deriv);
    const n = deriv >> 0;
    if (n > n_max) {
        print_psigamma('"deriv = %d > %d (= n_max)', n, n_max);
    }
    return _render(
        x,
        (x0: number, ans: Float64Array, nz: Uint8Array, ierr: Uint8Array) => {
            if (n > n_max) {
                ans[0] = ML_NAN;
                return;
            }
            dpsifn(x0, n, 1, 1, ans, nz, ierr);
        },
        (v) => {
            v = -v; // = (-1)^(0+1) * gamma(0+1) * A
            for (let k = 1; k <= n; k++) v *= -k; // = (-1)^(k+1) * gamma(k+1) * A
            return v;
        },
    );
}

// https://ru.wikipedia.org/wiki/%D0%A4%D0%B0%D0%B9%D0%BB:Pentagamma_function_plot.png
export function pentagamma(x: NumArray): Float32Array | Float64Array {
    return _render(
        x,
        (x0: number, ans: Float64Array, nz: Uint8Array, ierr: Uint8Array) => dpsifn(x0, 3, 1, 1, ans, nz, ierr),
        (v) => v * 6.0,
    );
}

//https://commons.wikimedia.org/wiki/Category:Polygamma_function#/media/File:Tetragamma_function_plot.png
export function tetragamma(x: NumArray): Float32Array | Float64Array {
    return _render(
        x,
        (x0: number, ans: Float64Array, nz: Uint8Array, ierr: Uint8Array) => dpsifn(x0, 2, 1, 1, ans, nz, ierr),
        (v) => v * -2.0,
    );
}

//https://commons.wikimedia.org/wiki/Category:Polygamma_function#/media/File:Trigamma_function_plot.png

export function trigamma(x: NumArray): Float32Array | Float64Array {
    return _render(
        x,
        (x0: number, ans: Float64Array, nz: Uint8Array, ierr: Uint8Array) => dpsifn(x0, 1, 1, 1, ans, nz, ierr),
        (v) => v,
    );
}

//https://commons.wikimedia.org/wiki/File:Digamma_function_plot.png
export function digamma(x: NumArray): Float32Array | Float64Array {
    return _render(
        x,
        (x0: number, ans: Float64Array, nz: Uint8Array, ierr: Uint8Array) => dpsifn(x0, 0, 1, 1, ans, nz, ierr),
        (v) => v * -1,
    );
}
