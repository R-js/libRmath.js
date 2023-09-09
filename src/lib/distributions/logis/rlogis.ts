import createNS from '@mangos/debug-frontend';
import { ME, mapErrV2 } from '@common/logger';
import { globalUni } from '@lib/rng';
const debug = createNS('rlogis');

export function rlogisOne(location = 0, scale = 1): number {
    const rng = globalUni();
    if (isNaN(location) || !isFinite(scale)) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    if (scale === 0 || !isFinite(location)) return location;
    else {
        const u: number = rng.random();
        return location + scale * Math.log(u / (1 - u));
    }
}
