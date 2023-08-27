import { ME, mapErrV2 } from '@common/logger';

import createNS from '@mangos/debug-frontend';
import { exp_rand } from './sexp';

import { globalUni } from '@rng/global-rng';

const debug = createNS('rexp');

export function rexpOne(rate: number): number {
    const rng = globalUni();
    if (rate === Infinity || isNaN(rate) || rate <= 0) {
        if (rate === Infinity || rate === -Infinity) {
            return 0;
        }
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
    }
    return exp_rand(rng) / rate; // --> in ./sexp.c
}
