import { R_P_bounds_01 } from '@lib/r-func';
import pnbeta2 from './pnbeta2';

export default function pnbeta(x: number, a: number, b: number, ncp: number, lower_tail: boolean, log_p: boolean): number {
    if (isNaN(x) || isNaN(a) || isNaN(b) || isNaN(ncp)) {
        return x + a + b + ncp;
    }

    const rc = R_P_bounds_01(lower_tail, log_p, x, 0, 1);
    if (rc !== undefined) {
        return rc;
    }
    return pnbeta2(x, 1 - x, a, b, ncp, lower_tail, log_p);
}
