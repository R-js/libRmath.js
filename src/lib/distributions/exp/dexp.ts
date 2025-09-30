import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';
import DomainError from '@lib/errors/DomainError';
import { R_D__0 } from '@lib/r-func';

export default decorateWithLogger(function dexp(this: LoggerEnhanced, x: number, scale: number, give_log: boolean): number {
    /* NaNs propagated correctly */
    if (Number.isNaN(x) || Number.isNaN(scale)) {
        return NaN;
    }

    if (scale <= 0.0) {
        this?.printer?.(DomainError, dexp.name);
        return NaN;
    }

    if (x < 0) {
        return R_D__0(give_log);
    }
    return give_log ? -x / scale - Math.log(scale) : Math.exp(-x / scale) / scale;
});
