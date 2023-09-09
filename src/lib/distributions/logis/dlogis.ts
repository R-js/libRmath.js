import createNS from '@mangos/debug-frontend';
import { ME, mapErrV2 } from '@common/logger';
import { log as _log, abs, exp } from '@lib/r-func';

const debug = createNS('dlogis');

export function dlogis(x: number, location = 0, scale = 1, log = false): number {
    if (isNaN(x) || isNaN(location) || isNaN(scale)) return NaN;
    if (scale <= 0.0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    x = abs((x - location) / scale);
    const e = exp(-x);
    const f = 1.0 + e;
    return log ? -(x + _log(scale * f * f)) : e / (scale * f * f);
}
