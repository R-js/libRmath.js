import createDebug from '@mangos/debug-frontend';
import { mapErrV2, ME } from '@common/logger';
import { isNaN, PI, log as ln } from '@lib/r-func';
const debug = createDebug('dcauchy');

export function dcauchy(x: number, location = 0, scale = 1, log = false): number {
    /* NaNs propagated correctly */
    if (isNaN(x) || isNaN(location) || isNaN(scale)) {
        return x + location + scale;
    }

    if (scale <= 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    const y = (x - location) / scale;
    return log ? -ln(PI * scale * (1 + y * y)) : 1 / (PI * scale * (1 + y * y));
}
