import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { rgamma } from '@dist/gamma/rgamma';

const printer = createNS('rchisq');

export function rchisqOne(df: number): number {
    if (!isFinite(df) || df < 0.0) {
        printer(DomainError);
        return NaN;
    }
    return rgamma(df / 2.0, 2.0);
}
