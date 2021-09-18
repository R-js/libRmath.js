/// <reference types="debug" />
export declare enum ME {
    ME_NONE = 0,
    ME_DOMAIN = 1,
    ME_RANGE = 2,
    ME_NOCONV = 4,
    ME_PRECISION = 8,
    ME_UNDERFLOW = 16
}
export declare const mapErr: Map<ME, string>;
export declare function ML_ERROR(x: ME, s: unknown, printer: (...args: unknown[]) => void): void;
export declare function ML_ERR_return_NAN(printer: debug.IDebugger): number;
export declare function R_Q_P01_boundaries(lower_tail: boolean, log_p: boolean, p: number, _LEFT_: number, _RIGHT_: number): number | undefined;
export declare function R_Q_P01_check(logP: boolean, p: number): number | undefined;
//# sourceMappingURL=logger.d.ts.map