import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';
import DomainError from '@lib/errors/DomainError';

import { globalUni } from '@lib/rng';

const domain = 'rcauchy';
export default decorateWithLogger(domain, rcauchyOne);

function rcauchyOne(this: LoggerEnhanced, location = 0, scale = 1): number {
    const rng = globalUni();
    if (isNaN(location) || !isFinite(scale) || scale < 0) {
        this.printer?.(DomainError, domain);
        return NaN;
    }
    if (scale === 0 || !isFinite(location)) {
        return location;
    }
    return location + scale * Math.tan(Math.PI * rng.random());
}
