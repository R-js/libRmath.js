import { debug } from '@mangos/debug';
import {ML_ERR_return_NAN2, lineInfo4  } from '@common/logger';

const printer = debug('chebyshev_eval');

/*
export function chebyshev_init(dos: number[], nos: number, eta: number): number {
    let retCode = 0;
    //let ii: number;
    let err: number;

    if (nos < 1) return 0;

    err = 0.0;

    for (let ii = 1; ii <= nos; ii++) {
        retCode = nos - ii;
        err += abs(dos[retCode]);
        if (err > eta) {
            return retCode;
        }
    }
    return retCode;
}
*/
export function chebyshev_eval(x: number, a: number[], n: number): number {
    let b0: number;
    let b1: number;
    let b2: number;
    let i: number;

    if (n < 1 || n > 1000) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    if (x < -1.1 || x > 1.1) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    const twox = x * 2;
    b2 = b1 = 0;
    b0 = 0;
    for (i = 1; i <= n; i++) {
        b2 = b1;
        b1 = b0;
        b0 = twox * b1 - b2 + a[n - i];
    }
    return (b0 - b2) * 0.5;
}
