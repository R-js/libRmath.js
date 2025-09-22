

import createNS from '@common/debug-frontend';

import { ML_ERR_return_NAN2 } from '@common/logger';
import { pow, log } from '@lib/r-func';
import { globalUni } from '@rng/global-rng';

const printer = createNS('rweibull');

export function rweibullOne(shape: number, scale = 1): number {
    const rng = globalUni();
    if (!isFinite(shape) || !isFinite(scale) || shape <= 0 || scale <= 0) {
        if (scale === 0) {
            return 0;
        }
        /* else */
        printer(DomainError);
        return NaN;
    }

    return scale * pow(-log(rng.random()), 1.0 / shape);
}
