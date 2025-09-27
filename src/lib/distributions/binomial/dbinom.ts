
import { R_D__0, R_D_negInonint, R_D_nonint_checkV2 } from '@lib/r-func';

import DomainError from '@lib/errors/DomainError';
import VariableArgumentError from '@lib/errors/VariableArgumentError';
import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';
import dbinom_raw from './dbinom_raw';

export default decorateWithLogger(function dbinom(this: LoggerEnhanced, x: number, n: number, prob: number, log = false): number {
    /* NaNs propagated correctly */
    if (isNaN(x) || isNaN(n) || isNaN(prob)) {
        return x + n + prob;
    }

    if (prob < 0 || prob > 1 || R_D_negInonint(n)) {
        this?.printer?.(DomainError, dbinom.name);
        return NaN;
    }

    const ch = R_D_nonint_checkV2(log, x);
    if (ch !== undefined) {
        this?.printer?.(VariableArgumentError, '%s non-integer x = %d', dbinom.name, x);
        return ch;
    }
    if (x < 0 || !isFinite(x)) {
        return R_D__0(log);
    }

    n = Math.round(n);
    x = Math.round(x);

    return dbinom_raw(x, n, prob, 1 - prob, log);
});
