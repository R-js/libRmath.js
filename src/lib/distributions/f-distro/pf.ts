import createNS from '@mangos/debug-frontend';

import { mapErrV2, ME } from '@common/logger';
import { R_DT_0, R_DT_1, R_P_bounds_01 } from '@lib/r-func';

//import { INormal } from '../exp/expm1'normal';
import { pbeta } from '@dist/beta/pbeta';
import { pchisq } from '@dist/chi-2/pchisq';

const debug = createNS('pf');

export function pf(q: number, df1: number, df2: number, lowerTail: boolean, logP: boolean): number {
    if (isNaN(q) || isNaN(df1) || isNaN(df2)) return q + df2 + df1;

    if (df1 <= 0 || df2 <= 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    const rc = R_P_bounds_01(lowerTail, logP, q, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }

    /* move to pchisq for very large values - was 'df1 > 4e5' in 2.0.q,
       now only needed for df1 = Inf or df2 = Inf {since pbeta(0,*)=0} : */
    if (df2 === Infinity) {
        if (df1 === Infinity) {
            if (q < 1) return R_DT_0(lowerTail, logP);
            if (q === 1) return logP ? -Math.LN2 : 0.5;
            return R_DT_1(lowerTail, logP);
        }

        return pchisq(q * df1, df1, lowerTail, logP);
    }

    if (df1 === Infinity) {
        /* was "fudge"	'df1 > 4e5' in 2.0.q */
        //console.log({ df2, q, lowerTail, logP });
        const _d = pchisq(df2 / q, df2, !lowerTail, logP);
        return _d;
    }

    /* Avoid squeezing pbeta's first parameter against 1 :  */
    if (df1 * q > df2) q = pbeta(df2 / (df2 + df1 * q), df2 / 2, df1 / 2, !lowerTail, logP);
    else q = pbeta((df1 * q) / (df2 + df1 * q), df1 / 2, df2 / 2, lowerTail, logP);

    return isFinite(q) ? q : NaN;
}
