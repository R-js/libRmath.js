import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_P_bounds_01 } from '@lib/r-func';
import { pnbeta2 } from '@dist/beta/pnbeta';
import { pnchisq } from '@dist/chi-2/pnchisq';

const printer_pnf = createNS('pnf');
export function pnf(x: number, df1: number, df2: number, ncp: number, lowerTail: boolean, logP: boolean): number {
    if (isNaN(x) || isNaN(df1) || isNaN(df2) || isNaN(ncp)) return x + df2 + df1 + ncp;

    if (df1 <= 0 || df2 <= 0 || ncp < 0) {
        return ML_ERR_return_NAN2(printer_pnf);
    }
    if (!isFinite(ncp)) {
        return ML_ERR_return_NAN2(printer_pnf);
    }
    if (!isFinite(df1) && !isFinite(df2)) {
        /* both +Inf */
        return ML_ERR_return_NAN2(printer_pnf);
    }

    const rc = R_P_bounds_01(lowerTail, logP, x, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }
    if (df2 > 1e8) {
        /* avoid problems with +Inf and loss of accuracy */
        return pnchisq(x * df1, df1, ncp, lowerTail, logP);
    }
    const y = (df1 / df2) * x;
    return pnbeta2(y / (1 + y), 1 / (1 + y), df1 / 2, df2 / 2, ncp, lowerTail, logP);
}
