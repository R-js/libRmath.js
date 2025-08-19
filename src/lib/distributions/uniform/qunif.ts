

import { ML_ERR_return_NAN2, R_Q_P01_check } from '@common/logger';

import createNS from '@common/debug-frontend';
import { R_DT_qIv } from '@dist/exp/expm1';

const printer = createNS('qunif');

export function qunif(p: number, min = 0, max = 1, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(min) || isNaN(max)) {
        return NaN;
    }

    const rc = R_Q_P01_check(logP, p);
    if (rc !== undefined) {
        return rc;
    }

    if (!isFinite(min) || !isFinite(max)) {
        return ML_ERR_return_NAN2(printer);
    }
    if (max < min) {
        return ML_ERR_return_NAN2(printer);
    }
    if (max === min) {
        return min;
    }

    return min + R_DT_qIv(lowerTail, logP, p) * (max - min);
}
