import { R_DT_0, R_DT_1 } from '@lib/r-func';
import pbeta_raw from './pbeta_raw';
import { LoggerEnhanced, decorateWithLogger } from '@common/upstairs';
import interplateDomainErrorTemplate from '@lib/errors/interpolateDomainErrorTemplate';

export default decorateWithLogger(function pbeta(this: LoggerEnhanced, q: number, a: number, b: number, lowerTail = true, logP = false): number {
    this?.info('pbeta(q=%d, a=%d, b=%d, l.t=%s, ln=%s)', q, a, b, lowerTail, logP);
    if (isNaN(q) || isNaN(a) || isNaN(b)) {
        return NaN;
    }

    if (a < 0 || b < 0) {
        this?.error(interplateDomainErrorTemplate, pbeta.name)
        return NaN;
    }
    // allowing a==0 and b==0  <==> treat as one- or two-point mass

    if (q <= 0) return R_DT_0(lowerTail, logP);
    if (q >= 1) return R_DT_1(lowerTail, logP);

    return pbeta_raw(q, a, b, lowerTail, logP);
});
