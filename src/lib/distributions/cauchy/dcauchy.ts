import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { isNaN, PI, log as ln } from '@lib/r-func';
const printer = debug('dcauchy');

export function dcauchy(x: number, location = 0, scale = 1, log = false): number {
    /* NaNs propagated correctly */
    if (isNaN(x) || isNaN(location) || isNaN(scale)) {
        return x + location + scale;
    }

    if (scale <= 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    const y = (x - location) / scale;
    return log ? -ln(PI * scale * (1 + y * y)) : 1 / (PI * scale * (1 + y * y));
}
