import { LoggerEnhanced, decorateWithLogger } from "@common/debug-frontend";
import DomainError from "@lib/errors/DomainError";
import VariableArgumentError from "@lib/errors/VariableArgumentError";
import { R_D__0, R_D__1, R_D_exp, R_D_nonint_checkV2 } from "@lib/r-func";
import { lgammafn_sign } from "@lib/special/gamma";
import dbinom_raw from "../binomial/dbinom_raw";

export default decorateWithLogger(function dnbinom_mu(this: LoggerEnhanced, x: number, size: number, mu: number, give_log: boolean): number {
    /* originally, just set  prob :=  size / (size + mu)  and called dbinom_raw(),
     * but that suffers from cancellation when   mu << size  */

    let p: number;

    if (isNaN(x) || isNaN(size) || isNaN(mu)) {
        return x + size + mu;
    }

    if (mu < 0 || size < 0) {
        this?.printer?.(DomainError, dnbinom_mu.name);
        return NaN;
    }

    const rc = R_D_nonint_checkV2(give_log, x);
    if (rc !== undefined) {
        this?.printer?.(VariableArgumentError, '%s non-integer x = %d', dnbinom_mu.name, x);
        return rc;
    }

    if (x < 0 || !isFinite(x)) {
        return R_D__0(give_log);
    }

    /* limiting case as size approaches zero is point mass at zero,
     * even if mu is kept constant. limit distribution does not
     * have mean mu, though.
     */
    if (x === 0 && size === 0) {
        return R_D__1(give_log);
    }

    x = Math.round(x);
    if (x === 0) {
        /* be accurate, both for n << mu, and n >> mu :*/
        // old code   size * (size < mu ? Math.log(size / (size + mu)) : Math.log1p(- mu / (size + mu))));
        let llogx: number;
        if (size < mu) {
            llogx = Math.log(size / (size + mu));
        } else {
            llogx = Math.log1p(-mu / (size + mu));
        }
        return R_D_exp(give_log, size * llogx);
    }
    if (x < 1e-10 * size) {
        /* don't use dbinom_raw() but MM's formula: */
        /* FIXME --- 1e-8 shows problem; rather use algdiv() from ./toms708.c */
        p = size < mu ? Math.log(size / (1 + size / mu)) : Math.log(mu / (1 + mu / size));
        return R_D_exp(give_log, x * p - mu - lgammafn_sign(x + 1) + Math.log1p((x * (x - 1)) / (2 * size)));
    }

    /* else: no unnecessary cancellation inside dbinom_raw, when
     * x_ = size and n_ = x+size are so close that n_ - x_ loses accuracy
     */

    const ans = dbinom_raw(size, x + size, size / (size + mu), mu / (size + mu), give_log);
    p = size / (size + x);

    return give_log ? Math.log(p) + ans : p * ans;
})
