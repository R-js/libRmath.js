import { R_D__1 } from '@lib/r-func';

import { decorateWithLogger, LoggerEnhanced } from '@common/debug-frontend';
import DomainError from '@lib/errors/DomainError';
import VariableArgumentError from '@lib/errors/VariableArgumentError';
import PrecisionError from '@lib/errors/PrecisionError';
import pnchisq_raw from './pnchisq_raw';

export default decorateWithLogger(function pnchisq(this: LoggerEnhanced, x: number, df: number, ncp: number, lower_tail: boolean, log_p: boolean): number {
    let ans;

    if (isNaN(x) || isNaN(df) || isNaN(ncp)) {
        return NaN;
    }
    if (!isFinite(df) || !isFinite(ncp)) {
        this?.printer?.(DomainError, pnchisq.name);
        return NaN;
    }

    if (df < 0 || ncp < 0) {
        this?.printer?.(DomainError, pnchisq.name);
        return NaN;
    }

    ans = pnchisq_raw(x, df, ncp, 1e-12, 8 * Number.EPSILON, 1000000, lower_tail, log_p);
    if (ncp >= 80) {
        if (lower_tail) {
            ans = Math.min(ans, R_D__1(log_p)); /* e.g., pchisq(555, 1.01, ncp = 80) */
        } else {
            /* !lower_tail */
            /* since we computed the other tail cancellation is likely */
            if (ans < (log_p ? -10 * Math.LN10 : 1e-10)) {
                this?.printer?.(PrecisionError, pnchisq.name);
            }
            if (!log_p) ans = Math.max(ans, 0.0); /* Precaution PR#7099 */
        }
    }
    if (!log_p || ans < -1e-8) {
        return ans;
    }

    // log_p  &&  ans > -1e-8
    // prob. = Math.exp(ans) is near one: we can do better using the other tail
    this?.printer?.(VariableArgumentError, '   pnchisq_raw(*, log_p): ans=%d => 2nd call, other tail', ans);

    // FIXME: (sum,sum2) will be the same (=> return them as well and reuse here ?)
    ans = pnchisq_raw(x, df, ncp, 1e-12, 8 * Number.EPSILON, 1000000, !lower_tail, false);
    return Math.log1p(-ans);
});
