import createNs from '@mangos/debug-frontend';
import { ME, mapErrV2 } from '@common/logger';
import { rgamma } from '@dist/gamma/rgamma';
import { rpoisOne } from '@dist/poisson/rpois';
import { rchisqOne } from '@dist/chi-2/rchisq';

const debug = createNs('rnchisq');

export function rnchisqOne(df: number, lambda: number): number {
    if (!isFinite(df) || !isFinite(lambda) || df < 0 || lambda < 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }
    if (lambda === 0) {
        return df === 0 ? 0 : rgamma(df / 2, 2);
    } else {
        let r = rpoisOne(lambda / 2);
        if (r > 0) r = rchisqOne(2 * r);
        if (df > 0) r += rgamma(df / 2, 2);
        return r;
    }
}
