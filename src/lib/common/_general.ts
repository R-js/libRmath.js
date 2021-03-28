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
//gama
//beta
export const emptyFloat32Array = new Float32Array(0);
//gama
//beta
export const emptyFloat64Array = new Float64Array(0);

export const nanFloat32Array =new Float32Array([NaN]);

export type NumArray = number[] | Float32Array | Float64Array;
//gamma
//beta
export function isArray(x: unknown): boolean {
    return Array.isArray(x) || x instanceof Float32Array || x instanceof Float64Array;
}
//beta
export function matchFloatType(n: number, ...a: (NumArray | undefined)[]): Float32Array | Float64Array {
    let fp32 = true;
    for (let i = 0; i < a.length; i++) {
        if (a[i] === undefined) continue; // skip undefined
        if (!(a[i] instanceof Float32Array)) {
            fp32 = false;
            break;
        }
    }
    return fp32 ? new Float32Array(n) : new Float64Array(n);
}

export function isEmptyArray(x: NumArray): boolean {
    return isArray(x) && x.length === 0;
}

export const M_SQRT2 = 1.41421356237309504880168872421; /* sqrt(2) */
export function frac(x: number): number { return x - Math.trunc(x) }
export const M_SQRT_32 = 5.656854249492380195206754896838; /* sqrt(32) */

//gamma
export const DBL_MANT_DIG = 18;

export const M_LN2 = 0.693147180559945309417232121458; /* ln(2) */
export const M_1_SQRT_2PI = 0.398942280401432677939946059934;
export const M_2PI = 6.283185307179586476925286766559;
export const M_LN_2PI = 1.837877066409345483560659472811;
export const M_1_PI = 1.0 / Math.PI;
export const M_PI_2 = Math.PI / 2;
export const M_LN_SQRT_PI = 0.57236494292470008; // log(sqrt(pi))

// gamma
export const M_LN_SQRT_2PI = 0.918938533204672741780329736406; // log(sqrt(2*pi))

//gamma
export const M_LN_SQRT_PId2 = 0.225791352644727432363097614947; // log(sqrt(pi/2))
export const M_SQRT_2dPI = 0.797884560802865355879892119869; // sqrt(2/pi)

//gamma
export const M_LOG10_2 = 0.301029995663981195213738894724; //Math.log10(2);

// gamma
export const DBL_MAX_EXP = Math.log2(Number.MAX_VALUE);

// gamma
export const DBL_MIN_EXP = Math.log2(Number.MIN_VALUE);

export function R_D__1(logP: boolean): number {
    return logP ? 0 : 1.0;
}

export const R_D__0 = (logP: boolean): number => {
    return logP ? -Infinity : 0.0;
};

export const R_DT_0 = (lower_tail: boolean, log_p: boolean): number => {
    return lower_tail ? R_D__0(log_p) : R_D__1(log_p);
};
export const R_DT_1 = (lower_tail: boolean, log_p: boolean): number => {
    return lower_tail ? R_D__1(log_p) : R_D__0(log_p);
};
export function R_D_val(log_p: boolean, x: number): number {
    return log_p ? Math.log(x) : x;
}

export function R_D_Clog(log_p: boolean, p: number): number {
    return log_p ? Math.log1p(-p) : (0.5 - p + 0.5); /* [log](1-p) */
}

export function R_DT_val(lower_tail: boolean, log_p: boolean, x: number): number {
    return lower_tail ? R_D_val(log_p, x) : R_D_Clog(log_p, x);
}

//gamma
export function imin2(x: number, y: number): number {
    return Math.trunc(Math.min(x, y));
}

/* Use 0.5 - p + 0.5 to perhaps gain 1 bit of accuracy */
export function R_D_Lval(lowerTail: boolean, p: number): number {
    return lowerTail ? p : 1 - p; /*  p  */
}

export function R_D_Cval(lowerTail: boolean, p: number): number {
    return lowerTail ? 1 - p : p; /*  1 - p */
}

export function R_P_bounds_Inf_01(lowerTail: boolean, log_p: boolean, x: number): number | undefined {
    if (!isFinite(x)) {
        if (x > 0) {
            return R_DT_1(lowerTail, log_p);
        }
        return R_DT_0(lowerTail, log_p);
    }
    return undefined;
}

export function R_D_half(log_p: boolean): number {
    return log_p ? -M_LN2 : 0.5; // 1/2 (lower- or upper tail)
}

export function R_P_bounds_01(
    lower_tail: boolean,
    log_p: boolean,
    x: number,
    x_min: number,
    x_max: number,
): number | undefined {
    if (x <= x_min) return R_DT_0(lower_tail, log_p);
    if (x >= x_max) return R_DT_1(lower_tail, log_p);
    return undefined;
}

export const R_D_exp = (log_p: boolean, x: number): number => {
    return log_p ? x : Math.exp(x);
    /* exp(x) */
};

export function R_D_nonint_check(log: boolean, x: number, printer: debug.IDebugger): number|undefined {
    if (R_nonint(x)) {
        printer('non-integer x = %d', x);
        return R_D__0(log);
    }
    return undefined;
}

//gamma
//bessel
export function fmod(x: number, y: number): number {
    return x % y;
}

export function imax2(x: number, y: number): number {
    return Math.trunc(Math.max(x, y));
}

export function isOdd(k: number): boolean {
    return Math.floor(k) % 2 === 1;
}

export function epsilonNear(x: number, target: number): number {
    if (isNaN(x)) return x;
    if (!isFinite(x)) return x;
    if (isNaN(target)) return x;
    if (!isFinite(target)) return x;

    const diff = x - target;
    if (diff > Number.EPSILON || diff < -Number.EPSILON) {
        return x;
    }
    return target;
}

export function isEpsilonNear(x: number, target: number): boolean {
    if (isFinite(x) && isFinite(target)) return epsilonNear(x, target) === target;
    return false;
}

export function R_D_negInonint(x: number): boolean {
    return x < 0.0 || R_nonint(x);
}

export function R_nonint(x: number): boolean {
    return !Number.isInteger(x); //Math.abs(x - Math.round(x)) > 1e-7 * Math.max(1, Math.abs(x));
}

export function R_D_fexp(give_log: boolean, f: number, x: number): number {
    return give_log ? -0.5 * Math.log(f) + x : Math.exp(x) / Math.sqrt(f);
}

/** bessel section */
/** bessel section */
/** bessel section */

export const nsig_BESS = 16;
export const ensig_BESS = 1e16;
export const rtnsig_BESS = 1e-4;
export const enmten_BESS = 8.9e-308;
export const enten_BESS = 1e308;

export const exparg_BESS = 709;
export const xlrg_BESS_IJ = 1e5;
export const xlrg_BESS_Y = 1e8;
export const thresh_BESS_Y = 16;

export const xmax_BESS_K = 705.342; /* maximal x for UNscaled answer */

/* sqrt(DBL_MIN) =	1.491668e-154 */
export const sqxmin_BESS_K = 1.49e-154;

/* x < eps_sinc	 <==>  sin(x)/x == 1 (particularly "==>");
  Linux (around 2001-02) gives 2.14946906753213e-08
  Solaris 2.5.1		 gives 2.14911933289084e-08
*/
export const M_eps_sinc = 2.149e-8;

// gamma
export function R_pow_di(x: number, n: number): number {
    let pow = 1.0;

    if (isNaN(x)) return x;
    if (n !== 0) {
        if (!isFinite(x)) return R_pow(x, n);
        if (n < 0) {
            n = -n;
            x = 1 / x;
        }
        while (true) {
            if (n & 1) pow *= x;
            if ((n >>= 1)) x *= x;
            else break;
        }
    }
    return pow;
}

// gamma
export function R_pow(x: number, y: number): number {
    /* = x ^ y */

    /* squaring is the most common of the specially handled cases so
       check for it first. */
    if (y === 2.0) return x * x;
    if (x === 1 || y === 0) return 1;
    if (x === 0) {
        if (y > 0) return 0;
        else if (y < 0) return Infinity;
        else return y; /* NA or NaN, we assert */
    }
    if (isFinite(x) && isFinite(y)) {
        /* There was a special case for y == 0.5 here, but
           gcc 4.3.0 -g -O2 mis-compiled it.  Showed up with
           100^0.5 as 3.162278, example(pbirthday) failed. */
        return Math.pow(x, y);
    }
    if (isNaN(x) || isNaN(y)) return x + y;
    if (!isFinite(x)) {
        if (x > 0)
            /* Inf ^ y */
            return y < 0 ? 0 : Infinity;
        else {
            /* (-Inf) ^ y */
            if (isFinite(y) && y === Math.floor(y))
                /* (-Inf) ^ n */
                return y < 0 ? 0 : myfmod(y, 2) ? x : -x;
        }
    }
    if (!isFinite(y)) {
        if (x >= 0) {
            if (y > 0)
                /* y == +Inf */
                return x >= 1 ? Infinity : 0;
            /* y == -Inf */ else return x < 1 ? Infinity : 0;
        }
    }
    return NaN; // all other cases: (-Inf)^{+-Inf, non-int}; (neg)^{+-Inf}
}

/* C++ math header undefines any isnan macro. This file
   doesn't get C++ headers and so is safe. */
export function R_isnancpp(x: number): boolean {
    return Number.isNaN(x);
}

// gamma
export function myfmod(x1: number, x2: number): number {
    const q = x1 / x2;
    return x1 - Math.floor(q) * x2;
}

export function R_powV(x: number, y: number): number /* = x ^ y */ {
    if (x === 1 || y === 0) return 1;
    if (x === 0) {
        if (y > 0) return 0;
        /* y < 0 */ return Infinity;
    }
    if (Number.isFinite(x) && Number.isFinite(y)) return Math.pow(x, y);
    if (Number.isNaN(x) || Number.isNaN(y)) {
        return x + y;
    }
    if (!Number.isFinite(x)) {
        if (x > 0)
            /* Inf ^ y */
            return y < 0 ? 0 : Infinity;
        else {
            /* (-Inf) ^ y */
            if (Number.isFinite(y) && y === Math.floor(y))
                /* (-Inf) ^ n */
                return y < 0 ? 0 : myfmod(y, 2) ? x : -x;
        }
    }
    if (!Number.isFinite(y)) {
        if (x >= 0) {
            if (y > 0)
                /* y == +Inf */
                return x >= 1 ? Infinity : 0;
            /* y == -Inf */ else return x < 1 ? Infinity : 0;
        }
    }
    return NaN; /* all other cases: (-Inf)^{+-Inf,
                   non-int}; (neg)^{+-Inf} */
}

//  return x * Math.pow(2,y)
export function ldexp(x: number, y: number): number {
    if (Number.isNaN(x) || Number.isNaN(y)) {
        return x + y;
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return Infinity;
    }
    return x * Math.pow(2, y);
}

export function R_D_log(log_p: boolean, p: number): number {
    return log_p ? p : Math.log(p); /* log(p) */
}

//#define R_D_qIv(p)	(log_p	? exp(p) : (p))		/*  p  in qF(p,..) */
export function R_D_qIv(logP: boolean, p: number): number {
    return logP ? Math.exp(p) : p;
}


export function sumfp(x: Float32Array): number {
    return x.reduce((pv, v) => pv + v, 0);
}