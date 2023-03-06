import { debug } from '@mangos/debug';

import { pbeta } from '../beta/pbeta';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { R_DT_0, R_DT_1, R_nonint } from '@lib/r-func';

const printer = debug('pbinom');

export function pbinom(x: number, n: number, prob: number, lowerTail = true, logP = false): number {
    if (isNaN(x) || isNaN(n) || isNaN(prob)) return NaN;
    if (!isFinite(n) || !isFinite(prob)) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    const lower_tail = lowerTail;
    const log_p = logP;

    if (R_nonint(n)) {
        printer('non-integer n = %d', n);
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    n = Math.round(n);
    /* 
     PR#8560: n=0 is a valid value 
  */
    if (n < 0 || prob < 0 || prob > 1) return ML_ERR_return_NAN2(printer, lineInfo4);

    if (x < 0) return R_DT_0(lower_tail, log_p);
    x = Math.floor(x + 1e-7);
    if (n <= x) return R_DT_1(lower_tail, log_p);
    printer('calling pbeta:(q=%d,a=%d,b=%d, l.t=%s, log=%s', prob, x + 1, n - x, !lower_tail, log_p);
    return pbeta(prob, x + 1, n - x, !lower_tail, log_p);
}
