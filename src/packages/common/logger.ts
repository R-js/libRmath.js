import { debug } from 'debug';
import type { Debugger } from 'debug';

import type { Printer } from '@mangos/debug';
import { getLineInfo } from '@mangos/debug';

const debug_R_Q_P01_boundaries = debug('R_Q_P01_boundaries');
const debug_R_Q_P01_check = debug('R_Q_P01_check');


export function createLineInfo(n: number){
    return function () {
     const info = getLineInfo(n);
     return info.fnName + ', line:' + info.line + ', col:' + info.column;
    }
}

const lineInfo4 = createLineInfo(4);
export { lineInfo4 };

export enum ME {
    ME_NONE = 0, // no error
    ME_DOMAIN = 1, // argument out of domain
    ME_RANGE = 2, //  value out of range
    ME_NOCONV = 4, //process did not converge
    ME_PRECISION = 8, //does not have "full" precision
    ME_UNDERFLOW = 16, // and underflow occured (important for IEEE)
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
    [ME.ME_RANGE, "argument out of range in '%s'"],
    [ME.ME_NOCONV, "convergence failed in '%s'"],
    [ME.ME_PRECISION, "full precision may not have been achieved in '%s'"],
    [ME.ME_UNDERFLOW, "underflow occurred in '%s'"],
]);

export function ML_ERROR(x: ME, s: unknown, printer: (...args: unknown[]) => void): void {
    const str = mapErr.get(x);
    if (str) {
        printer(str, s);
    }
}

export function ML_ERR_return_NAN(printer: Debugger): number {
    ML_ERROR(ME.ME_DOMAIN, '', printer);
    return NaN;
}

export function ML_ERROR2(x: ME, s: any, printer: Printer): void {
    if (printer.enabled === false) {
        return;
    }
    const str = mapErr.get(x);
    if (typeof s === 'function'){
        s = s();
    }
    if (str) {
        printer(str, s);
    }
}

export function ML_ERR_return_NAN2(printer: Printer, getExtraInfo: () => any): number {
    if (printer.enabled) {
      ML_ERROR2(ME.ME_DOMAIN, getExtraInfo(), printer);
    }
    return NaN;
}

export function R_Q_P01_boundaries(
    lower_tail: boolean,
    log_p: boolean,
    p: number,
    _LEFT_: number,
    _RIGHT_: number,
): number | undefined {
    if (log_p) {
        if (p > 0) {
            return ML_ERR_return_NAN(debug_R_Q_P01_boundaries);
        }
        if (p === 0)
            /* upper bound*/
            return lower_tail ? _RIGHT_ : _LEFT_;
        if (p === -Infinity) return lower_tail ? _LEFT_ : _RIGHT_;
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
    if (
        (logP && p > 0) 
        || 
        (!logP && (p < 0 || p > 1))) {
        return ML_ERR_return_NAN(debug_R_Q_P01_check);
    }
    return undefined;
}
