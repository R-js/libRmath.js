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
export const R_D__0 = (log: boolean) => { return log ? ML_NEGINF : 0.0; };
export const floor = Math.floor;
export const trunc = Math.trunc;
export const M_SQRT_2dPI = 0.797884560802865355879892119869; // sqrt(2/pi) 
export const R_D_exp = (x: any, logP: any) => { return !!logP ? (x) : Math.exp(x); }; /* exp(x) */
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

export function fabs(x: number) {
    return (x < 0 ? -x : x);
}

export function fmod(x: number, y: number): number {
    return x % y;
}

export function fmax2(x: number, y: number) {
    if (ISNAN(x) || ISNAN(y)) {
        return x + y;
    }
    return (x < y) ? y : x;
}

export function isOdd(k: number) {
    return (floor(k) % 2) === 1;
} 
