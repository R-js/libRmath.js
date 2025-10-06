import { R_DT_qIv } from '@dist/exp/expm1';
import pnbeta from './pnbeta';
import R_Q_P01_boundariesV2 from '@common/R_Q_P01_boundariesV2';
import { LoggerEnhanced, decorateWithLogger } from '@common/upstairs';
import interplateDomainErrorTemplate from '@lib/errors/interpolateDomainErrorTemplate';

const accu = 1e-15;
const eps = 1e-14; /* must be > accu */

export default decorateWithLogger(function qnbeta(this: LoggerEnhanced, p: number, a: number, b: number, ncp: number, lower_tail: boolean, log_p: boolean): number {
    let ux;
    let lx;
    let nx;
    let pp;

    if (isNaN(p) || isNaN(a) || isNaN(b) || isNaN(ncp)) {
        return p + a + b + ncp;
    }

    if (!isFinite(a)) {
        this?.error(interplateDomainErrorTemplate, qnbeta.name);
        return NaN;
    }

    if (ncp < 0 || a <= 0 || b <= 0) {
        this?.error(interplateDomainErrorTemplate, qnbeta.name);
        return NaN;
    }

    const rc = R_Q_P01_boundariesV2(lower_tail, log_p, p, 0, 1);
    if (rc !== undefined) {
        return rc;
    }
    p = R_DT_qIv(lower_tail, log_p, p);

    /* Invert pnbeta(.) :
     * 1. finding an upper and lower bound */
    if (p > 1 - Number.EPSILON) {
        return 1.0;
    }
    pp = Math.min(1 - Number.EPSILON, p * (1 + eps));
    for (ux = 0.5; ux < 1 - Number.EPSILON && pnbeta(ux, a, b, ncp, true, false) < pp; ux = 0.5 * (1 + ux));
    pp = p * (1 - eps);
    for (lx = 0.5; lx > Number.MIN_VALUE && pnbeta(lx, a, b, ncp, true, false) > pp; lx *= 0.5);

    /* 2. interval (lx,ux)  halving : */
    do {
        nx = 0.5 * (lx + ux);
        if (pnbeta(nx, a, b, ncp, true, false) > p) ux = nx;
        else lx = nx;
    } while ((ux - lx) / nx > accu);

    return 0.5 * (ux + lx);
});


