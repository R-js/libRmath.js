

import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { log as logfn, R_D__0 } from '@lib/r-func';

const printer = createNS('dunif');

export function dunif(x: number, min = 0, max = 1, log = false): number {
    if (isNaN(x) || isNaN(min) || isNaN(max)) {
        return x + min + max;
    }
    if (max <= min) {
        return ML_ERR_return_NAN2(printer);
    }

    if (min <= x && x <= max) {
        return log ? -logfn(max - min) : 1 / (max - min);
    }
    return R_D__0(log);
}
