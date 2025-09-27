import { LoggerEnhanced, decorateWithLogger } from "@common/debug-frontend";
import { NumberW } from "@common/toms708/NumberW";
import { Toms708 } from "@common/toms708/toms708";
import VariableArgumentError from "@lib/errors/VariableArgumentError";
import { R_DT_0, R_DT_1, log } from "@lib/r-func";

export default decorateWithLogger(function pbeta_raw(this: LoggerEnhanced, x: number, a: number, b: number, lower_tail: boolean, log_p: boolean): number {
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
    this?.printer?.(VariableArgumentError, 'before Toms708.bratio, a=%d, b=%d, x=%d, w=%d,wc=%d, ierr=%d', a, b, x, w.val, wc.val, ierr.val);
    Toms708.bratio(a, b, x, x1, w, wc, ierr); /* -> ./toms708.c */
    this?.printer?.(VariableArgumentError, 'after Toms708.bratio, a=%d, b=%d, x=%d, w=%d,wc=%d, ierr=%d', a, b, x, w.val, wc.val, ierr.val);
    //====
    // ierr in {10,14} <==> bgrat() error code ierr-10 in 1:4; for 1 and 4, warned *there*
    if (ierr.val && ierr.val !== 11 && ierr.val !== 14)
        this?.printer?.(VariableArgumentError, 'pbeta_raw(%d, a=%d, b=%d, ..) -> bratio() gave error code %d', x, a, b, ierr);
    if (log_p) {
        w.val = log(w.val);
        wc.val = log(wc.val);
    }
    return lower_tail ? w.val : wc.val;
});
