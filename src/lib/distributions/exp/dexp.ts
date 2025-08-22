import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_D__0 } from '@lib/r-func';
import createNS from '@common/debug-frontend';

const printer = createNS('dexp');

export function dexp(x: number, scale: number, give_log: boolean): number {
    /* NaNs propagated correctly */
    if (Number.isNaN(x) || Number.isNaN(scale)) {
        return NaN;
    }

    if (scale <= 0.0) {
        return ML_ERR_return_NAN2(printer);
    }

    if (x < 0) {
        return R_D__0(give_log);
    }
    return give_log ? -x / scale - Math.log(scale) : Math.exp(-x / scale) / scale;
}
