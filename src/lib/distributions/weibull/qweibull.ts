'use strict';

import createNS from '@mangos/debug-frontend';
import { mapErrV2, ME, R_Q_P01_boundaries } from '@common/logger';

import { R_DT_Clog } from '@dist/exp/expm1';
import { pow } from '@lib/r-func';

const debug = createNS('qweibull');

export function qweibull(p: number, shape: number, scale = 1, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(shape) || isNaN(scale)) {
        return p + shape + scale;
    }

    if (shape <= 0 || scale <= 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    const rc = R_Q_P01_boundaries(lowerTail, logP, p, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }
    return scale * pow(-R_DT_Clog(lowerTail, logP, p), 1 / shape);
}
