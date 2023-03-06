'use strict';

import { debug } from '@mangos/debug';

import { ML_ERR_return_NAN2, lineInfo4, R_Q_P01_check } from '@common/logger';
import { R_DT_0, R_DT_1, DBL_EPSILON } from '@lib/r-func';

import { R_DT_qIv } from '@dist/exp/expm1';
import { cwilcox } from './cwilcox';
import { WilcoxonCache } from './WilcoxonCache';
import { choose } from '@special/choose';

const printer_qwilcox = debug('qwilcox');

export function qwilcox(x: number, m: number, n: number, lowerTail = true, logP = false): number {
    m = Math.round(m);
    n = Math.round(n);
    const w = new WilcoxonCache();

    if (isNaN(x) || isNaN(m) || isNaN(n))
    {
        return x + m + n;
    }
    if (!isFinite(x) || !isFinite(m) || !isFinite(n))
    {
        return ML_ERR_return_NAN2(printer_qwilcox, lineInfo4);
    }

    const rc = R_Q_P01_check(logP, x);
    if (rc !== undefined) {
        return rc;
    }

    if (m <= 0 || n <= 0)
    {
        return ML_ERR_return_NAN2(printer_qwilcox, lineInfo4);
    }

    if (x === R_DT_0(lowerTail, logP))
    {
        return 0;
    }
    if (x === R_DT_1(lowerTail, logP))
    {
        return m * n;
    }

    x = R_DT_qIv(lowerTail, logP, x); /* lower_tail,non-log "p" */

    const c = choose(m + n, n);
    let p = 0;
    let q = 0;
    if (x <= 0.5)
    {
        x = x - 10 * DBL_EPSILON;
        for(;;)
        {
            p += cwilcox(q, m, n, w) / c;
            if (p >= x) break;
            q++;
        }
    }
    else
    {
        x = 1 - x + 10 * DBL_EPSILON;
        for (;;)
        {
            p += cwilcox(q, m, n, w) / c;
            if (p > x)
            {
                q = Math.trunc(m * n - q);
                break;
            }
            q++;
        }
    }
    return q;
}
