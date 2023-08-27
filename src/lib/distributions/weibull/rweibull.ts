'use strict';

import createNS from '@mangos/debug-frontend';

import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { pow, log } from '@lib/r-func';
import { globalUni } from '@rng/global-rng';

const printer = debug('rweibull');

export function rweibullOne(shape: number, scale = 1): number {
    const rng = globalUni();
    if (!isFinite(shape) || !isFinite(scale) || shape <= 0 || scale <= 0) {
        if (scale === 0) {
            return 0;
        }
        /* else */
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    return scale * pow(-log(rng.random()), 1.0 / shape);
}
