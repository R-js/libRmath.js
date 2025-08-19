

import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_DT_0, R_DT_1, R_DT_val } from '@lib/r-func';
import { choose } from '@lib/special/choose';

import { WilcoxonCache } from './WilcoxonCache';

import { cwilcox } from './cwilcox';

const { round: R_forceint, floor } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;

const printer_pwilcox = createNS('pwilcox');

export function pwilcox(q: number, m: number, n: number, lowerTail = true, logP = false): number {
    m = R_forceint(m);
    n = R_forceint(n);
    const w = new WilcoxonCache();

    let lower_tail = lowerTail;
    if (ISNAN(q) || ISNAN(m) || ISNAN(n)) {
        return q + m + n;
    }
    if (!R_FINITE(m) || !R_FINITE(n)) {
        return ML_ERR_return_NAN2(printer_pwilcox);
    }

    if (m <= 0 || n <= 0) {
        return ML_ERR_return_NAN2(printer_pwilcox);
    }

    q = floor(q + 1e-7);

    if (q < 0.0) {
        return R_DT_0(lower_tail, logP);
    }
    if (q >= m * n) {
        return R_DT_1(lower_tail, logP);
    }

    //let mm = m;
    // let nn = n;
    //w_init_maybe(mm, nn);
    const c = choose(m + n, n);
    let p = 0;
    /* Use summation of probs over the shorter range */
    if (q <= (m * n) / 2) {
        for (let i = 0; i <= q; i++) {
            p += cwilcox(i, m, n, w) / c;
        }
    } else {
        q = m * n - q;
        for (let i = 0; i < q; i++) {
            p += cwilcox(i, m, n, w) / c;
        }
        lower_tail = !lower_tail; /* p = 1 - p; */
    }
    return R_DT_val(lower_tail, logP, p);
} /* pwilcox */

/* x is 'p' in R function qwilcox */
