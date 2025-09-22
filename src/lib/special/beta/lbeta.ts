import createNS from '@common/debug-frontend';

import { ML_ERR_return_NAN2 } from '@common/logger';

import { M_LN_SQRT_2PI } from '@lib/r-func';

import { gamma } from '@special/gamma';
import { lgammafn_sign } from '@special/gamma/lgammafn_sign';
import { lgammacor } from '@special/gamma/lgammacor';

const printer = createNS('lbeta');

function lbeta(a: number, b: number): number {
    let corr: number;
    let p: number;
    let q: number;

    if (isNaN(a) || isNaN(b)) return a + b;
    p = q = a;
    if (b < p) p = b; // := min(a,b)
    if (b > q) q = b; // := max(a,b)

    // both arguments must be >= 0
    if (p < 0) {
        printer(DomainError);
        return NaN;
    } else if (p === 0) {
        return Infinity;
    } else if (!isFinite(q)) {
        // q == +Inf
        return -Infinity;
    }

    if (p >= 10) {
        // p and q are big.
        corr = lgammacor(p) + lgammacor(q) - lgammacor(p + q);
        return (
            Math.log(q) * -0.5 + M_LN_SQRT_2PI + corr + (p - 0.5) * Math.log(p / (p + q)) + q * Math.log1p(-p / (p + q))
        );
    } else if (q >= 10) {
        // p is small, but q is big.
        corr = lgammacor(q) - lgammacor(p + q);
        return lgammafn_sign(p) + corr + p - p * Math.log(p + q) + (q - 0.5) * Math.log1p(-p / (p + q));
    } else {
        // p and q are small: p <= q < 10.
        // R change for very small args
        // removed
        if (p < 1e-306) return lgammafn_sign(p) + (lgammafn_sign(q) - lgammafn_sign(p + q));
        else return Math.log(gamma(p) * (gamma(q) / gamma(p + q)));
    }
}

export default lbeta;
