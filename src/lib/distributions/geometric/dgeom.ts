import createNS from '@mangos/debug-frontend';
import { dbinom_raw } from '@dist/binomial/dbinom';
import { ME, mapErrV2 } from '@common/logger';

import { R_D__0, R_D_nonint_check, log as _log, round } from '@lib/r-func';

const debug = createNS('dgeom');

export function dgeom(x: number, p: number, log = false): number {
    if (isNaN(x) || isNaN(p)) {
        return x + p;
    }

    if (p <= 0 || p > 1) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    const rc = R_D_nonint_check(log, x, debug);
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
