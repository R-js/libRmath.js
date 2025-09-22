

import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2, R_Q_P01_boundaries } from '@common/logger';
import { R_DT_qIv } from '@dist/exp/expm1';
import { DBL_EPSILON, min, max, abs, DBL_MAX } from '@lib/r-func';
import { qnorm } from '@dist/normal/qnorm';
import { pnt } from './pnt';
import { qt } from './qt';

const printer = createNS('qnt');

const accu = 1e-13;
const Eps = 1e-11; /* must be > accu */

export function qnt(p: number, df: number, ncp: number, lower_tail: boolean, log_p: boolean): number {
    let ux;
    let lx;
    let nx;
    let pp;

    if (isNaN(p) || isNaN(df) || isNaN(ncp)) {
        return p + df + ncp;
    }

    if (df <= 0) {
        printer(DomainError);
        return NaN;
    }

    if (ncp === 0 && df >= 1) {
        return qt(p, df, lower_tail, log_p);
    }

    const rc = R_Q_P01_boundaries(lower_tail, log_p, p, -Infinity, Infinity);
    if (rc !== undefined) {
        return rc;
    }

    if (!isFinite(df)) {
        // df = Inf ==> limit N(ncp,1)
        return qnorm(p, ncp, 1, lower_tail, log_p);
    }

    p = R_DT_qIv(lower_tail, log_p, p);

    /* Invert pnt(.) :
     * 1. finding an upper and lower bound */
    if (p > 1 - DBL_EPSILON) {
        return Infinity;
    }

    pp = min(1 - DBL_EPSILON, p * (1 + Eps));

    for (ux = max(1, ncp); ux < DBL_MAX && pnt(ux, df, ncp, true, false) < pp; ux *= 2);

    pp = p * (1 - Eps);

    for (lx = min(-1, -ncp); lx > -DBL_MAX && pnt(lx, df, ncp, true, false) > pp; lx *= 2);

    /* 2. interval (lx,ux)  halving : */
    do {
        nx = 0.5 * (lx + ux); // could be zero
        if (pnt(nx, df, ncp, true, false) > p) {
            ux = nx;
        } else {
            lx = nx;
        }
    } while (ux - lx > accu * max(abs(lx), abs(ux)));

    return 0.5 * (lx + ux);
}
