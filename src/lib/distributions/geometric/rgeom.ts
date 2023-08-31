import createNS from '@mangos/debug-frontend';

import { ME, mapErrV2 } from '@common/logger';
import { exp_rand } from '@dist/exp/sexp';
import { rpoisOne } from '@dist/poisson/rpois';
import { globalUni } from '@rng/global-rng';
const debug = createNS('rgeom');

export function rgeomOne(p: number): number {
    const rng = globalUni();
    if (!isFinite(p) || p <= 0 || p > 1) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }
    return rpoisOne(exp_rand(rng) * ((1 - p) / p));
}
