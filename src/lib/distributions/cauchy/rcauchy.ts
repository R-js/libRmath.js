import createNS from '@mangos/debug-frontend';
import { ME, mapErrV2 } from '@common/logger';

const debug = createNS('rcauchy');
import { globalUni } from '@lib/rng';

export function rcauchyOne(location = 0, scale = 1): number {
    const rng = globalUni();
    if (isNaN(location) || !isFinite(scale) || scale < 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }
    if (scale === 0 || !isFinite(location)) {
        return location;
    }
    return location + scale * Math.tan(Math.PI * rng.random());
}
