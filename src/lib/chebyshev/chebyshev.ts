import { LoggerEnhanced, decorateWithLogger } from '@common/upstairs';
import interplateDomainErrorTemplate from '@lib/errors/interpolateDomainErrorTemplate';

export default decorateWithLogger(function chebyshev_eval(this: LoggerEnhanced, x: number, a: number[], n: number): number {
    let b0: number;
    let b1: number;
    let b2: number;
    let i: number;

    if (n < 1 || n > 1000) {
        this?.error(interplateDomainErrorTemplate, chebyshev_eval.name);
        return NaN;
    }

    if (x < -1.1 || x > 1.1) {
        this?.error(interplateDomainErrorTemplate, chebyshev_eval.name);
        return NaN;
    }

    const twox = x * 2;
    b2 = b1 = 0;
    b0 = 0;
    for (i = 1; i <= n; i++) {
        b2 = b1;
        b1 = b0;
        b0 = twox * b1 - b2 + a[n - i];
    }
    return (b0 - b2) * 0.5;
});
