import { R_Q_P01_boundaries } from '@common/logger';
import { exp } from '@lib/r-func';
import { qnorm } from '@dist/normal/qnorm';

export function qlnorm(p: number, meanlog = 0, sdlog = 1, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(meanlog) || isNaN(sdlog)) return p + meanlog + sdlog;

    const rc = R_Q_P01_boundaries(lowerTail, logP, p, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }
    return exp(qnorm(p, meanlog, sdlog, lowerTail, logP));
}
