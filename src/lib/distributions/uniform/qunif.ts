'use strict';

import { mapErrV2, ME, R_Q_P01_check } from '@common/logger';

import createNS from '@mangos/debug-frontend';
import { R_DT_qIv } from '@dist/exp/expm1';

const debug = createNS('qunif');

export function qunif(p: number, min = 0, max = 1, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(min) || isNaN(max)) {
        return NaN;
    }

    const rc = R_Q_P01_check(logP, p);
    if (rc !== undefined) {
        return rc;
    }

    if (!isFinite(min) || !isFinite(max)) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }
    if (max < min) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }
    if (max === min) {
        return min;
    }

    return min + R_DT_qIv(lowerTail, logP, p) * (max - min);
}
