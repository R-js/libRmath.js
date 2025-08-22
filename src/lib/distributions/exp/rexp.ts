import { ML_ERR_return_NAN2 } from '@common/logger';

import createNS from '@common/debug-frontend';
import { exp_rand } from './sexp';

import { globalUni } from '@rng/global-rng';

const printer = createNS('rexp');

export function rexpOne(rate: number): number {
    const rng = globalUni();
    if (rate === Infinity || isNaN(rate) || rate <= 0) {
        if (rate === Infinity || rate === -Infinity) {
            return 0;
        }
        /* else */
        return ML_ERR_return_NAN2(printer);
    }
    return exp_rand(rng) / rate; // --> in ./sexp.c
}
