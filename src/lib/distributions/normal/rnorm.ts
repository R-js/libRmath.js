

import { debug } from '@mangos/debug';

import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { globalNorm } from '@rng/global-rng';

const printer = debug('rnorm');

export function rnormOne(mean = 0, sd = 1): number {
    const rng = globalNorm();
    if (isNaN(mean) || !isFinite(sd) || sd < 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    if (sd === 0 || !isFinite(mean)) {
        return mean; /* includes mean = +/- Inf with finite sd */
    }
    return mean + sd * rng.random();
}
