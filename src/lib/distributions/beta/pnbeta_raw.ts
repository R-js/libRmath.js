import { LoggerEnhanced, decorateWithLogger } from "@common/debug-frontend";
import { NumberW } from "@common/toms708/NumberW";
import { Toms708 } from "@common/toms708/toms708";
import ConvergenceError from "@lib/errors/ConvergenceError";
import DomainError from "@lib/errors/DomainError";
import PrecisionError from "@lib/errors/PrecisionError";
import { exp, floor, log, log1p, max, sqrt } from "@lib/r-func";
import { lgammafn_sign } from "@lib/special/gamma";

/* change errmax and itrmax if desired;
 * original (AS 226, R84) had  (errmax; itrmax) = (1e-6; 100) */
const errmax = 1.0e-9;
const itrmax = 10000; /* 100 is not enough for pf(ncp=200)
                   see PR#11277 */

export default decorateWithLogger(function pnbeta_raw(this: LoggerEnhanced, x: number, o_x: number, a: number, b: number, ncp: number): number {
    /* o_x  == 1 - x  but maybe more accurate */
    // double
    let errbd;

    const temp = new NumberW(0);
    const tmp_c = new NumberW(0);
    // int
    const ierr = new NumberW(0);

    // long double
    let ans;
    let ax;
    let gx;
    let q;
    let sumq;

    if (ncp < 0 || a <= 0 || b <= 0) {
        this?.printer?.(DomainError, pnbeta_raw.name)
        return NaN;
    }

    const c = ncp / 2;

    /* initialize the series */

    const x0 = floor(max(c - 7 * sqrt(c), 0));
    const a0 = a + x0;
    const lbeta = lgammafn_sign(a0) + lgammafn_sign(b) - lgammafn_sign(a0 + b);
    /* temp = pbeta_raw(x, a0, b, TRUE, FALSE), but using (x, o_x): */
    Toms708.bratio(a0, b, x, o_x, temp, tmp_c, ierr);

    gx = exp(a0 * log(x) + b * (x < 0.5 ? log1p(-x) : log(o_x)) - lbeta - log(a0));
    if (a0 > a) q = exp(-c + x0 * log(c) - lgammafn_sign(x0 + 1));
    else q = exp(-c);

    sumq = 1 - q;
    ans = ax = q * temp.val;

    /* recurse over subsequent terms until convergence is achieved */
    let j = floor(x0); // x0 could be billions, and is in package EnvStats
    do {
        j++;
        temp.val -= gx;
        gx *= (x * (a + b + j - 1)) / (a + j);
        q *= c / j;
        sumq -= q;
        ax = temp.val * q;
        ans += ax;
        errbd = (temp.val - gx) * sumq;
    } while (errbd > errmax && j < itrmax + x0);

    if (errbd > errmax) {
        this?.printer?.(PrecisionError, pnbeta_raw.name)
    }
    if (j >= itrmax + x0) {
        this?.printer?.(ConvergenceError, pnbeta_raw.name)
    }

    return ans;
});