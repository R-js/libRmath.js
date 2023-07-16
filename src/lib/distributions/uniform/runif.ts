'use strict';

import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { globalUni } from '@rng/global-rng';

const printer = debug('runif');

export function runifOne(min: number, max: number): number {
    const u = globalUni();

    if (!(isFinite(min) && isFinite(max) && max > min)) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    const s = u.random();
    return (max - min) * s + min;
}
