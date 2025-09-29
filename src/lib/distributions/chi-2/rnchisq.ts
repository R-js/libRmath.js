import { rgamma } from '@dist/gamma/rgamma';
import { rpoisOne } from '@dist/poisson/rpois';
import rchisq from '@dist/chi-2/rchisq';
import DomainError from '@lib/errors/DomainError';
import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';

export default decorateWithLogger(function rnchisq(this: LoggerEnhanced, df: number, lambda: number): number {
    if (!isFinite(df) || !isFinite(lambda) || df < 0 || lambda < 0) {
        this?.printer?.(DomainError, rnchisq.name);
        return NaN;
    }
    if (lambda === 0) {
        return df === 0 ? 0 : rgamma(df / 2, 2);
    } else {
        let r = rpoisOne(lambda / 2);
        if (r > 0) r = rchisq(2 * r);
        if (df > 0) r += rgamma(df / 2, 2);
        return r;
    }
});
