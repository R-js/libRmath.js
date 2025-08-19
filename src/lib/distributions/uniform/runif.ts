

import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { globalUni } from '@rng/global-rng';

const printer = createNS('runif');

export function runifOne(min: number, max: number): number {
    const u = globalUni();

    if (!(isFinite(min) && isFinite(max) && max > min)) {
        return ML_ERR_return_NAN2(printer);
    }
    const s = u.random();
    return (max - min) * s + min;
}
