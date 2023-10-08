'use strict';

import createNS from '@mangos/debug-frontend';

import { mapErrV2, ME } from '@common/logger';
import { pow, log } from '@lib/r-func';
import { globalUni } from '@rng/global-rng';

const debug = createNS('rweibull');

export function rweibullOne(shape: number, scale = 1): number {
    const rng = globalUni();
    if (!isFinite(shape) || !isFinite(scale) || shape <= 0 || scale <= 0) {
        if (scale === 0) {
            return 0;
        }
        /* else */
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    return scale * pow(-log(rng.random()), 1.0 / shape);
}
