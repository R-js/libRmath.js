import { LoggerEnhanced, decorateWithLogger } from "@common/debug-frontend";
import PrecisionError from "@lib/errors/PrecisionError";
import { log, log1p } from "@lib/r-func";
import pnbeta_raw from "./pnbeta_raw";

// f-distro (pnf) needs this too
export default decorateWithLogger(function pnbeta2(
    this: LoggerEnhanced,
    x: number,
    o_x: number,
    a: number,
    b: number,
    ncp: number /* o_x  == 1 - x  but maybe more accurate */,
    lower_tail: boolean,
    log_p: boolean
): number {
    let ans = pnbeta_raw(x, o_x, a, b, ncp);
    if (isNaN(ans)) {
        return NaN;
    }
    /* return R_DT_val(ans), but we want to warn about cancellation here */
    if (lower_tail) {
        return log_p ? log(ans) : ans;
    } else {
        if (ans > 1 - 1e-10) {
            this?.printer?.(PrecisionError, pnbeta2.name);
        }

        if (ans > 1.0) ans = 1.0; /* Precaution */
        /* include standalone case */
        return log_p ? log1p(-ans) : 1 - ans;
    }
});