import createNS from '@mangos/debug-frontend';

import { rchisqOne } from '@dist/chi-2/rchisq';
import { ME, mapErrV2 } from '@common/logger';
import { globalNorm } from '@rng/global-rng';
import { sqrt } from '@lib/r-func';

const debug = createNS('rt');

export function rtOne(df: number): number {
    const rng = globalNorm();
    if (isNaN(df) || df <= 0.0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    const num = rng.random();
    if (!isFinite(df)) {
        return num;
    }
    const chOne = rchisqOne(df);

    /* Some compilers (including MW6) evaluated this from right to left
        return norm_rand() / Math.sqrt((rchisq(df) / df); */
    return num / sqrt(chOne / df);
}
