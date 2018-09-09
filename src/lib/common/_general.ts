/* This is a conversion from BLAS to Typescript/Javascript
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

import * as debug from 'debug';

const debug_R_Q_P01_boundaries = debug('R_Q_P01_boundaries');
const debug_R_Q_P01_check = debug('R_Q_P01_check');

export const M_SQRT2 = 1.41421356237309504880168872421; /* sqrt(2) */
export const frac = (x: number) => x - Math.trunc(x);
//export const DBL_MAX_10_EXP = Math.log10(Number.MAX_VALUE);
//export const MAX_DIGITS = DBL_MAX_10_EXP;
//export const INT_MAX = Number.MAX_SAFE_INTEGER;
//export const INT_MIN = Number.MIN_SAFE_INTEGER;
export const M_SQRT_32 = 5.656854249492380195206754896838; /* sqrt(32) */
export const DBL_MANT_DIG = 18;
//export const FLT_MANT_DIG = DBL_MANT_DIG;
export const M_LN2 = 0.693147180559945309417232121458; /* ln(2) */
export const M_1_SQRT_2PI = 0.398942280401432677939946059934;
//export const nearbyint = rround;
//export const R_forceint = nearbyint;
//export const R_rint = nearbyint;
export const M_2PI = 6.283185307179586476925286766559;
export const M_LN_2PI = 1.837877066409345483560659472811; /* 
   6.0E-17, we used the comments in the nmath lib to find epsilon that fullfills x == x-epsilon
   this does not cover the internal accurace of build in functions in Math.cos, Math.sin etc
*/
/*export const sqrt = Math.sqrt;
export const asin = Math.asin;
export const acos = Math.acos;
export const atan = Math.atan;
export const atan2 = Math.atan2;
*/ /*export const DBL_EPSILON = Number.EPSILON;
export const sinh = Math.sinh;
export const DBL_MAX = Number.MAX_VALUE;
export const exp = Math.exp;
export const isInteger = Number.isInteger;
export const sin = Math.sin;
export const cos = Math.cos;
export const tan = Math.tan;
*/ export const M_1_PI =
  1.0 / Math.PI;
/*export const R_FINITE = (x: number) => Number.isFinite(x);
export const NaN = Number.NaN;
export const FLT_MIN = 2.22507e-308; //10^24  larger then Number.MIN_VALUE
export const DBL_MIN = FLT_MIN;
export const log = Math.log;
export const ISNAN = Number.isNaN;
export const ML_NAN = NaN;
export const round = Math.round;
export const ML_POSINF = Number.POSITIVE_INFINITY;
export const ML_NEGINF = Number.NEGATIVE_INFINITY;
export const M_PI = 3.14159265358979323846264338327950288;
*/ export const M_PI_2 =
  Math.PI / 2;
export const M_LN_SQRT_PI = 0.57236494292470008; // log(sqrt(pi))
export const M_LN_SQRT_2PI = 0.918938533204672741780329736406; // log(sqrt(2*pi))
export const M_LN_SQRT_PId2 = 0.225791352644727432363097614947; // log(sqrt(pi/2))
//export const M_LN10 = 2.30258509299404568402; /* log_e 10 */
//export const ML_VALID = (x: number) => !ISNAN(x);
//export const floor = Math.floor;
export const M_SQRT_2dPI = 0.797884560802865355879892119869; // sqrt(2/pi)
export const M_LOG10_2 = 0.301029995663981195213738894724; //Math.log10(2);
//export const FLT_RADIX = 2;
//export const CHAR_BIT = 8;
export const DBL_MAX_EXP = Math.log2(Number.MAX_VALUE);
export const DBL_MIN_EXP = Math.log2(Number.MIN_VALUE);
//export const FLT_MAX_EXP = DBL_MAX_EXP;
//export const FLT_MIN_EXP = DBL_MIN_EXP;
//export const sizeofInt =
//  4 * Math.ceil(Math.log(Number.MAX_SAFE_INTEGER) / Math.log(2) / 4 / CHAR_BIT);

export const R_D__1 = (logP: boolean) => {
  return logP ? 0 : 1.0;
};

export const R_D__0 = (logP: boolean): number => {
  return logP ? Number.NEGATIVE_INFINITY : 0.0;
};

export const R_DT_0 = (lower_tail: boolean, log_p: boolean): number => {
  return lower_tail ? R_D__0(log_p) : R_D__1(log_p);
};
export const R_DT_1 = (lower_tail: boolean, log_p: boolean): number => {
  return lower_tail ? R_D__1(log_p) : R_D__0(log_p);
};
export const R_D_val = (log_p: boolean, x: number) => {
  return log_p ? Math.log(x) : x;
};

export function R_D_Clog(log_p: boolean, p: number): number {
  return log_p ? Math.log1p(-p) : 0.5 - p + 0.5; /* [log](1-p) */
}

export function R_DT_val(lower_tail: boolean, log_p: boolean, x: number) {
  return lower_tail ? R_D_val(log_p, x) : R_D_Clog(log_p, x);
}

/*
export function rround(x: number) {
  if (x < 0) {
    return trunc(x - 0.5);
  }
  return trunc(x + 0.5);
}
*/
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

export function R_P_bounds_Inf_01(
  lowerTail: boolean,
  log_p: boolean,
  x: number
): number | undefined {
  if (!Number.isFinite(x)) {
    if (x > 0) {
      return R_DT_1(lowerTail, log_p);
    }
    return R_DT_0(lowerTail, log_p);
  }
  return undefined;
}

export function R_D_half(log_p: boolean) {
  return log_p ? -M_LN2 : 0.5; // 1/2 (lower- or upper tail)
}

export function R_P_bounds_01(
  lower_tail: boolean,
  log_p: boolean,
  x: number,
  x_min: number,
  x_max: number
): number | undefined {
  if (x <= x_min) return R_DT_0(lower_tail, log_p);
  if (x >= x_max) return R_DT_1(lower_tail, log_p);
  return undefined;
}

export const R_D_exp = (log_p: boolean, x: number): number => {
  return log_p ? x : Math.exp(x);
  /* exp(x) */
};

export enum ME {
  ME_NONE = 0, // no error
  ME_DOMAIN = 1, // argument out of domain
  ME_RANGE = 2, //  value out of range
  ME_NOCONV = 4, //process did not converge
  ME_PRECISION = 8, //does not have "full" precision
  ME_UNDERFLOW = 16 // and underflow occured (important for IEEE)
}
/*
export const min0 = (x: number, y: number): number => {
  return x <= y ? x : y;
};
export const max0 = (x: number, y: number): number => {
  return x <= y ? y : x;
};
*/
export const mapErr = new Map([
  [ME.ME_NONE, 'No error'],
  [ME.ME_DOMAIN, "argument out of domain in '%s'"],
  [ME.ME_RANGE, "argument out of domain in '%s'"],
  [ME.ME_NOCONV, "convergence failed in '%s'"],
  [ME.ME_PRECISION, "full precision may not have been achieved in '%s'"],
  [ME.ME_UNDERFLOW, "underflow occurred in '%s'"]
]);

export const ML_ERROR = (x: ME, s: any, printer: debug.IDebugger) => {
  const str = mapErr.get(x);
  if (str) {
    printer(str, s);
  }
};

export function ML_ERR_return_NAN(printer: debug.IDebugger) {
  ML_ERROR(ME.ME_DOMAIN, '', printer);
  return Number.NaN;
}

export function R_D_nonint_check(
  log: boolean,
  x: number,
  printer: debug.IDebugger
) {
  if (R_nonint(x)) {
    printer('non-integer x = %d', x);
    return R_D__0(log);
  }
  return undefined;
}

export function fmod(x: number, y: number): number {
  // 4.2 % 0.1 gives 0.099999999
  // this is wong so...
  return x - Math.trunc(x / y) * y;
}

export function imax2(x: number, y: number): number {
  return Math.trunc(Math.max(x, y));
}

export function isOdd(k: number) {
  return Math.floor(k) % 2 === 1;
}

export function epsilonNear(x: number, target: number): number {
  if (Number.isNaN(x)) return x;
  if (!isFinite(x)) return x;
  if (Number.isNaN(target)) return x;
  if (!isFinite(target)) return x;

  let diff = x - target;
  if (diff > Number.EPSILON || diff < -Number.EPSILON) {
    return x;
  }
  return target;
}

export function isEpsilonNear(x: number, target: number): boolean {
  if (isFinite(x) && isFinite(target)) return epsilonNear(x, target) === target;
  return false;
}

/*
export function Rf_d1mach(i: number): number {
  switch (i) {
    case 1:
      return Number.MIN_VALUE;
    case 2:
      return Number.MAX_VALUE;

    case 3:
      // = FLT_RADIX  ^ - DBL_MANT_DIG
      //  for IEEE:  = 2^-53 = 1.110223e-16 = .5*DBL_EPSILON 
      return 0.5 * Number.EPSILON;

    case 4:
      // = FLT_RADIX  ^ (1- DBL_MANT_DIG) =
      //     for IEEE:  = 2^-52 = DBL_EPSILON 
      return Number.EPSILON;

    case 5:
      return M_LOG10_2;

    default:
      return 0.0;
  }
}
*/
export function R_D_negInonint(x: number) {
  return x < 0.0 || R_nonint(x);
}

export function R_nonint(x: number) {
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

export function R_pow_di(x: number, n: number) {
  let pow: number = 1.0;

  if (Number.isNaN(x)) return x;
  if (n !== 0) {
    if (!Number.isFinite(x)) return R_pow(x, n);
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

//export const NA_REAL = ML_NAN;
//export const R_PosInf = ML_POSINF;
//export const R_NegInf = ML_NEGINF;

export function R_pow(x: number, y: number): number {
  /* = x ^ y */

  /* squaring is the most common of the specially handled cases so
       check for it first. */
  if (y === 2.0) return x * x;
  if (x === 1 || y === 0) return 1;
  if (x === 0) {
    if (y > 0) return 0;
    else if (y < 0) return Number.POSITIVE_INFINITY;
    else return y; /* NA or NaN, we assert */
  }
  if (Number.isFinite(x) && Number.isFinite(y)) {
    /* There was a special case for y == 0.5 here, but
           gcc 4.3.0 -g -O2 mis-compiled it.  Showed up with
           100^0.5 as 3.162278, example(pbirthday) failed. */
    return Math.pow(x, y);
  }
  if (Number.isNaN(x) || Number.isNaN(y)) return x + y;
  if (!Number.isFinite(x)) {
    if (x > 0)
      /* Inf ^ y */
      return y < 0 ? 0 : Number.POSITIVE_INFINITY;
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
        return x >= 1 ? Number.POSITIVE_INFINITY : 0; /* y == -Inf */
      else return x < 1 ? Number.POSITIVE_INFINITY : 0;
    }
  }
  return NaN; // all other cases: (-Inf)^{+-Inf, non-int}; (neg)^{+-Inf}
}

export const R_finite = (x: number) => !Number.isFinite(x);

/* C++ math header undefines any isnan macro. This file
   doesn't get C++ headers and so is safe. */
export const R_isnancpp = (x: number) => Number.isNaN(x);

export function myfmod(x1: number, x2: number) {
  let q = x1 / x2;
  return x1 - Math.floor(q) * x2;
}

export function R_powV(x: number, y: number): number /* = x ^ y */ {
  if (x === 1 || y === 0) return 1;
  if (x === 0) {
    if (y > 0) return 0;
    /* y < 0 */ return Number.POSITIVE_INFINITY;
  }
  if (Number.isFinite(x) && Number.isFinite(y)) return Math.pow(x, y);
  if (Number.isNaN(x) || Number.isNaN(y)) {
    return x + y;
  }
  if (!Number.isFinite(x)) {
    if (x > 0)
      /* Inf ^ y */
      return y < 0 ? 0 : Number.POSITIVE_INFINITY;
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
        return x >= 1 ? Number.POSITIVE_INFINITY : 0; /* y == -Inf */
      else return x < 1 ? Number.POSITIVE_INFINITY : 0;
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
    return Number.POSITIVE_INFINITY;
  }
  return x * Math.pow(2, y);
}

/*
export function Rf_i1mach(i: number): number {
  switch (i) {
    case 1:
      return 5;
    case 2:
      return 6;
    case 3:
      return 0;
    case 4:
      return 0;

    case 5:
      return CHAR_BIT * sizeofInt;
    case 6:
      return sizeofInt;

    case 7:
      return 2;
    case 8:
      return CHAR_BIT * sizeofInt - 1;
    case 9:
      return INT_MAX;

    case 10:
      return FLT_RADIX;

    case 11:
      return FLT_MANT_DIG;
    case 12:
      return FLT_MIN_EXP;
    case 13:
      return FLT_MAX_EXP;

    case 14:
      return DBL_MANT_DIG;
    case 15:
      return DBL_MIN_EXP;
    case 16:
      return DBL_MAX_EXP;

    default:
      return 0;
  }
}
*/

/*
export function iF77_NAME(i: number) {
  return Rf_i1mach(i);
}
*/

export function R_D_log(log_p: boolean, p: number) {
  return log_p ? p : Math.log(p); /* log(p) */
}

export function R_Q_P01_boundaries(
  lower_tail: boolean,
  log_p: boolean,
  p: number,
  _LEFT_: number,
  _RIGHT_: number
): number | undefined {
  if (log_p) {
    if (p > 0) {
      return ML_ERR_return_NAN(debug_R_Q_P01_boundaries);
    }
    if (p === 0)
      /* upper bound*/
      return lower_tail ? _RIGHT_ : _LEFT_;
    if (p === Number.NEGATIVE_INFINITY) return lower_tail ? _LEFT_ : _RIGHT_;
  } else {
    /* !log_p */
    if (p < 0 || p > 1) {
      return ML_ERR_return_NAN(debug_R_Q_P01_boundaries);
    }
    if (p === 0) return lower_tail ? _LEFT_ : _RIGHT_;
    if (p === 1) return lower_tail ? _RIGHT_ : _LEFT_;
  }
  return undefined;
}

export function R_Q_P01_check(logP: boolean, p: number): number | undefined {
  if ((logP && p > 0) || (!logP && (p < 0 || p > 1))) {
    return ML_ERR_return_NAN(debug_R_Q_P01_check);
  }
  return undefined;
}

//#define R_D_qIv(p)	(log_p	? exp(p) : (p))		/*  p  in qF(p,..) */
export function R_D_qIv(logP: boolean, p: number) {
  return logP ? Math.exp(p) : p;
}
