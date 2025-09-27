import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';
import DomainError from '@lib/errors/DomainError';

import { globalUni } from '@lib/rng';

export default decorateWithLogger(rcauchyOne);

function rcauchyOne(this: LoggerEnhanced, location = 0, scale = 1): number {
    const rng = globalUni();
    if (isNaN(location) || !isFinite(scale) || scale < 0) {
        this?.printer?.(DomainError, rcauchyOne.name);
        return NaN;
    }
    if (scale === 0 || !isFinite(location)) {
        return location;
    }
    return location + scale * Math.tan(Math.PI * rng.random());
}
