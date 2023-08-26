import createNS from '@mangos/debug-frontend';

import { ME, mapErrV2, R_Q_P01_boundaries } from '@common/logger';
import { R_DT_0, R_DT_1 } from '@lib/r-func';

import { NumberW } from '@common/toms708/NumberW';

import { R_DT_qIv } from '@dist/exp/expm1';
import { qnorm } from '@dist/normal/qnorm';
import { pnbinom } from './pnbinom';

const printer_do_search = createNS('do_search');

function do_search(y: number, z: NumberW, p: number, n: number, pr: number, incr: number): number {
    printer_do_search('start: y:%d, z:%o, p:%d, n:%d, pr:%d, incr:%d', y, z, p, n, pr, incr);
    if (z.val >= p) {
        //* search to the left
        for (;;) {
            if (
                y === 0 ||
                (z.val = pnbinom(
                    y - incr,
                    n,
                    pr,
                    true, ///log_p,
                    false
                )) < p
            ) {
                printer_do_search('exit1');
                return y;
            }
            y = Math.max(0, y - incr);
        } //while
    } else {
        // search to the right

        for (;;) {
            y = y + incr;
            if (
                (z.val = pnbinom(
                    y,
                    n,
                    pr, //l._t.
                    true,
                    false
                )) >= p
            ) {
                printer_do_search('exit2');
                return y;
            }
        } //while
    } //if
}

const printer_qnbinom = createNS('qnbinom');

export function qnbinom(p: number, size: number, prob: number, lower_tail: boolean, log_p: boolean): number {
    let y;

    const z = new NumberW(0);

    if (isNaN(p) || isNaN(size) || isNaN(prob)) {
        return NaN;
    }

    /* this happens if specified via mu, size, since
       prob == size/(size+mu)
    */
    if (prob === 0 && size === 0) return 0;

    if (prob <= 0 || prob > 1 || size < 0) {
        printer_qnbinom(mapErrV2[ME.ME_DOMAIN], printer_qnbinom.namespace);
        return NaN;
    }

    if (prob === 1 || size === 0) return 0;

    const rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }
    const Q = 1.0 / prob;
    const P = (1.0 - prob) * Q;
    const mu = size * P;
    const sigma = Math.sqrt(size * P * Q);
    const gamma = (Q + P) / sigma;

    /* Note : "same" code in qpois.c, qbinom.c, qnbinom.c --
     * FIXME: This is far from optimal [cancellation for p ~= 1, etc]: */
    if (!lower_tail || log_p) {
        p = R_DT_qIv(lower_tail, log_p, p); /* need check again (cancellation!): */
        // code below will not execute because of "R_Q_P01_boundaries" check above
        const rdt0 = R_DT_0(lower_tail, log_p);
        const rdt1 = R_DT_1(lower_tail, log_p);
        if (p === rdt0) return 0;
        if (p === rdt1) return Infinity;
    }
    /* temporary hack --- FIXME --- */
    if (p + 1.01 * Number.EPSILON >= 1) return Infinity;

    /* y := approx.value (Cornish-Fisher expansion) :  */
    z.val = qnorm(p, 0, 1, /*lower_tail*/ true, /*log_p*/ false);
    y = Math.round(mu + sigma * (z.val + (gamma * (z.val * z.val - 1)) / 6));

    z.val = pnbinom(y, size, prob, /*lower_tail*/ true, /*log_p*/ false);

    /* fuzz to ensure left continuity: */
    p *= 1 - 64 * Number.EPSILON;

    /* If the C-F value is not too large a simple search is OK */
    if (y < 1e5) return do_search(y, z, p, size, prob, 1);
    /* Otherwise be a bit cleverer in the search */
    {
        let incr = Math.floor(y * 0.001);
        let oldincr;
        do {
            oldincr = incr;
            y = do_search(y, z, p, size, prob, incr);
            incr = Math.max(1, Math.floor(incr / 100));
        } while (oldincr > 1 && incr > y * 1e-15);
        return y;
    }
}

export function qnbinom_mu(p: number, size: number, mu: number, lower_tail: boolean, log_p: boolean): number {
    return qnbinom(p, size, /* prob = */ size / (size + mu), lower_tail, log_p);
}
