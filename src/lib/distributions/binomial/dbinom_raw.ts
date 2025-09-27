import bd0 from "@lib/deviance";
import { M_LN_2PI, R_D__0, R_D__1, R_D_exp } from "@lib/r-func";
import { stirlerr } from "@lib/stirling";

export default function dbinom_raw(x: number, n: number, p: number, q: number, give_log: boolean): number {
    let lc: number;

    if (p === 0) return x === 0 ? R_D__1(give_log) : R_D__0(give_log);
    if (q === 0) return x === n ? R_D__1(give_log) : R_D__0(give_log);

    if (x === 0) {
        if (n === 0) return R_D__1(give_log);
        const lc = p < 0.1 ? -bd0(n, n * q) - n * p : n * Math.log(q);
        return R_D_exp(give_log, lc);
    }

    if (x === n) {
        lc = q < 0.1 ? -bd0(n, n * p) - n * q : n * Math.log(p);
        return R_D_exp(give_log, lc);
    }

    if (x < 0 || x > n) return R_D__0(give_log);

    /* n*p or n*q can underflow to zero if n and p or q are small.  This
       used to occur in dbeta, and gives NaN as from R 2.3.0.  */
    lc = stirlerr(n) - stirlerr(x) - stirlerr(n - x) - bd0(x, n * p) - bd0(n - x, n * q);

    /* f = (M_2PI*x*(n-x))/n; could overflow or underflow */
    /* Upto R 2.7.1:
     * lf = Math.log(M_2PI) + Math.log(x) + Math.log(n-x) - Math.log(n);
     * -- following is much better for  x << n : */
    const lf = M_LN_2PI + Math.log(x) + Math.log1p(-x / n);

    return R_D_exp(give_log, lc - 0.5 * lf);
}
