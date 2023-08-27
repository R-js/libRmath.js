import createNS from '@mangos/debug-frontend';

import { rchisqOne } from '../chi-2/rchisq';
import { ME, mapErrV2 } from '@common/logger';

const debug = createNS('rf');

export function rfOne(n1: number, n2: number): number {
    if (isNaN(n1) || isNaN(n2) || n1 <= 0 || n2 <= 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    const v1 = isFinite(n1) ? rchisqOne(n1) / n1 : 1;
    const v2 = isFinite(n2) ? rchisqOne(n2) / n2 : 1;
    return v1 / v2;
}
