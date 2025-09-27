
import { R_DT_0, R_DT_1 } from '@lib/r-func';
import pbeta from '@dist/beta/pbeta';
import DomainError from '@lib/errors/DomainError';
import { type LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';


export default decorateWithLogger(function pnbinom(this: LoggerEnhanced, x: number, size: number, prob: number, lowerTail: boolean, logP: boolean): number {
    if (isNaN(x) || isNaN(size) || isNaN(prob)) return x + size + prob;
    if (!isFinite(size) || !isFinite(prob)) {
        this?.printer?.(DomainError, pnbinom.name);
        return NaN;
    }

    if (size < 0 || prob <= 0 || prob > 1) {
        this?.printer?.(DomainError, pnbinom.name);
        return NaN;
    }

    /* limiting case: point mass at zero */
    if (size === 0) {
        return x >= 0 ? R_DT_1(lowerTail, logP) : R_DT_0(lowerTail, logP);
    }

    if (x < 0) {
        return R_DT_0(lowerTail, logP);
    }
    if (!isFinite(x)) {
        return R_DT_1(lowerTail, logP);
    }
    x = Math.floor(x + 1e-7);
    return pbeta(prob, size, x + 1, lowerTail, logP);
});


