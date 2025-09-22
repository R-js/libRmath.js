import createNS from '@common/debug-frontend';

import { ML_ERR_return_NAN2 } from '@common/logger';
import { exp_rand } from '@dist/exp/sexp';
import { rpoisOne } from '@dist/poisson/rpois';
import { globalUni } from '@rng/global-rng';
const printer = createNS('rgeom');

export function rgeomOne(p: number): number {
    const rng = globalUni();
    if (!isFinite(p) || p <= 0 || p > 1) {
        printer(DomainError);
        return NaN;
    }
    return rpoisOne(exp_rand(rng) * ((1 - p) / p));
}
