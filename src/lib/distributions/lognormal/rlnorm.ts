import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { rnormOne } from '@dist/normal/rnorm';
import { exp } from '@lib/r-func';

const printer = createNS('rlnorm');

export function rlnormOne(meanlog = 0, sdlog = 1): number {
    if (isNaN(meanlog) || !isFinite(sdlog) || sdlog < 0) {
        printer(DomainError);
        return NaN;
    }
    return exp(rnormOne(meanlog, sdlog));
}
