import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';

import { R_D__0, R_D__1, R_D_nonint_checkV2 } from '@lib/r-func';
import dbinom_raw from '@dist/binomial/dbinom_raw';
import DomainError from '@lib/errors/DomainError';
import VariableArgumentError from '@lib/errors/VariableArgumentError';

/**
 *
 * @param {number} x - The number of failures after of "size" successes. When number of failures is reached stop
 * @param {number} size - number of success while accumulating all the failures
 * @param prob - probability of success
 * @param give_log - x given as log
 * @returns {number} - returns probability
 */
export default decorateWithLogger(function dnbinom(this: LoggerEnhanced, x: number, size: number, prob: number, give_log: boolean): number {
    if (isNaN(x) || isNaN(size) || isNaN(prob)) {
        return x + size + prob;
    }

    if (prob <= 0 || prob > 1 || size < 0) {
        this?.printer?.(DomainError, dnbinom.name);
        return NaN;
    }

    const rc = R_D_nonint_checkV2(give_log, x);
    if (rc !== undefined) {
        this?.printer?.(VariableArgumentError, '%s non-integer x = %d', dnbinom.name, x);
        return rc;
    }

    if (x < 0 /*|| !isFinite(x)*/) {
        return R_D__0(give_log);
    }
    /* limiting case as size approaches zero is point mass at zero */
    if (x === 0 && size === 0) {
        return R_D__1(give_log);
    }

    x = Math.round(x);

    const ans = dbinom_raw(size, x + size, prob, 1 - prob, give_log);

    const p = size / (size + x);

    return give_log ? Math.log(p) + ans : p * ans;
});
