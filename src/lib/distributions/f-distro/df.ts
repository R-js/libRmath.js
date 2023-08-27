import createNS from '@mangos/debug-frontend';

import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { R_D__0, R_D__1 } from '@lib/r-func';
import { dbinom_raw } from '@dist/binomial/dbinom';
import { dgamma } from '@dist/gamma/dgamma';

const printer_df = debug('df');

export function df(x: number, m: number, n: number, giveLog: boolean): number {
    let f: number;
    let dens: number;

    if (isNaN(x) || isNaN(m) || isNaN(n)) {
        return x + m + n;
    }
    if (m <= 0 || n <= 0) {
        return ML_ERR_return_NAN2(printer_df, lineInfo4);
    }
    if (x < 0) {
        return R_D__0(giveLog);
    }
    if (x === 0) {
        return m > 2 ? R_D__0(giveLog) : m === 2 ? R_D__1(giveLog) : Infinity;
    }
    if (!isFinite(m) && !isFinite(n)) {
        /* both +Inf */
        if (x === 1) {
            return Infinity;
        } else {
            return R_D__0(giveLog);
        }
    }
    if (!isFinite(n)) {
        /* must be +Inf by now */
        return dgamma(x, m / 2, 2 / m, giveLog);
    }
    if (m > 1e14) {
        /* includes +Inf: code below is inaccurate there */
        dens = dgamma(1 / x, n / 2, 2 / n, giveLog);
        return giveLog ? dens - 2 * Math.log(x) : dens / (x * x);
    }

    f = 1 / (n + x * m);
    const q = n * f;
    const p = x * m * f;

    if (m >= 2) {
        f = (m * q) / 2;
        dens = dbinom_raw((m - 2) / 2, (m + n - 2) / 2, p, q, giveLog);
    } else {
        f = (m * m * q) / (2 * p * (m + n));
        dens = dbinom_raw(m / 2, (m + n) / 2, p, q, giveLog);
    }
    return giveLog ? Math.log(f) + dens : f * dens;
}
