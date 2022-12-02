
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

const { isInteger, parseFloat, parseInt, MIN_VALUE, MAX_VALUE, isNaN, isFinite, EPSILON, MAX_SAFE_INTEGER, NEGATIVE_INFINITY, POSITIVE_INFINITY } = Number;

export { isInteger, parseFloat, parseInt, MIN_VALUE, MAX_VALUE, isNaN, isFinite, EPSILON, MAX_SAFE_INTEGER, NEGATIVE_INFINITY, POSITIVE_INFINITY };

const {
    abs,
    cbrt,
    ceil,
    exp,
    expm1,
    floor,
    fround,
    imul,
    log,
    log10,
    log1p,
    log2,
    max,
    min,
    pow,
    random,
    round,
    sign,
    sqrt,
    PI,
    trunc,
    SQRT2,
    LN2,
    sinh,
    cos,
    sin,
    tan,
    atan
} = Math;

export {  abs,
    cbrt,
    ceil,
    exp,
    expm1,
    floor,
    fround,
    imul,
    log,
    log10,
    log1p,
    log2,
    max,
    min,
    pow,
    random,
    round,
    sign,
    sqrt,
    PI,
    trunc,
    SQRT2,
    LN2,
    sinh,
    cos,
    sin,
    tan,
    atan
};

export type strTypes =
    | 'boolean'
    | 'number'
    | 'undefined'
    | 'string'
    | 'null'
    | 'symbol'
    | 'array'
    | 'function'
    | 'object';

export type system = boolean | number | undefined | string | null | symbol;

export function sum(x: number[]): number {
    const rc = x.reduce((pv: number, v: number) => pv + v, 0);
    return rc;
}

export interface ISummary {
    N: number; // number of samples in "data"
    mu: number; // mean of "data"
    population: {
        variance: number; // population variance (data is seen as finite population)
        sd: number; // square root of the population variance
    };
    sample: {
        variance: number; // sample variance (data is seen as a small sample from an very large population)
        sd: number; // square root of "sample variance"
    };
    relX: number[]; // = x-E(x)
    relX2: number[]; // = ( x-E(x) )^2
    stats: {
        min: number; // minimal value from "data"
        '1st Qu.': number; // 1st quantile from "data"
        median: number; // median value from "data
        '3rd Qu.': number; // 3rd quantile from "data"
        max: number; // maximum value in data
    };
}

export enum LogLevel {
    ERROR,
    WARN,
    INFO,
    DEBUG,
}

/*export abstract class Sum implements ISummary {
    abstract N: number;
    abstract mu: number;

}*/
/*
export function summary(x: number[]): ISummary {
    if (!Array.isArray(x)) {
        throw new Error(`Illigal argument, not an array`);
    }
    if (x.length === 0) {
        throw new Error(`argument Array is empty`);
    }
    if (Array.isArray(x) && x.includes(NaN)) {
        throw new Error('argument Array has NaNs');
    }

    const N = x.length;
    const mu = sum(x) / N; // population mean
    const relX = x.map((v) => v - mu);
    const relX2 = relX.map((v) => v * v);
    const sampleVariance = sum(relX2) / (N - 1);
    const populationVariance = (sampleVariance * (N - 1)) / N;
    const sampleSD = Math.sqrt(sampleVariance);
    const populationSD = Math.sqrt(populationVariance);
    // quantiles
    const o = x.sort((a, b) => a - b);
    const min = o[0];
    const max = o[N - 1];
    //isOdd?
    const { q1, median, q3 } = (function () {
        const i = [4, 2, 4 / 3].map((v) => (N - 1) / v);
        const q = i.map((index) => {
            const f1 = 1 - (index - Math.floor(index));
            const f2 = 1 - f1;
            return o[Math.trunc(index)] * f1 + o[Math.trunc(index) + 1] * f2;
        });
        return {
            q1: q[0],
            median: q[1],
            q3: q[2],
        };
    })();
    return {
        N,
        mu,
        population: {
            variance: populationVariance,
            sd: populationSD,
        },
        sample: {
            variance: sampleVariance,
            sd: sampleSD,
        },
        relX,
        relX2,
        stats: {
            min,
            '1st Qu.': q1,
            median,
            '3rd Qu.': q3,
            max,
        },
    };
}
*/
// https://en.wikipedia.org/wiki/Welch%E2%80%93Satterthwaite_equation

export function Welch_Satterthwaite(s: number[], n: number[]): number {
    const elts = s.map((_s, i) => (_s * _s) / n[i as number]);
    const dom = elts.map((e, i) => (e * e) / (n[i as number] - 1));

    return pow(sum(elts), 2) / sum(dom);
}

export function repeatedCall<F extends (...args: any[]) => number>(n: number, fn: F, ...arg: Parameters<F>): Float32Array {
    let result: Float32Array;

    if (n === 0) {
        result = emptyFloat32Array;
    } else if (n > 0 && isFinite(n)) {
        result = new Float32Array(n);
    } else {
        throw new TypeError(`"n" argument is not a finite number or negative`);
    }
    for (let i = 0; i < result.length; i++) {
        result[i] = fn(...arg);
    }
    return result;
}

export function repeatedCall64<F extends (...args: any[]) => number>(n: number, fn: F, ...args: Parameters<F>): Float64Array {
    let result: Float64Array;

    if (n === 0) {
        result = emptyFloat64Array;
    } else if (n > 0 && isFinite(n)) {
        result = new Float64Array(n);
    } else {
        throw new TypeError(`"n=${n}" is not a positive finite number`);
    }
    for (let i = 0; i < result.length; i++) {
        result[i] = fn(...args);
    }
    return result;
}

export type Slicee<T> = {
    [P in keyof T]: T[P];
};

export type Sliced<T> = {
    key: keyof T;
    value: T[keyof T];
};

//gama
//beta
//ok
export const emptyFloat32Array = new Float32Array(0);

//gama
//beta
//ok
export const emptyFloat64Array = new Float64Array(0);

//ok
export const nanFloat32Array = new Float32Array([NaN]);

export type NumArray = number[] | Float32Array | Float64Array;

//gamma
//beta
//ok
export function isArray(x: unknown): boolean {
    return Array.isArray(x) || x instanceof Float32Array || x instanceof Float64Array;
}

//ok
export function isEmptyArray(x: NumArray): boolean {
    return isArray(x) && x.length === 0;
}

//ok
export const M_SQRT2 = 1.41421356237309504880168872421; /* sqrt(2) */

//ok
export function frac(x: number): number { return x - trunc(x) }

//ok
export const M_SQRT_32 = 5.656854249492380195206754896838; /* sqrt(32) */

//gamma
//ok
export const DBL_EPSILON = 2.2204460492503131e-016;

//ok
export const DBL_MANT_DIG = 18;

//ok
export const DBL_MIN = 2.2250738585072014e-308;

export const DBL_MAX = 1.7976931348623158e+308;

//ok
export const M_LN2 = 0.693147180559945309417; /* ln(2) */

//ok
export const M_1_SQRT_2PI = 0.398942280401432677939946059934;

//ok
export const M_2PI = 6.283185307179586476925286766559;

//ok
export const M_LN_2PI = 1.837877066409345483560659472811;

//ok
export const M_1_PI = 0.318309886183790671538; // 1/pi

//ok
export const M_PI_2 = PI / 2;

//ok
export const M_LN_SQRT_PI = 0.572364942924700087071713675677; // log(sqrt(pi))

//ok
export const INT_MAX = 2 ** 31 - 1;

// gamma
//ok
export const M_LN_SQRT_2PI = 0.918938533204672741780329736406; // log(sqrt(2*pi))

//gamma
//ok
export const M_LN_SQRT_PId2 = 0.225791352644727432363097614947; // log(sqrt(pi/2))

//ok
export const M_SQRT_2dPI = 0.797884560802865355879892119869; // sqrt(2/pi)

//gamma
//ok
export const M_LOG10_2 = 0.301029995663981195213738894724; //Math.log10(2);

// gamma
//ok
export const DBL_MAX_EXP = log2(MAX_VALUE);

//qsignrank
export const DBL_MIN_VALUE_LN = log(MIN_VALUE);

// gamma
//ok
export const DBL_MIN_EXP = log2(MIN_VALUE);

//ok
export function R_D__1(logP: boolean): number {
    return logP ? 0 : 1.0;
}

//ok
export const R_D__0 = (logP: boolean): number => {
    return logP ? -Infinity : 0;
};

//ok
export const R_DT_0 = (lower_tail: boolean, log_p: boolean): number => {
    return lower_tail ? R_D__0(log_p) : R_D__1(log_p);
};

//ok
export const R_DT_1 = (lower_tail: boolean, log_p: boolean): number => {
    return lower_tail ? R_D__1(log_p) : R_D__0(log_p);
};

//ok
export function R_D_val(log_p: boolean, x: number): number {
    return log_p ? log(x) : x;
}

//ok
export function R_D_Clog(log_p: boolean, p: number): number {
    return log_p ? log1p(-p) : (0.5 - p + 0.5); /* [log](1-p) */
}

//ok
export function R_DT_val(lower_tail: boolean, log_p: boolean, x: number): number {
    return lower_tail ? R_D_val(log_p, x) : R_D_Clog(log_p, x);
}

//gamma
//ok
export function imin2(x: number, y: number): number {
    return min(trunc(x), trunc(y));
}

/* Use 0.5 - p + 0.5 to perhaps gain 1 bit of accuracy */
//ok
export function R_D_Lval(lowerTail: boolean, p: number): number {
    return lowerTail ? p : 1 - p; /*  p  */
}

//ok
export function R_D_Cval(lowerTail: boolean, p: number): number {
    return lowerTail ? 1 - p : p; /*  1 - p */
}

//ok
export function R_P_bounds_Inf_01(lowerTail: boolean, log_p: boolean, x: number): number | undefined {
    if (!isFinite(x)) {
        if (x > 0) {
            return R_DT_1(lowerTail, log_p);
        }
        return R_DT_0(lowerTail, log_p);
    }
    return undefined;
}

//ok
export function R_D_half(log_p: boolean): number {
    return log_p ? -M_LN2 : 0.5; // 1/2 (lower- or upper tail)
}

//ok
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

//ok
export const R_D_exp = (log_p: boolean, x: number): number => {
    return log_p ? x : exp(x);
};

import type { Debugger } from 'debug';
//ok
export function R_D_nonint_check(log: boolean, x: number, printer: Debugger): number | undefined {
    if (R_nonint(x)) {
        printer('non-integer x = %d', x);
        return R_D__0(log);
    }
    return undefined;
}

//gamma
//bessel
//ok
export function fmod(x: number, y: number): number {
    return x % y;
}
//ok
export function imax2(x: number, y: number): number {
    return max(trunc(x), trunc(y));
}

//ok
// original source
// #define ODD(_K_) ((_K_) != 2 * floor((_K_) / 2.))
// odd is everything that is not precisely even
export function isOdd(k: number): boolean {
    return floor(k/2)*2 !== k;
}

//ok
export function R_D_negInonint(x: number): boolean {
    return x < 0.0 || R_nonint(x);
}

//ok
export function R_nonint(x: number): boolean {
    return !isInteger(x); //Math.abs(x - Math.round(x)) > 1e-7 * Math.max(1, Math.abs(x));
}

export function R_D_fexp(give_log: boolean, f: number, x: number): number {
    return give_log ? -0.5 * log(f) + x : exp(x) / sqrt(f);
}

//gamma
//pok
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
        return pow(x, y);
    }
    if (isNaN(x) || isNaN(y)) return x + y;
    if (!isFinite(x)) {
        if (x > 0)
            /* Inf ^ y */
            return y < 0 ? 0 : Infinity;
        else {
            /* (-Inf) ^ y */
            if (isFinite(y) && y === floor(y))
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

/*
C++ math header undefines any isnan macro. This file
   doesn't get C++ headers and so is safe.
*/
export function R_isnancpp(x: number): boolean {
    return isNaN(x);
}

// gamma
export function myfmod(x1: number, x2: number): number {
    const q = x1 / x2;
    return x1 - floor(q) * x2;
}

//ok
export function ldexp(x: number, y: number): number {
    if (isNaN(x) || isNaN(y)) {
        return x + y;
    }
    if (!isFinite(x) || !isFinite(y)) {
        return Infinity;
    }
    return x * pow(2, y);
}

//ok
export function R_D_log(log_p: boolean, p: number): number {
    return log_p ? p : log(p); /* log(p) */
}

//ok 
export function R_D_qIv(logP: boolean, p: number): number {
    return logP ? exp(p) : p;
}

//ok
export function sumfp(x: Float32Array): number {
    return x.reduce((pv, v) => pv + v, 0);
}

export function sumfp64(x: Float64Array): number {
    return x.reduce((pv, v) => pv + v, 0);
}
