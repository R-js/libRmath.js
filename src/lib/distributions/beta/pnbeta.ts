import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2, ME, ML_ERROR3 } from '@common/logger';
import { R_P_bounds_01, floor, exp, sqrt, log, log1p, max } from '@lib/r-func';

import { lgammafn_sign } from '@special/gamma/lgammafn_sign';

import { Toms708 } from '@common/toms708/toms708';
import { NumberW } from '@common/toms708/NumberW';

const printerPNBeta = createNS('pnbeta_raw/pnbeta');
const printer_pnbeta2 = createNS('pnbeta2');

/* change errmax and itrmax if desired;
 * original (AS 226, R84) had  (errmax; itrmax) = (1e-6; 100) */
const errmax = 1.0e-9;
const itrmax = 10000; /* 100 is not enough for pf(ncp=200)
                   see PR#11277 */

function pnbeta_raw(x: number, o_x: number, a: number, b: number, ncp: number): number {
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
        return ML_ERR_return_NAN2(printerPNBeta);
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

    if (errbd > errmax) ML_ERROR3(printerPNBeta, ME.ME_PRECISION, 'pnbeta');
    if (j >= itrmax + x0) ML_ERROR3(printerPNBeta, ME.ME_NOCONV, 'pnbeta');

    return ans;
}

export function pnbeta2(
    x: number,
    o_x: number,
    a: number,
    b: number,
    ncp: number /* o_x  == 1 - x  but maybe more accurate */,
    lower_tail: boolean,
    log_p: boolean
): number {
    let ans = pnbeta_raw(x, o_x, a, b, ncp);
    if (isNaN(ans)) return NaN;
    /* return R_DT_val(ans), but we want to warn about cancellation here */
    if (lower_tail) {
        return log_p ? log(ans) : ans;
    } else {
        if (ans > 1 - 1e-10) ML_ERROR3(printer_pnbeta2, ME.ME_PRECISION, 'pnbeta');
        if (ans > 1.0) ans = 1.0; /* Precaution */
        /* include standalone case */
        return log_p ? log1p(-ans) : 1 - ans;
    }
}

export function pnbeta(x: number, a: number, b: number, ncp: number, lower_tail: boolean, log_p: boolean): number {
    if (isNaN(x) || isNaN(a) || isNaN(b) || isNaN(ncp)) return x + a + b + ncp;

    const rc = R_P_bounds_01(lower_tail, log_p, x, 0, 1);
    if (rc !== undefined) {
        return rc;
    }
    return pnbeta2(x, 1 - x, a, b, ncp, lower_tail, log_p);
}
