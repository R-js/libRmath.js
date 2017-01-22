

export const R_FINITE = (x: number) => Number.isFinite(x);
export const NaN = Number.NaN;
export const FLT_MIN = 2.22507e-308; //10^24  larger then Number.MIN_VALUE
export const DBL_MIN = FLT_MIN;
export const log = Math.log;
export const ISNAN = Number.isNaN;
export const ML_NAN = NaN;
export const ML_POSINF = Number.POSITIVE_INFINITY;
export const ML_NEGINF = Number.NEGATIVE_INFINITY;
export const M_PI = 3.14159265358979323846264338327950288;
export const M_LN_SQRT_2PI = 0.918938533204672741780329736406 // log(sqrt(2*pi)) 
export const M_LN_SQRT_PId2 =	0.225791352644727432363097614947	// log(sqrt(pi/2)) 

export enum ME {
    ME_NONE = 0,// no error
    ME_DOMAIN = 1, // argument out of domain
    ME_RANGE = 2,//  value out of range
    ME_NOCONV = 4,//process did not converge
    ME_PRECISION = 8,//does not have "full" precision 
    ME_UNDERFLOW = 16// and underflow occured (important for IEEE)
}

export const MATHLIB_WARNING = function (fmt: string, x: any) {
    console.warn(fmt, x);
}

export const MATHLIB_WARNING2 = function (fmt: string, x: any, x2: any) {
    console.warn(fmt, x, x2);
}


export const ML_ERROR = (x: ME, s: any) => {
    if (x > ME.ME_DOMAIN) {
        let msg: string = "";
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