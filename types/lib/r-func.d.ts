/// <reference types="debug" />
export declare type strTypes = 'boolean' | 'number' | 'undefined' | 'string' | 'null' | 'symbol' | 'array' | 'function' | 'object';
export declare type system = boolean | number | undefined | string | null | symbol;
export declare function sum(x: number[]): number;
export interface ISummary {
    N: number;
    mu: number;
    population: {
        variance: number;
        sd: number;
    };
    sample: {
        variance: number;
        sd: number;
    };
    relX: number[];
    relX2: number[];
    stats: {
        min: number;
        '1st Qu.': number;
        median: number;
        '3rd Qu.': number;
        max: number;
    };
}
export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
export declare function Welch_Satterthwaite(s: number[], n: number[]): number;
export declare function repeatedCall<F extends (...args: any[]) => number>(n: number, fn: F, ...arg: Parameters<F>): Float32Array;
export declare function repeatedCall64<F extends (...args: any[]) => number>(n: number, fn: F, ...args: Parameters<F>): Float64Array;
export declare type Slicee<T> = {
    [P in keyof T]: T[P];
};
export declare type Sliced<T> = {
    key: keyof T;
    value: T[keyof T];
};
export declare const emptyFloat32Array: Float32Array;
export declare const emptyFloat64Array: Float64Array;
export declare const nanFloat32Array: Float32Array;
export declare type NumArray = number[] | Float32Array | Float64Array;
export declare function isArray(x: unknown): boolean;
export declare function matchFloatType(n: number, ...a: (NumArray | undefined)[]): Float32Array | Float64Array;
export declare function isEmptyArray(x: NumArray): boolean;
export declare const M_SQRT2 = 1.4142135623730951;
export declare function frac(x: number): number;
export declare const M_SQRT_32 = 5.656854249492381;
export declare const DBL_EPSILON = 2.220446049250313e-16;
export declare const DBL_MANT_DIG = 18;
export declare const DBL_MIN = 2.2250738585072014e-308;
export declare const M_LN2 = 0.6931471805599453;
export declare const M_1_SQRT_2PI = 0.3989422804014327;
export declare const M_2PI = 6.283185307179586;
export declare const M_LN_2PI = 1.8378770664093456;
export declare const M_1_PI: number;
export declare const M_PI_2: number;
export declare const M_LN_SQRT_PI = 0.5723649429247001;
export declare const INT_MAX: number;
export declare const M_LN_SQRT_2PI = 0.9189385332046728;
export declare const M_LN_SQRT_PId2 = 0.22579135264472744;
export declare const M_SQRT_2dPI = 0.7978845608028654;
export declare const M_LOG10_2 = 0.3010299956639812;
export declare const DBL_MAX_EXP: number;
export declare const DBL_MIN_EXP: number;
export declare function R_D__1(logP: boolean): number;
export declare const R_D__0: (logP: boolean) => number;
export declare const R_DT_0: (lower_tail: boolean, log_p: boolean) => number;
export declare const R_DT_1: (lower_tail: boolean, log_p: boolean) => number;
export declare function R_D_val(log_p: boolean, x: number): number;
export declare function R_D_Clog(log_p: boolean, p: number): number;
export declare function R_DT_val(lower_tail: boolean, log_p: boolean, x: number): number;
export declare function imin2(x: number, y: number): number;
export declare function R_D_Lval(lowerTail: boolean, p: number): number;
export declare function R_D_Cval(lowerTail: boolean, p: number): number;
export declare function R_P_bounds_Inf_01(lowerTail: boolean, log_p: boolean, x: number): number | undefined;
export declare function R_D_half(log_p: boolean): number;
export declare function R_P_bounds_01(lower_tail: boolean, log_p: boolean, x: number, x_min: number, x_max: number): number | undefined;
export declare const R_D_exp: (log_p: boolean, x: number) => number;
export declare function R_D_nonint_check(log: boolean, x: number, printer: debug.IDebugger): number | undefined;
export declare function fmod(x: number, y: number): number;
export declare function imax2(x: number, y: number): number;
export declare function isOdd(k: number): boolean;
export declare function R_D_negInonint(x: number): boolean;
export declare function R_nonint(x: number): boolean;
export declare function R_D_fexp(give_log: boolean, f: number, x: number): number;
export declare function R_pow_di(x: number, n: number): number;
export declare function R_pow(x: number, y: number): number;
export declare function R_isnancpp(x: number): boolean;
export declare function myfmod(x1: number, x2: number): number;
export declare function ldexp(x: number, y: number): number;
export declare function R_D_log(log_p: boolean, p: number): number;
export declare function R_D_qIv(logP: boolean, p: number): number;
export declare function sumfp(x: Float32Array): number;
//# sourceMappingURL=r-func.d.ts.map