import { LoggerEnhanced, decorateWithLogger } from '@common/upstairs';
import { rgamma } from '@dist/gamma/rgamma';
import interplateDomainErrorTemplate from '@lib/errors/interpolateDomainErrorTemplate';

export default decorateWithLogger(function rchisq(this: LoggerEnhanced, df: number): number {
    if (!isFinite(df) || df < 0.0) {
        this?.error(interplateDomainErrorTemplate, rchisq.name);
        return NaN;
    }
    return rgamma(df / 2.0, 2.0);
});
