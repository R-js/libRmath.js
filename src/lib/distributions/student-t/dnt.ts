'use strict';

import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { M_LN_SQRT_PI, R_D__0, sqrt, abs, DBL_EPSILON, exp, log } from '@lib/r-func';
import { lgammafn_sign as lgamma } from '@special/gamma';
import { dnorm } from '@dist/normal';
import { _dt } from './dt';
import { pnt } from './pnt';

const printer_dnt = debug('dnt');

export function dnt(x: number, df: number, ncp = 0, giveLog = false): number {
    if (isNaN(x) || isNaN(df) || isNaN(ncp)) {
        return x + df + ncp;
    }

    /* If non-positive df then error */
    if (df <= 0.0) {
        return ML_ERR_return_NAN2(printer_dnt, lineInfo4);
    }

    /* If x is infinite then return 0 */
    if (!isFinite(x)) {
        return R_D__0(giveLog);
    }

    if (ncp === 0) {
        return _dt(x, df, giveLog);
    }

    /*
        If infinite df then the density is identical to a
            normal distribution with mean = ncp.  However, the formula
            loses a lot of accuracy around df=1e9
    */
    if (df > 1e8) {
        return dnorm(x, ncp, 1, giveLog);
    }

    /* Do calculations on log scale to stabilize */

    /* Consider two cases: x ~= 0 or not */
    let u: number;
    if (abs(x) > sqrt(df * DBL_EPSILON)) {
        printer_dnt('abs(x:%d)>sqrt(df*espsilon):%d', abs(x), sqrt(df * DBL_EPSILON));
        u =
            log(df) -
            log(abs(x)) +
            log(abs(pnt(x * sqrt((df + 2) / df), df + 2, ncp, true, false) - pnt(x, df, ncp, true, false)));

        /* FIXME: the above still suffers from cancellation (but not horribly) */
    } else {
        /* x ~= 0 : -> same value as for  x = 0 */
        printer_dnt('abs(x:%d)<=sqrt(df*espsilon):%d', abs(x), sqrt(df * DBL_EPSILON));
        u = lgamma((df + 1) / 2) - lgamma(df / 2) - (M_LN_SQRT_PI + 0.5 * (log(df) + ncp * ncp));
    }

    printer_dnt('u=%d, giveLog=%s', u, giveLog);
    return giveLog ? u : exp(u);
}
