import createNS from '@common/debug-frontend';

import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_D_val, R_DT_0, R_DT_1 } from '@lib/r-func';

import { R_D_Clog } from '@lib/r-func';
import { atanpi } from '@trig/tanpi';

const printer = createNS('pcauchy');

export function pcauchy(x: number, location = 0, scale = 1, lowerTail = true, logP = false): number {
    if (isNaN(x) || isNaN(location) || isNaN(scale)) return x + location + scale;

    if (scale <= 0) {
        printer(DomainError);
        return NaN;
    }

    x = (x - location) / scale;
    if (isNaN(x)) {
        printer(DomainError);
        return NaN;
    }

    if (!isFinite(x)) {
        if (x < 0) {
            return R_DT_0(lowerTail, logP);
        } else {
            return R_DT_1(lowerTail, logP);
        }
    }

    if (!lowerTail) x = -x;
    /* for large x, the standard formula suffers from cancellation.
     * This is from Morten Welinder thanks to  Ian Smith's  atan(1/x) : */

    if (Math.abs(x) > 1) {
        const y = atanpi(1 / x);
        return x > 0 ? R_D_Clog(logP, y) : R_D_val(logP, -y);
    } else {
        return R_D_val(logP, 0.5 + atanpi(x));
    }
}
