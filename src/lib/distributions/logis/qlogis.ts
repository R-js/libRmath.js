import createNS from '@common/debug-frontend';

import { ML_ERR_return_NAN2, R_Q_P01_boundaries } from '@common/logger';

import { log } from '@lib/r-func';

import { R_Log1_Exp } from '@dist/exp/expm1';

const printer_qlogis = createNS('qlogis');

export function qlogis(p: number, location = 0, scale = 1, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(location) || isNaN(scale)) return NaN;

    const rc = R_Q_P01_boundaries(lowerTail, logP, p, -Infinity, Infinity);
    if (rc !== undefined) {
        return rc;
    }

    if (scale < 0) {
        return ML_ERR_return_NAN2(printer_qlogis);
    }
    if (scale === 0) return location;

    /* p := logit(p) = log( p / (1-p) )	 : */
    if (logP) {
        if (lowerTail) p = p - R_Log1_Exp(p);
        else p = R_Log1_Exp(p) - p;
    } else p = log(lowerTail ? p / (1 - p) : (1 - p) / p);

    return location + scale * p;
}
