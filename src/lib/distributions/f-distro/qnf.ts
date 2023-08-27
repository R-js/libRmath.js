import createNS from '@mangos/debug-frontend';

import { R_Q_P01_boundaries, mapErrV2, ME } from '@common/logger';

import { qnbeta } from '@dist/beta/qnbeta';
import { qnchisq } from '@dist/chi-2/qnchisq';

const debug = createNS('qnf');

export function qnf(p: number, df1: number, df2: number, ncp: number, lowerTail: boolean, logP: boolean): number {
    if (isNaN(p) || isNaN(df1) || isNaN(df2) || isNaN(ncp)) {
        return p + df1 + df2 + ncp;
    }

    if (df1 <= 0 || df2 <= 0 || ncp < 0 || !isFinite(ncp) || (!isFinite(df1) && !isFinite(df2))) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    const rc = R_Q_P01_boundaries(lowerTail, logP, p, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }

    if (df2 > 1e8)
        /* avoid problems with +Inf and loss of accuracy */
        return qnchisq(p, df1, ncp, lowerTail, logP) / df1;
    //console.log({p,df1,df2,ncp,lowerTail, logP})
    const y = qnbeta(p, df1 / 2, df2 / 2, ncp, lowerTail, logP);
    //console.log({y});
    return (y / (1 - y)) * (df2 / df1);
}
