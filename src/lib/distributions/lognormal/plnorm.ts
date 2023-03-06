
import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { R_DT_0, log as _log, isNaN } from '@lib/r-func';
import { pnorm5 as pnorm } from '@dist/normal/pnorm';

const printer = debug('plnorm');

export function plnorm(q: number, meanlog = 0, sdlog = 1, lowerTail = true, logP = false): number {
    if (isNaN(q) || isNaN(meanlog) || isNaN(sdlog)) return q + meanlog + sdlog;

    if (sdlog < 0) return ML_ERR_return_NAN2(printer, lineInfo4);

    if (q > 0) return pnorm(_log(q), meanlog, sdlog, lowerTail, logP);
    return R_DT_0(lowerTail, logP);
}
