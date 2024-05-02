

import { debug } from '@mangos/debug';

import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { R_D__0, log as _log, round } from '@lib/r-func';
import { choose, lchoose } from '@lib/special/choose';
import { cwilcox } from './cwilcox';
import { WilcoxonCache } from './WilcoxonCache';

const printer_dwilcox = debug('dwilcox');

export function dwilcox(x: number, m: number, n: number, log = false): number {
    m = round(m);
    n = round(n);

    //const nm = m * n;

    const w = new WilcoxonCache();
    //#ifdef IEEE_754
    /* NaNs propagated correctly */

    if (isNaN(x) || isNaN(m) || isNaN(n)) {
        // console.log(`1. x:${x}, m:${m}, n:${n}`);
        return x + m + n;
    }
    //#endif

    if (m <= 0 || n <= 0) {
        // console.log(`2. x:${x}, m:${m}, n:${n}`);
        return ML_ERR_return_NAN2(printer_dwilcox, lineInfo4);
    }

    if (Math.abs(x - Math.round(x)) > 1e-7) {
        // console.log(`3. x:${x}, m:${m}, n:${n}`);
        return R_D__0(log);
    }
    x = Math.round(x);
    if (x < 0 || x > m * n) {
        return R_D__0(log);
    }
    //const w = initw(m, n);
    //console.log(`0. special: ${w[4][4].length}`);
    //const c1 = cwilcox(x, m, n, w);

    //console.log(`4. c1:${c1} <- x:${x}, m:${m}, n:${n}`);
    return log ? _log(cwilcox(x, m, n, w)) - lchoose(m + n, n) : cwilcox(x, m, n, w) / choose(m + n, n);
}
