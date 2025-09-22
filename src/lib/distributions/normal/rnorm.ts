

import createNS from '@common/debug-frontend';

import { ML_ERR_return_NAN2 } from '@common/logger';
import { globalNorm } from '@rng/global-rng';

const printer = createNS('rnorm');

export function rnormOne(mean = 0, sd = 1): number {
    const rng = globalNorm();
    if (isNaN(mean) || !isFinite(sd) || sd < 0) {
        printer(DomainError);
        return NaN;
    }
    if (sd === 0 || !isFinite(mean)) {
        return mean; /* includes mean = +/- Inf with finite sd */
    }
    return mean + sd * rng.random();
}
