import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_D__0 } from '@lib/r-func';

import { dnbeta_scalar } from '@dist/beta/dnbeta';
import { dnchisq } from '@dist/chi-2/dnchisq';
import { dgamma } from '@dist/gamma/dgamma';

const printer = createNS('dnf');

export function dnf(x: number, df1: number, df2: number, ncp: number, giveLog: boolean): number {
    let z: number;
    let f: number;

    if (isNaN(x) || isNaN(df1) || isNaN(df2) || isNaN(ncp)) {
        return x + df2 + df1 + ncp;
    }

    /* want to compare dnf(ncp=0) behavior with df() one, hence *NOT* :
     * if (ncp == 0)
     *   return df(x, df1, df2, give_log); */

    if (df1 <= 0 || df2 <= 0 || ncp < 0) {
        return ML_ERR_return_NAN2(printer);
    }
    if (x < 0) {
        return R_D__0(giveLog);
    }
    if (!isFinite(ncp)) {
        /* ncp = +Inf -- FIXME?: in some cases, limit exists */
        return ML_ERR_return_NAN2(printer);
    }

    /* This is not correct for  df1 == 2, ncp > 0 - and seems unneeded:
     *  if (x == 0.) return(df1 > 2 ? R_D__0 : (df1 == 2 ? R_D__1 : POSITIVE_INFINITY));
     */
    if (!isFinite(df1) && !isFinite(df2)) {
        /* both +Inf */
        /* PR: not sure about this (taken from  ncp==0)  -- FIXME ? */
        if (x === 1) return Infinity;
        else return R_D__0(giveLog);
    }
    if (!isFinite(df2))
        /* i.e.  = +Inf */
        return df1 * dnchisq(x * df1, df1, ncp, giveLog);
    /*	 ==  dngamma(x, df1/2, 2./df1, ncp, give_log)  -- but that does not exist */
    if (df1 > 1e14 && ncp < 1e7) {
        /* includes df1 == +Inf: code below is inaccurate there */
        f = 1 + ncp / df1; /* assumes  ncp << df1 [ignores 2*ncp^(1/2)/df1*x term] */
        z = dgamma(1 / x / f, df2 / 2, 2 / df2, giveLog);
        return giveLog ? z - 2 * Math.log(x) - Math.log(f) : z / (x * x) / f;
    }

    const y = (df1 / df2) * x;
    z = dnbeta_scalar(y / (1 + y), df1 / 2, df2 / 2, ncp, giveLog);
    return giveLog ? z + Math.log(df1) - Math.log(df2) - 2 * Math.log1p(y) : (z * (df1 / df2)) / (1 + y) / (1 + y);
}
