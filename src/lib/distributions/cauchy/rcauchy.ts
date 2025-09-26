import { createObjectNs } from '@common/debug-frontend';
import DomainError from '@lib/errors/DomainError';

const domain = 'rcauchy';
const printer = createObjectNs(domain);

import { globalUni } from '@lib/rng';

export function rcauchyOne(location = 0, scale = 1): number {
    const rng = globalUni();
    if (isNaN(location) || !isFinite(scale) || scale < 0) {
        printer(DomainError, domain);
        return NaN;
    }
    if (scale === 0 || !isFinite(location)) {
        return location;
    }
    return location + scale * Math.tan(Math.PI * rng.random());
}
