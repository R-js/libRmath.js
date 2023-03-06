
import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { log as _log, abs, exp } from '@lib/r-func';

const printer_dlogis = debug('dlogis');


export function dlogis(x: number, location = 0, scale = 1, log = false): number {
    if (isNaN(x) || isNaN(location) || isNaN(scale)) return NaN;
    if (scale <= 0.0) {
        return ML_ERR_return_NAN2(printer_dlogis, lineInfo4);
    }

    x = abs((x - location) / scale);
    const e = exp(-x);
    const f = 1.0 + e;
    return log ? -(x + _log(scale * f * f)) : e / (scale * f * f);
}
