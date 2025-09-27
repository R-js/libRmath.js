import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';

import pbeta from '../beta/pbeta';
import { R_DT_0, R_DT_1, R_nonint } from '@lib/r-func';
import DomainError from '@lib/errors/DomainError';
import VariableArgumentError from '@lib/errors/VariableArgumentError';


export default decorateWithLogger(function pbinom(this: LoggerEnhanced, x: number, n: number, prob: number, lowerTail = true, logP = false): number {
    if (isNaN(x) || isNaN(n) || isNaN(prob)) return NaN;
    if (!isFinite(n) || !isFinite(prob)) {
        this?.printer?.(DomainError, pbinom.name);
        return NaN;
    }

    const lower_tail = lowerTail;
    const log_p = logP;

    if (R_nonint(n)) {
        this?.printer?.(VariableArgumentError, '%s non-integer n = %d', pbinom.name, n);
        this?.printer?.(DomainError, pbinom.name);
        return NaN;
    }
    n = Math.round(n);
    /* 
     PR#8560: n=0 is a valid value 
  */
    if (n < 0 || prob < 0 || prob > 1) {
        this?.printer?.(DomainError, pbinom.name);
        return NaN;
    }

    if (x < 0) return R_DT_0(lower_tail, log_p);
    x = Math.floor(x + 1e-7);
    if (n <= x) return R_DT_1(lower_tail, log_p);
    this?.printer?.(
        VariableArgumentError,
        'calling pbeta:(q=%d,a=%d,b=%d, l.t=%s, log=%s',
        prob,
        x + 1,
        n - x,
        !lower_tail,
        log_p
    );
    return pbeta(prob, x + 1, n - x, !lower_tail, log_p);
});
