import createNs from '@mangos/debug-frontend';
import { mapErrV2, ME } from '@common/logger';
import { rgamma } from '@dist/gamma/rgamma';

const debug = createNs('rchisq');

export function rchisqOne(df: number): number {
    if (!isFinite(df) || df < 0.0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }
    return rgamma(df / 2.0, 2.0);
}
