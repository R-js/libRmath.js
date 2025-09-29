import { type LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';

import { NumberW } from '@common/toms708/NumberW';
import { R_DT_qIv } from '@dist/exp/expm1';
import { qnorm } from '@dist/normal/qnorm';
import pbinom from './pbinom';
import do_search from './do_search';
import DomainError from '@lib/errors/DomainError';
import VariableArgumentError from '@lib/errors/VariableArgumentError';
import R_Q_P01_boundariesV2 from '@common/R_Q_P01_boundariesV2';

export default decorateWithLogger(function qbinom(this: LoggerEnhanced, p: number, size: number, prob: number, lowerTail = true, logP = false): number {
    const z = new NumberW(0);
    let y: number;

    if (isNaN(p) || isNaN(size) || isNaN(prob)) {
        return NaN;
    }

    if (!isFinite(size) || !isFinite(prob)) {
        this?.printer?.(DomainError, qbinom.name);
        return NaN
    }
    /* if logP is true, p = -Inf is a legitimate value */
    if (!isFinite(p) && !logP) {
        this?.printer?.(DomainError, qbinom.name);
        return NaN
    }

    if (!Number.isInteger(size)) {
        this?.printer?.(DomainError, qbinom.name);
        return NaN
    }

    if (prob < 0 || prob > 1 || size < 0) {
        this?.printer?.(DomainError, qbinom.name);
        return NaN;
    }

    const rc = R_Q_P01_boundariesV2(lowerTail, logP, p, 0, size);
    if (rc !== undefined) {
        return rc;
    }

    //edge cases

    if (prob === 0 || size === 0) return 0;

    const q = 1 - prob;
    if (q === 0) return size; /* covers the full range of the distribution */

    const mu = size * prob; //mean
    const sigma = Math.sqrt(size * prob * q); //standard deviation

    const gamma = (q - prob) / sigma; // = (  (1 - prob)-prob )/sd = (1 - 2pr)/sd

    this?.printer?.(VariableArgumentError,
        'qbinom(p=%d, n=%d, prob=%d, l.t.=%s, log=%s): sigm=%d, gam=%d',
        p,
        size,
        prob,
        lowerTail,
        logP,
        sigma,
        gamma
    );

    /* Note : "same" code in qpois.c, qbinom.c, qnbinom.c --
     * FIXME: This is far from optimal [cancellation for p ~= 1, etc]: */
    if (!lowerTail || logP) {
        p = R_DT_qIv(lowerTail, logP, p); /* need check again (cancellation!): */
        if (p === 0) return 0; // will never happen
        if (p === 1) return size; // will never happen
    }
    /* temporary hack --- FIXME --- */
    //if (p + 1.01 * Number.EPSILON >= 1.) return size;
    if (1 - p < Number.EPSILON) {
        return size;
    }

    /* y := approx.value (Cornish-Fisher expansion) :  */
    z.val = qnorm(p, 0, 1, /*lowerTail*/ true, /*logP*/ false);
    y = Math.floor(mu + sigma * (z.val + (gamma * (z.val * z.val - 1)) / 6) + 0.5);

    if (y > size) {
        /* way off */ y = size;
    }

    this?.printer?.(VariableArgumentError, 'new (p,1-p)=(%d,%d), z=qnorm(..)=%d, y=%d, size=%d', p, 1 - p, z.val, y, size);

    z.val = pbinom(y, size, prob, /*lowerTail*/ true, /*logP*/ false);

    /* fuzz to ensure left continuity: */
    p *= 1 - 64 * Number.EPSILON;

    if (size < 1e5) {
        return do_search(y, z, p, size, prob, 1);
    }
    /* Otherwise be a bit cleverer in the search */

    let incr = Math.floor(size * 0.001);
    let oldincr;
    do {
        oldincr = incr;
        y = do_search(y, z, p, size, prob, incr);
        incr = Math.max(1, Math.floor(incr / 100));
    } while (oldincr > 1 && incr > size * 1e-15);
    return y;
});
