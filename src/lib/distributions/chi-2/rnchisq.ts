import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { rgamma } from '@dist/gamma/rgamma';
import { rpoisOne } from '@dist/poisson/rpois';
import { rchisqOne } from '@dist/chi-2/rchisq';

const printer = createNS('rnchisq');

export function rnchisqOne(df: number, lambda: number): number {
    if (!isFinite(df) || !isFinite(lambda) || df < 0 || lambda < 0) {
        return ML_ERR_return_NAN2(printer);
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
