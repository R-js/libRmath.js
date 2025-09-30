import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';
import { exp_rand } from './sexp';

import { globalUni } from '@rng/global-rng';
import DomainError from '@lib/errors/DomainError';

export default decorateWithLogger(function rexp(this: LoggerEnhanced, rate: number): number {
    const rng = globalUni();
    if (rate === Infinity || isNaN(rate) || rate <= 0) {
        if (rate === Infinity || rate === -Infinity) {
            return 0;
        }
        /* else */
        this?.printer?.(DomainError, rexp.name);
        return NaN;
    }
    return exp_rand(rng) / rate; // --> in ./sexp.c
});
