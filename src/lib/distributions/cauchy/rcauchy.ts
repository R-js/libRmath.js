import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';

const printer = createNS('rcauchy');
import { globalUni } from '@lib/rng';

export function rcauchyOne(location = 0, scale = 1): number {
    const rng = globalUni();
    if (isNaN(location) || !isFinite(scale) || scale < 0) {
        printer(DomainError);
        return NaN;
    }
    if (scale === 0 || !isFinite(location)) {
        return location;
    }
    return location + scale * Math.tan(Math.PI * rng.random());
}
