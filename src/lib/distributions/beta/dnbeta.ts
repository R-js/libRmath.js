import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';
import { R_D__0, R_D_exp, ceil, sqrt } from '@lib/r-func';
import { dpois_raw } from '@dist/poisson/dpois';
import dbeta_scalar from './dbeta';
import DomainError from '@lib/errors/DomainError';

const eps = 1e-15;

//also used by f-distriution
export default decorateWithLogger(function dnbeta(this: LoggerEnhanced, x: number, a: number, b: number, ncp: number, give_log: boolean): number {
    //int
    let kMax;
    //double
    let k;
    let D;
    let term;
    //long double
    let sum;
    let p_k;
    let q;

    if (isNaN(x) || isNaN(a) || isNaN(b) || isNaN(ncp)) return x + a + b + ncp;
    if (ncp < 0 || a <= 0 || b <= 0) {
        this?.printer?.(DomainError, dnbeta.name);
        return NaN;
    }

    if (!isFinite(a) || !isFinite(b) || !isFinite(ncp)) {
        this?.printer?.(DomainError, dnbeta.name);
        return NaN;
    }

    if (x < 0 || x > 1) {
        return R_D__0(give_log);
    }
    //if (ncp === 0) {
    //    return dbeta_scalar(x, a, b, give_log) as number;
    //}
    /* New algorithm, starting with *largest* term : */
    const ncp2 = 0.5 * ncp;
    const dx2 = ncp2 * x;
    const d = (dx2 - a - 1) / 2;
    D = d * d + dx2 * (a + b) - a;
    if (D <= 0) {
        kMax = 0;
    } else {
        D = ceil(d + sqrt(D));
        kMax = D > 0 ? D : 0;
    }

    /* The starting "middle term" --- first look at it's log scale: */
    term = dbeta_scalar(x, a + kMax, b, /* log = */ true);
    p_k = dpois_raw(kMax, ncp2, true);
    if (x === 0 || !isFinite(term) || !isFinite(p_k)) {
        /* if term = +Inf */
        return R_D_exp(give_log, p_k + term);
    }

    /* Now if s_k := p_k * t_k  {here = exp(p_k + term)} would underflow,
     * we should rather scale everything and re-scale at the end:*/

    p_k += term; /* = log(p_k) + log(t_k) == log(s_k) -- used at end to rescale */
    /* mid = 1 = the rescaled value, instead of  mid = exp(p_k); */

    /* Now sum from the inside out */
    sum = term = 1 /* = mid term */;
    /* middle to the left */
    k = kMax;
    while (k > 0 && term > sum * eps) {
        k--;
        q = /* 1 / r_k = */ ((k + 1) * (k + a)) / (k + a + b) / dx2;
        term *= q;
        sum += term;
    }
    /* middle to the right */
    term = 1;
    k = kMax;
    do {
        q = /* r_{old k} = */ (dx2 * (k + a + b)) / (k + a) / (k + 1);
        k++;
        term *= q;
        sum += term;
    } while (term > sum * eps);

    return R_D_exp(give_log, p_k + Math.log(sum));
});
