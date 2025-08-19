import createNS from '@common/debug-frontend';
import { dbinom_raw } from '@dist/binomial/dbinom';
import { ML_ERR_return_NAN2 } from '@common/logger';

import { R_D__0, R_D_nonint_check, log as _log, round } from '@lib/r-func';

const printer = createNS('dgeom');

export function dgeom(x: number, p: number, log = false): number {
    if (isNaN(x) || isNaN(p)) return x + p;

    if (p <= 0 || p > 1) {
        return ML_ERR_return_NAN2(printer);
    }

    const rc = R_D_nonint_check(log, x, printer);
    if (rc !== undefined) {
        return rc;
    }
    if (x < 0 || !isFinite(x) || p === 0) {
        return R_D__0(log);
    }
    x = round(x);

    /* prob = (1-p)^x, stable for small p */
    const prob = dbinom_raw(0, x, p, 1 - p, log);

    return log ? _log(p) + prob : p * prob;
}
