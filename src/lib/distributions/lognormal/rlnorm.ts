import createNS from '@mangos/debug-frontend';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { rnormOne } from '@dist/normal/rnorm';
import { exp } from '@lib/r-func';

const printer = debug('rlnorm');

export function rlnormOne(meanlog = 0, sdlog = 1): number {
    if (isNaN(meanlog) || !isFinite(sdlog) || sdlog < 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    return exp(rnormOne(meanlog, sdlog));
}
