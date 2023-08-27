'use strict';

import createNS from '@mangos/debug-frontend';

import { rchisqOne } from '@dist/chi-2/rchisq';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { globalNorm } from '@rng/global-rng';
import { sqrt } from '@lib/r-func';

const printer = debug('rt');

export function rtOne(df: number): number {
    const rng = globalNorm();
    if (isNaN(df) || df <= 0.0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
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
