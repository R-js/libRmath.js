// find more constants of the kind M_XX_XX here
// https://svn.r-project.org/R/trunk/src/include/Rmath.h0.in


/*

  WHY DO WE USE CUSTOM ROUND INSTEAD OF Javascript "Math.round" ?
  
  https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Math/round

  Note that this differs from many languages' round() functions, which often round this case to the next integer away from zero, instead (giving a different result in the case of negative numbers with a fractional part of exactly 0.5).

*/



export const sqr = (x: number) => x * x;
export const ceil = Math.ceil;
export const trunc = Math.trunc;
export const log10 = Math.log10;
export const LONG_MAX = Number.MAX_SAFE_INTEGER;
export const DBL_MAX_10_EXP = Math.log10(Number.MAX_VALUE);
export const MAX_DIGITS = DBL_MAX_10_EXP;
export const INT_MAX = Number.MAX_SAFE_INTEGER;
export const INT_MIN = Number.MIN_SAFE_INTEGER;

export function rround(x: number) {

    if (x < 0) {
        return trunc(x - 0.5);
    }
    return trunc(x + 0.5);
}

export function imin2(x: number, y: number): number {
    return (x < y) ? x : y;
}


/* 
    nearbyint is C99, so all platforms should have it (and AFAIK, all do) 
*/
export const DBL_MANT_DIG = 18;
export const FLT_MANT_DIG = DBL_MANT_DIG;
export const M_LN2 = 0.693147180559945309417232121458;	/* ln(2) */
export const M_1_SQRT_2PI = 0.398942280401432677939946059934;
export const nearbyint = rround;
export const R_forceint = nearbyint;
export const R_rint = nearbyint;

export const M_2PI = 6.283185307179586476925286766559;
export const M_LN_2PI = 1.837877066409345483560659472811;
export const sqrt = Math.sqrt;
export const DBL_EPSILON = 1E-16; //true for javascript, this was tested
export const sinh = Math.sinh;
export const DBL_MAX = Number.MAX_VALUE;
export const exp = Math.exp;

export const isInteger = Number.isInteger;
export const sin = Math.sin;
export const cos = Math.cos;
export const pow = Math.pow;

export const M_1_PI = 1.0 / Math.PI;

export const R_FINITE = (x: number) => Number.isFinite(x);
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
export const M_PI_2 = Math.PI / 2;
export const M_LN_SQRT_PI = 0.5723649429247; // log(sqrt(pi)) 
export const M_LN_SQRT_2PI = 0.918938533204672741780329736406; // log(sqrt(2*pi)) 
export const M_LN_SQRT_PId2 = 0.225791352644727432363097614947;	// log(sqrt(pi/2)) 
export const M_LN10 =  2.30258509299404568402	/* log_e 10 */

export const R_D__1 = (log_p: boolean) => {
    return log_p ? 0. : 1.0;
};

export const R_D__0 = (log: boolean): number => {
    return log ? ML_NEGINF : 0.0;
};

export const ML_VALID = (x: number) => !ISNAN(x);

export function R_P_bounds_Inf_01(lower_tail: boolean, log_p: boolean, x: number): number | undefined {
    if (!R_FINITE(x)) {
        if (x > 0) {
            return R_DT_1(lower_tail, log_p);
        }
        return R_DT_0(lower_tail, log_p);
    }
    return undefined;
}



export function R_D_Lval(lower_tail: boolean, p: number): number {
    return (lower_tail ? (p) : (0.5 - (p) + 0.5))	/*  p  */
}

export function R_P_bounds_01(lower_tail: boolean, log_p: boolean, x: number, x_min: number, x_max: number): number | undefined {
    if (x <= x_min) return R_DT_0(lower_tail, log_p);
    if (x >= x_max) return R_DT_1(lower_tail, log_p);
    return undefined;
}

export const R_DT_0 = (lower_tail: boolean, log_p: boolean): number => {
    return lower_tail ? R_D__0(log_p) : R_D__1(log_p);
};
export const R_DT_1 = (lower_tail: boolean, log_p: boolean): number => {
    return lower_tail ? R_D__1(log_p) : R_D__0(log_p);
};
export const R_D_val = (log_p: boolean, x: number) => {
    return (log_p ? log(x) : (x));
};


export const R_D_exp = (log_p: boolean, x: number): number => {

    return (log_p ? (x) : exp(x));
    /* exp(x) */
}

export const floor = Math.floor;

export const M_SQRT_2dPI = 0.797884560802865355879892119869; // sqrt(2/pi) 

export const M_LOG10_2 = 0.301029995663981195213738894724;

export enum ME {
    ME_NONE = 0, // no error
    ME_DOMAIN = 1, // argument out of domain
    ME_RANGE = 2, //  value out of range
    ME_NOCONV = 4, //process did not converge
    ME_PRECISION = 8, //does not have "full" precision 
    ME_UNDERFLOW = 16 // and underflow occured (important for IEEE)
}

export const MATHLIB_WARNING = function (fmt: string, x: any) {
    console.warn(fmt, x);
};

export const MATHLIB_WARNING2 = function (fmt: string, x: any, x2: any) {
    console.warn(fmt, x, x2);
};

export const MATHLIB_WARNING4 = function (fmt: string, x: any, x2: any, x3: any, x4: any) {
    console.warn(fmt, x, x2, x3, x4);
};

export const min0 = (x: number, y: number): number => { return x <= y ? x : y; };
export const max0 = (x: number, y: number): number => { return x <= y ? y : x; };

export const ML_ERROR = (x: ME, s: any) => {
    if (x > ME.ME_DOMAIN) {
        let msg: string;
        switch (x) {
            case ME.ME_DOMAIN:
                msg = "argument out of domain in '%s'\n";
                break;
            case ME.ME_RANGE:
                msg = "value out of range in '%s'\n";
                break;
            case ME.ME_NOCONV:
                msg = "convergence failed in '%s'\n";
                break;
            case ME.ME_PRECISION:
                msg = "full precision may not have been achieved in '%s'\n";
                break;
            case ME.ME_UNDERFLOW:
                msg = "underflow occurred in '%s'\n";
                break;
            default:
                msg = '';
        }
        MATHLIB_WARNING(msg, s);
    }
}

export function ML_ERR_return_NAN() {
    ML_ERROR(ME.ME_DOMAIN, '');
    return ML_NAN;
}

export function R_D_nonint_check(log: boolean, x: number) {
    if (R_nonint(x)) {
        MATHLIB_WARNING('non-integer x = %f', x);
        return R_D__0(log);
    }
    return undefined;
}


export function fabs(x: number) {
    return (x < 0 ? -x : x);
}

export function fmod(x: number, y: number): number {
    return x % y;
}

export function fmax2(x: number, y: number): number {
    if (ISNAN(x) || ISNAN(y)) {
        return x + y;
    }
    return (x < y) ? y : x;
}

export function fmin2(x: number, y: number): number {
    if (ISNAN(x) || ISNAN(y)) {
        return x + y;
    }
    return (x < y) ? x : y;
}

export function isOdd(k: number) {
    return (floor(k) % 2) === 1;
}


export function Rf_d1mach(i: number): number {

    switch (i) {
        case 1: return DBL_MIN;
        case 2: return DBL_MAX;

        case 3: /* = FLT_RADIX  ^ - DBL_MANT_DIG
          for IEEE:  = 2^-53 = 1.110223e-16 = .5*DBL_EPSILON */
            return 0.5 * DBL_EPSILON;

        case 4: /* = FLT_RADIX  ^ (1- DBL_MANT_DIG) =
          for IEEE:  = 2^-52 = DBL_EPSILON */
            return DBL_EPSILON;

        case 5: return M_LOG10_2;

        default: return 0.0;
    }
}

export function dF77_NAME(i: number): number {
    return Rf_d1mach(i);
}

export function R_D_negInonint(x: number) {
    return x < 0.0 || R_nonint(x);
}

export function R_nonint(x: number) {
    return (fabs((x) - R_forceint(x)) > 1e-7 * fmax2(1., fabs(x)))
}

export function R_D_fexp(give_log: boolean, f: number, x: number): number {
    return (give_log ? -0.5 * log(f) + (x) : exp(x) / sqrt(f));
}


/** bessel section */
/** bessel section */
/** bessel section */

export const nsig_BESS = 16;
export const ensig_BESS = 1e16;
export const rtnsig_BESS = 1e-4;
export const enmten_BESS = 8.9e-308;
export const enten_BESS = 1e308;

export const exparg_BESS = 709.;
export const xlrg_BESS_IJ = 1e5;
export const xlrg_BESS_Y = 1e8;
export const thresh_BESS_Y = 16.;

export const xmax_BESS_K = 705.342/* maximal x for UNscaled answer */


/* sqrt(DBL_MIN) =	1.491668e-154 */
export const sqxmin_BESS_K = 1.49e-154;

/* x < eps_sinc	 <==>  sin(x)/x == 1 (particularly "==>");
  Linux (around 2001-02) gives 2.14946906753213e-08
  Solaris 2.5.1		 gives 2.14911933289084e-08
*/
export const M_eps_sinc = 2.149e-8;


export function R_pow_di(x: number, n: number) {
    let pow: number = 1.0;

    if (ISNAN(x)) return x;
    if (n != 0) {
        if (!R_FINITE(x)) return R_pow(x, n);
        if (n < 0) { n = -n; x = 1 / x; }
        for (; ;) {
            if (n & 1) pow *= x;
            if (n >>= 1) x *= x; else break;
        }
    }
    return pow;
}

export function R_pow(x: number, y: number): number { /* = x ^ y */

    /* squaring is the most common of the specially handled cases so
       check for it first. */
    if (y == 2.0)
        return x * x;
    if (x == 1. || y == 0.)
        return (1.);
    if (x == 0.) {
        if (y > 0.) return (0.);
        else if (y < 0) return (ML_POSINF);
        else return (y); /* NA or NaN, we assert */
    }
    if (R_FINITE(x) && R_FINITE(y)) {
        /* There was a special case for y == 0.5 here, but
           gcc 4.3.0 -g -O2 mis-compiled it.  Showed up with
           100^0.5 as 3.162278, example(pbirthday) failed. */
        return pow(x, y);
    }
    if (ISNAN(x) || ISNAN(y))
        return (x + y);
    if (!R_FINITE(x)) {
        if (x > 0)               /* Inf ^ y */
            return (y < 0.) ? 0. : ML_POSINF;
        else {                  /* (-Inf) ^ y */
            if (R_FINITE(y) && y == floor(y)) /* (-Inf) ^ n */
                return (y < 0.) ? 0. : (myfmod(y, 2.) ? x : -x);
        }
    }
    if (!R_FINITE(y)) {
        if (x >= 0) {
            if (y > 0)           /* y == +Inf */
                return (x >= 1) ? R_PosInf : 0.;
            else                /* y == -Inf */
                return (x < 1) ? R_PosInf : 0.;
        }
    }
    return NaN; // all other cases: (-Inf)^{+-Inf, non-int}; (neg)^{+-Inf}
}


export const R_finite = (x: number) => !Number.isFinite(x);

/* C++ math header undefines any isnan macro. This file
   doesn't get C++ headers and so is safe. */
export const R_isnancpp = (x: number) => ISNAN(x);

export function myfmod(x1: number, x2: number) {

    let q = x1 / x2;
    return x1 - floor(q) * x2;
}


export function R_powV(x: number, y: number): number /* = x ^ y */ {
    if (x == 1. || y == 0.)
        return (1.);
    if (x == 0.) {
        if (y > 0.) return (0.);
    /* y < 0 */return (ML_POSINF);
    }
    if (R_FINITE(x) && R_FINITE(y))
        return (pow(x, y));
    if (ISNAN(x) || ISNAN(y)) {
        return (x + y);
    }
    if (!R_FINITE(x)) {
        if (x > 0)		/* Inf ^ y */
            return ((y < 0.) ? 0. : ML_POSINF);
        else {			/* (-Inf) ^ y */
            if (R_FINITE(y) && y == floor(y)) /* (-Inf) ^ n */
                return ((y < 0.) ? 0. : (myfmod(y, 2.) ? x : -x));
        }
    }
    if (!R_FINITE(y)) {
        if (x >= 0) {
            if (y > 0)		/* y == +Inf */
                return ((x >= 1) ? ML_POSINF : 0.);
            else		/* y == -Inf */
                return ((x < 1) ? ML_POSINF : 0.);
        }
    }
    return (ML_NAN);		/* all other cases: (-Inf)^{+-Inf,
                   non-int}; (neg)^{+-Inf} */
}


export const NA_REAL = ML_NAN;
export const R_PosInf = ML_POSINF;
export const R_NegInf = ML_NEGINF;

export function REprintf(fmt: string, ...args: any[]) {
    let args2 = Array.from(args);//.slice(1);
    console.error.call(console.error, fmt, args2);
}


//  return x * Math.pow(2,y)
export function ldexp(x: number, y: number): number {


    if (ISNAN(x) || ISNAN(y)) {
        return (x + y);
    }
    if (!R_FINITE(x) || !R_FINITE(y)) {
        return ML_POSINF;
    }
    return x * Math.pow(2, y);

}

export const FLT_RADIX = 2;
export const CHAR_BIT = 8;
export const DBL_MAX_EXP = Math.log2(Number.MAX_VALUE);
export const DBL_MIN_EXP = Math.log2(Number.MIN_VALUE);
export const FLT_MAX_EXP = DBL_MAX_EXP;
export const FLT_MIN_EXP = DBL_MIN_EXP;
export const sizeofInt = 4 * Math.ceil(Math.log(Number.MAX_SAFE_INTEGER) / Math.log(2) / 4 / CHAR_BIT);

export function Rf_i1mach(i: number): number {

    switch (i) {
        case 1: return 5;
        case 2: return 6;
        case 3: return 0;
        case 4: return 0;

        case 5: return CHAR_BIT * sizeofInt;
        case 6: return sizeofInt;

        case 7: return 2;
        case 8: return CHAR_BIT * sizeofInt - 1;
        case 9: return INT_MAX;

        case 10: return FLT_RADIX;

        case 11: return FLT_MANT_DIG;
        case 12: return FLT_MIN_EXP;
        case 13: return FLT_MAX_EXP;

        case 14: return DBL_MANT_DIG;
        case 15: return DBL_MIN_EXP;
        case 16: return DBL_MAX_EXP;

        default: return 0;
    }
}

export function iF77_NAME(i: number) {
    return Rf_i1mach(i);
}


export const ftrunc = trunc;

export const atanpi = (x: number) => {
    return Math.atan(x) / Math.PI;
}


export function R_D_log(log_p: boolean, p: number) {
    return (log_p ? (p) : log(p))	/* log(p) */
}

