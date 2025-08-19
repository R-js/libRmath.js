import createNS from '@common/debug-frontend';

import { ML_ERR_return_NAN2, R_Q_P01_boundaries } from '@common/logger';

import { qbeta } from '@dist/beta/qbeta';
import { qchisq } from '@dist/chi-2/qchisq';

const printer = createNS('qf');

export function qf(p: number, df1: number, df2: number, lower_tail: boolean, log_p: boolean): number {
    if (isNaN(p) || isNaN(df1) || isNaN(df2)) return p + df1 + df2;

    if (df1 <= 0 || df2 <= 0) {
        return ML_ERR_return_NAN2(printer);
    }

    const rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }

    /* fudge the extreme DF cases -- qbeta doesn't do this well.
   But we still need to fudge the infinite ones.
 */

    if (df1 <= df2 && df2 > 4e5) {
        if (!isFinite(df1))
            /* df1 == df2 == Inf : */
            return 1;
        /* else */
        return qchisq(p, df1, lower_tail, log_p) / df1;
    }
    if (df1 > 4e5) {
        /* and so  df2 < df1 */
        return df2 / qchisq(p, df2, !lower_tail, log_p);
    }

    // FIXME: (1/qb - 1) = (1 - qb)/qb; if we know qb ~= 1, should use other tail
    p = (1 / qbeta(p, df2 / 2, df1 / 2, !lower_tail, log_p) - 1) * (df2 / df1);
    return isFinite(p) ? p : NaN;
}
