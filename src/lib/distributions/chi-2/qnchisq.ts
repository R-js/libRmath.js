import createNS from '@common/debug-frontend';

import { R_D_qIv } from '@lib/r-func';

import {
    ME,
    ML_ERROR3,
    ML_ERR_return_NAN2,
    R_Q_P01_boundaries
} from '@common/logger';

import { qchisq } from './qchisq';
import { pnchisq_raw } from './pnchisq';

const printer = createNS('qnchisq');

const accu = 1e-13;
const racc = 4 * Number.EPSILON;
const DBL_MIN = 2.2250738585072014e-308;
const DBL_MAX = 1.7976931348623158e308;
/* these two are for the "search" loops, can have less accuracy: */
const Eps = 1e-11; /* must be > accu */
const rEps = 1e-10; /* relative tolerance ... */

export function qnchisq(p: number, df: number, ncp: number, lower_tail: boolean, log_p: boolean): number {
    // double
    let ux: number;
    let lx: number;
    let ux0: number;
    let nx: number;
    let pp: number;

    if (isNaN(p) || isNaN(df) || isNaN(ncp)) {
        return NaN;
    }

    if (!isFinite(df)) {
        return ML_ERR_return_NAN2(printer);
    }

    /* Was
     * df = floor(df + 0.5);
     * if (df < 1 || ncp < 0) ML_ERR_return_NAN;
     */
    if (df < 0 || ncp < 0) {
        return ML_ERR_return_NAN2(printer);
    }

    const rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }

    pp = R_D_qIv(log_p, p);
    if (pp > 1 - Number.EPSILON) {
        return lower_tail ? Infinity : 0.0;
    }

    /* Invert pnchisq(.) :
     * 1. finding an upper and lower bound */
    {
        /* This is Pearson's (1959) approximation,
       which is usually good to 4 figs or so.  */
        //double

        const b = (ncp * ncp) / (df + 3 * ncp);
        const c = (df + 3 * ncp) / (df + 2 * ncp);
        const ff = (df + 2 * ncp) / (c * c);
        ux = b + c * qchisq(p, ff, lower_tail, log_p);
        if (ux < 0) ux = 1;
        ux0 = ux;
    }

    if (!lower_tail && ncp >= 80) {
        // in this case, pnchisq() works via lower_tail = TRUE
        if (pp < 1e-10) {
            ML_ERROR3(printer, ME.ME_PRECISION, 'qnchisq');
        }
        // p = R_DT_qIv(p)
        p = log_p ? -Math.expm1(pp) : 1 - pp;
        lower_tail = true;
    } else {
        p = pp;
    }

    pp = Math.min(1 - Number.EPSILON, p * (1 + Eps));
    if (lower_tail) {
        for (; ux < DBL_MAX && pnchisq_raw(ux, df, ncp, Eps, rEps, 10000, true, false) < pp; ux *= 2);
        pp = p * (1 - Eps);
        for (
            lx = Math.min(ux0, DBL_MAX);
            lx > DBL_MIN && pnchisq_raw(lx, df, ncp, Eps, rEps, 10000, true, false) > pp;
            lx *= 0.5
        );
    } else {
        for (; ux < DBL_MAX && pnchisq_raw(ux, df, ncp, Eps, rEps, 10000, false, false) > pp; ux *= 2);
        pp = p * (1 - Eps);
        for (
            lx = Math.min(ux0, DBL_MAX);
            lx > DBL_MIN && pnchisq_raw(lx, df, ncp, Eps, rEps, 10000, false, false) < pp;
            lx *= 0.5
        );
    }

    /* 2. interval (lx,ux)  halving : */
    if (lower_tail) {
        do {
            nx = 0.5 * (lx + ux);
            if (pnchisq_raw(nx, df, ncp, accu, racc, 100000, true, false) > p) ux = nx;
            else lx = nx;
        } while ((ux - lx) / nx > accu);
    } else {
        do {
            nx = 0.5 * (lx + ux);
            if (pnchisq_raw(nx, df, ncp, accu, racc, 100000, false, false) < p) ux = nx;
            else lx = nx;
        } while ((ux - lx) / nx > accu);
    }
    return 0.5 * (ux + lx);
}
