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
    [ME.ME_RANGE, "argument out of domain in '%s'"],
    [ME.ME_NOCONV, "convergence failed in '%s'"],
    [ME.ME_PRECISION, "full precision may not have been achieved in '%s'"],
    [ME.ME_UNDERFLOW, "underflow occurred in '%s'"],
]);

export const ML_ERROR = (x: ME, s: any, printer: (...args: any[]) => void) => {
    const str = mapErr.get(x);
    if (str) {
        printer(str, s);
    }
};

export function ML_ERR_return_NAN(printer: debug.IDebugger) {
    ML_ERROR(ME.ME_DOMAIN, '', printer);
    return Number.NaN;
}
