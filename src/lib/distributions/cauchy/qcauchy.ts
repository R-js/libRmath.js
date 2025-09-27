import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';
import { R_Q_P01_checkV2 } from '@common/logger';
import { R_Q_P01_check_domain } from '@common/logger';
import DomainError from '@lib/errors/DomainError';

import { tanpi } from '@trig/tanpi';

const domain = 'qcauchy';
export default decorateWithLogger(domain, qcauchy);

function qcauchy(this: LoggerEnhanced, p: number, location = 0, scale = 1, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(location) || isNaN(scale)) return NaN;
    let lower_tail = lowerTail;

    const rc = R_Q_P01_checkV2(logP, p);
    if (rc !== undefined) {
        this.printer?.(DomainError, R_Q_P01_check_domain);
        return rc;
    }

    if (scale <= 0 || !isFinite(scale)) {
        if (scale === 0) {
            return location;
        }
        this.printer?.(DomainError, domain);
        return NaN;
    }

    //const my_INF = location + (lower_tail ? scale : -scale) * +Infinity;
    const my_INF = lower_tail ? Infinity : -Infinity;
    if (logP) {
        if (p > -1) {
            /* when ep := exp(p),
             * tan(pi*ep)= -tan(pi*(-ep))= -tan(pi*(-ep)+pi) = -tan(pi*(1-ep)) =
             *		 = -tan(pi*(-Math.expm1(p))
             * for p ~ 0, exp(p) ~ 1, tan(~0) may be better than tan(~pi).
             */
            if (p === 0) {
                /* needed, since 1/tan(-0) = -Inf  for some arch. */
                return my_INF;
            }
            lower_tail = !lower_tail;
            p = -Math.expm1(p);
        } else {
            p = Math.exp(p);
        }
    } else {
        if (p > 0.5) {
            if (p === 1) return my_INF;
            p = 1 - p;
            lower_tail = !lower_tail;
        }
    }

    if (p === 0.5) return location;
    if (p === 0) return lower_tail ? -Infinity : Infinity;
    return location + (lower_tail ? -scale : scale) / tanpi(p);

}
