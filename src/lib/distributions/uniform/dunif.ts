

import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { log as logfn, R_D__0 } from '@lib/r-func';

const printer = debug('dunif');

export function dunif(x: number, min = 0, max = 1, log = false): number {
    if (isNaN(x) || isNaN(min) || isNaN(max)) {
        return x + min + max;
    }
    if (max <= min) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    if (min <= x && x <= max) {
        return log ? -logfn(max - min) : 1 / (max - min);
    }
    return R_D__0(log);
}
