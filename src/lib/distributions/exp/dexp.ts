import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { R_D__0 } from '@lib/r-func';
import { debug } from '@mangos/debug';

const printer = debug('dexp');

export function dexp(x: number, scale: number, give_log: boolean): number {
    /* NaNs propagated correctly */
    if (Number.isNaN(x) || Number.isNaN(scale)) {
        return NaN;
    }

    if (scale <= 0.0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    if (x < 0) {
        return R_D__0(give_log);
    }
    return give_log ? -x / scale - Math.log(scale) : Math.exp(-x / scale) / scale;
}
