import { type LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';

import { rgamma } from '@dist/gamma/rgamma';
import { rpoisOne } from '@dist/poisson/rpois';
import DomainError from '@lib/errors/DomainError';

export default decorateWithLogger(function rnbinom(this: LoggerEnhanced, size: number, prob: number): number {
    if (!isFinite(size) || !isFinite(prob) || size <= 0 || prob <= 0 || prob > 1) {
        /* prob = 1 is ok, PR#1218 */
        this?.printer?.(DomainError, rnbinom.name);
        return NaN;
    }
    return prob === 1 ? 0 : rpoisOne(rgamma(size, (1 - prob) / prob));
});

