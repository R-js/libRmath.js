import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { R_DT_0, R_DT_1, log } from '@lib/r-func';
import { Toms708 } from '@common/toms708/toms708';
import { NumberW } from '@common/toms708/NumberW';

const printer_pbeta_raw = debug('pbeta_raw');
const printer_pbeta = debug('pbeta');

export function pbeta_raw(x: number, a: number, b: number, lower_tail: boolean, log_p: boolean): number {
    // treat limit cases correctly here:
    //if (a === 0 || b === 0 || !isFinite(a) || !isFinite(b)) {
    // NB:  0 < x < 1 :
    if (a === 0 && b === 0)
        // point mass 1/2 at each of {0,1} :
        return log_p ? -Math.LN2 : 0.5;
    if (a === 0 || a / b === 0)
        // point mass 1 at 0 ==> P(X <= x) = 1, all x > 0
        return R_DT_1(lower_tail, log_p);
    if (b === 0 || b / a === 0)
        // point mass 1 at 1 ==> P(X <= x) = 0, all x < 1
        return R_DT_0(lower_tail, log_p);
    // else, remaining case:  a = b = Inf : point mass 1 at 1/2
    if (!isFinite(a) || !isFinite(b)) {
        if (x < 0.5) return R_DT_0(lower_tail, log_p);
        else return R_DT_1(lower_tail, log_p);
    }
    //}
    // Now:  0 < a < Inf;  0 < b < Inf
    const x1 = 0.5 - x + 0.5;
    const w: NumberW = new NumberW(0);
    const wc: NumberW = new NumberW(0);
    const ierr: NumberW = new NumberW(0);
    //====
    //Toms708.bratio(a, b, x, x1, &w, &wc, &ierr, log_p); /* -> ./toms708.c */
    printer_pbeta_raw('before Toms708.bratio, a=%d, b=%d, x=%d, w=%d,wc=%d, ierr=%d', a, b, x, w.val, wc.val, ierr.val);
    Toms708.bratio(a, b, x, x1, w, wc, ierr); /* -> ./toms708.c */
    printer_pbeta_raw('after Toms708.bratio, a=%d, b=%d, x=%d, w=%d,wc=%d, ierr=%d', a, b, x, w.val, wc.val, ierr.val);
    //====
    // ierr in {10,14} <==> bgrat() error code ierr-10 in 1:4; for 1 and 4, warned *there*
    if (ierr.val && ierr.val !== 11 && ierr.val !== 14)
        printer_pbeta_raw('pbeta_raw(%d, a=%d, b=%d, ..) -> bratio() gave error code %d', x, a, b, ierr);
    if (log_p) {
        w.val = log(w.val);
        wc.val = log(wc.val);
    }
    return lower_tail ? w.val : wc.val;
} /* pbeta_raw() */

export function pbeta(q: number, a: number, b: number, lowerTail = true, logP = false): number {
    printer_pbeta('pbeta(q=%d, a=%d, b=%d, l.t=%s, ln=%s)', q, a, b, lowerTail, logP);
    if (isNaN(q) || isNaN(a) || isNaN(b)) return NaN;

    if (a < 0 || b < 0) return ML_ERR_return_NAN2(printer_pbeta, lineInfo4);
    // allowing a==0 and b==0  <==> treat as one- or two-point mass

    if (q <= 0) return R_DT_0(lowerTail, logP);
    if (q >= 1) return R_DT_1(lowerTail, logP);

    return pbeta_raw(q, a, b, lowerTail, logP);
}
