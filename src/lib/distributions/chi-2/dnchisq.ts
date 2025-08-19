import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_D__0, R_D_val } from '@lib/r-func';

import { dchisq } from './dchisq';
import { dpois_raw } from '@dist/poisson/dpois';

const printer_dnchisq = createNS('dnchisq');
const eps = 5e-15;

export function dnchisq(x: number, df: number, ncp: number, give_log: boolean): number {
    let i: number;
    //let ncp2: number;
    let q: number;
    let mid: number;
    let dfmid: number;
    let imax: number;
    let sum: number;
    let term: number;

    if (isNaN(x) || isNaN(df) || isNaN(ncp)) {
        return x + df + ncp;
    }

    if (!isFinite(df) || !isFinite(ncp) || ncp < 0 || df < 0) {
        return ML_ERR_return_NAN2(printer_dnchisq);
    }

    if (x < 0) {
        return R_D__0(give_log);
    }
    if (x === 0 && df < 2) return Infinity;
    if (ncp === 0) return df > 0 ? dchisq(x, df, give_log) : R_D__0(give_log);
    if (x === Infinity) return R_D__0(give_log);

    const ncp2 = 0.5 * ncp;

    /* find max element of sum */
    // at this point:
    // 1. ncp is never negative, or infinity or nan
    // 2. x is never negative or infinity or nan
    // 3. df is never infinity, nan or negative
    // example:
    // if df=20 and ncp=8 , x=19
    //   then imax=NaN
    imax = Math.ceil((-(2 + df) + Math.sqrt((2 - df) * (2 - df) + 4 * ncp * x)) / 4);
    if (imax < 0) imax = 0;
    //
    if (isFinite(imax)) {
        dfmid = df + 2 * imax;
        mid = dpois_raw(imax, ncp2, false) * dchisq(x, dfmid, false);
    } else {
        throw new Error(`Internal Error IE989: imax=${imax}`);
        /*
        
        if (give_log || ncp > 1000) {
            const nl = df + ncp;
            const ic = nl / (nl + ncp); // = "1/(1+b)" Abramowitz & St
            return dchisq(x * ic, nl * ic, give_log);
        } else return R_D__0(give_log);
        */
    }

    sum = mid;

    /* errorbound := term * q / (1-q)  now subsumed in while() / if() below: */

    /* upper tail */
    term = mid;
    df = dfmid;
    i = imax;
    const x2 = x * ncp2;
    do {
        i++;
        q = x2 / i / df;
        df += 2;
        term *= q;
        sum += term;
    } while (q >= 1 || term * q > (1 - q) * eps || term > 1e-10 * sum);
    /* lower tail */
    term = mid;
    df = dfmid;
    i = imax;
    while (i !== 0) {
        df -= 2;
        q = (i * df) / x2;
        i--;
        term *= q;
        sum += term;
        if (q < 1 && term * q <= (1 - q) * eps) break;
    }
    return R_D_val(give_log, sum);
}
