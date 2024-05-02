

import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { globalUni } from '@rng/global-rng';
import { floor, trunc, round, isNaN, INT_MAX } from '@lib/r-func';

const printer = debug('rsignrank');

export function rsignrankOne(n: number): number {
    const rng = globalUni();
    /* NaNs propagated correctly */
    if (isNaN(n)) {
        return n;
    }
    // added for C language fidelity
    if (n > INT_MAX) return 0;

    n = round(n);

    if (n < 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    if (n === 0) {
        return 0;
    }
    let r = 0.0;
    const k = trunc(n);
    for (let i = 0; i < k /**/; ) {
        r += ++i * floor(rng.random() + 0.5);
    }
    return r;
}
