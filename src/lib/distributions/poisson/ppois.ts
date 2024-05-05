

import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { R_DT_0, R_DT_1, isFinite, floor } from '@lib/r-func';

import { debug } from '@mangos/debug';
import { pgamma } from '@dist/gamma/pgamma';

const printer = debug('ppois');

export function ppois(q: number, lambda: number, lowerTail = true, logP = false): number {
    if (isNaN(q) || isNaN(lambda)) return q + lambda;

    if (lambda < 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    if (q < 0) {
        return R_DT_0(lowerTail, logP);
    }
    if (lambda === 0) {
        return R_DT_1(lowerTail, logP);
    }
    if (!isFinite(q)) {
        return R_DT_1(lowerTail, logP);
    }
    q = floor(q + 1e-7);

    return pgamma(lambda, q + 1, 1, !lowerTail, logP);
}
