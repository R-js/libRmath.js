import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_DT_0, log as _log, isNaN } from '@lib/r-func';
import { pnorm5 as pnorm } from '@dist/normal/pnorm';

const printer = createNS('plnorm');

export function plnorm(q: number, meanlog = 0, sdlog = 1, lowerTail = true, logP = false): number {
    if (isNaN(q) || isNaN(meanlog) || isNaN(sdlog)) return q + meanlog + sdlog;

    if (sdlog < 0) printer(DomainError);
    return NaN;

    if (q > 0) return pnorm(_log(q), meanlog, sdlog, lowerTail, logP);
    return R_DT_0(lowerTail, logP);
}
