import { rbinomOne } from '@dist/binomial/rbinom';
import { emptyFloat64Array, sumfp64 } from '@lib/r-func';

export function rmultinom(n: number, size: number, prob: Float64Array): Float64Array | never {
    // returns matrix n x prob
    if (n < 0) {
        throw new Error('invalid first argument "n"');
    }
    if (size < 0) {
        throw new Error('invalid second argument "size"');
    }
    if (prob.length === 0) {
        throw new Error('no positive probabilities');
    }
    if (prob.every((_p) => _p >= 0) === false) {
        throw new Error('negative probability');
    }

    const s = sumfp64(prob);
    if (s === 0) {
        throw new Error('no positive probabilities');
    }

    if (n === 0) {
        return emptyFloat64Array;
    }
    if (size === 0) {
        // fill it out with all zeros
        const rc = new Float64Array(n);
        rc.fill(0);
        return rc;
    }
    // allocate matrix
    const rc = new Float64Array(n * prob.length);
    let K = size;
    let pTotal = s;
    for (let i = 0; i < n * prob.length; i++) {
        const i2 = i % prob.length;
        if (i2 === 0) {
            K = size;
            pTotal = s;
        }
        if (prob[i2] === 0) {
            continue;
        }
        if (prob[i2] === pTotal) {
            rc[i] = K;
        } else {
            const pp = prob[i2] / pTotal;
            rc[i] = rbinomOne(K, pp);
        }
        // adjust, because it is sampling without replacement
        K -= rc[i];
        pTotal -= prob[i2];
    }
    return rc;
}
