import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';
import { rgamma } from '@dist/gamma/rgamma';
import DomainError from '@lib/errors/DomainError';

export default decorateWithLogger(function rchisq(this: LoggerEnhanced, df: number): number {
    if (!isFinite(df) || df < 0.0) {
        this?.printer?.(DomainError, rchisq.name);
        return NaN;
    }
    return rgamma(df / 2.0, 2.0);
});
