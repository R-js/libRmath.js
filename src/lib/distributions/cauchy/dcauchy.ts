import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { isNaN, PI, log as ln } from '@lib/r-func';
const printer = createNS('dcauchy');

export function dcauchy(x: number, location = 0, scale = 1, log = false): number {
    /* NaNs propagated correctly */
    if (isNaN(x) || isNaN(location) || isNaN(scale)) {
        return x + location + scale;
    }

    if (scale <= 0) {
        return ML_ERR_return_NAN2(printer);
    }

    const y = (x - location) / scale;
    return log ? -ln(PI * scale * (1 + y * y)) : 1 / (PI * scale * (1 + y * y));
}
