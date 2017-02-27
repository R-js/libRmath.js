// find more constants of the kind M_XX_XX here
// https://svn.r-project.org/R/trunk/src/include/Rmath.h0.in


/*

  WHY DO WE USE CUSTOM ROUND INSTEAD OF Javascript "Math.round" ?
  
  https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Math/round

  Note that this differs from many languages' round() functions, which often round this case to the next integer away from zero, instead (giving a different result in the case of negative numbers with a fractional part of exactly 0.5).

*/

export const trunc = Math.trunc;

export function rround(x: number) {

    if (x < 0) {
        return trunc(x - 0.5);
    }
    return trunc(x + 0.5);
}


/* 
    nearbyint is C99, so all platforms should have it (and AFAIK, all do) 
*/
export const DBL_MANT_DIG = 18;
export const DBL_MIN_EXP = trunc(Math.log10(Number.MIN_VALUE));
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
export const rtnsig_BESS = 1e-4;
export const enten_BESS = 1e308;
export const xlrg_BESS_IJ = 1e5;
export const enmten_BESS = 8.9e-308;
export const isInteger = Number.isInteger;
export const sin = Math.sin;
export const cos = Math.cos;
export const pow = Math.pow;
export const ensig_BESS = 1e16;
export const M_1_PI = 1.0 / Math.PI;
export const sqxmin_BESS_K = 1.49e-154;
export const xmax_BESS_K = 705.342;/* maximal x for UNscaled answer */
export const R_FINITE = (x: number) => Number.isFinite(x);
export const NaN = Number.NaN;
export const FLT_MIN = 2.22507e-308; //10^24  larger then Number.MIN_VALUE
export const DBL_MIN = FLT_MIN;
export const xlrg_BESS_Y = 1e8;
export const log = Math.log;
export const ISNAN = Number.isNaN;
export const thresh_BESS_Y = 16.;
export const M_eps_sinc = 2.149e-8;
export const ML_NAN = NaN;
export const round = Math.round;
export const ML_POSINF = Number.POSITIVE_INFINITY;
export const ML_NEGINF = Number.NEGATIVE_INFINITY;
export const M_PI = 3.14159265358979323846264338327950288;
export const M_PI_2 = Math.PI / 2;
export const M_LN_SQRT_2PI = 0.918938533204672741780329736406; // log(sqrt(2*pi)) 
export const M_LN_SQRT_PId2 = 0.225791352644727432363097614947;	// log(sqrt(pi/2)) 

export const R_D__1 = (log_p: boolean) => {
    return log_p ? 0. : 1.0;
};

export const R_D__0 = (log: boolean): number => {
    return log ? ML_NEGINF : 0.0;
};
export const R_DT_0 = (lower_tail: boolean, log: boolean, log_p: boolean): number => {
    return lower_tail ? R_D__0(log) : R_D__1(log_p);
};
export const R_DT_1 = (lower_tail: boolean, log: boolean, log_p: boolean): number => {
    return lower_tail ? R_D__1(log) : R_D__0(log_p);
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

export function F77_NAME(i: number): number {
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
