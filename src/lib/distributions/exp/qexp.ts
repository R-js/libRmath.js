import { R_DT_0 } from '@lib/r-func';
import { R_DT_Clog } from './expm1';
import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';
import DomainError from '@lib/errors/DomainError';
import { R_Q_P01_checkV2 } from '@common/logger';

export default decorateWithLogger(function qexp(this: LoggerEnhanced, p: number, scale: number, lower_tail: boolean, log_p: boolean): number {
    if (isNaN(p) || isNaN(scale)) {
        return p + scale;
    }

    if (scale < 0) {
        this?.printer?.(DomainError, qexp.name);
        return NaN;
    }

    const rc = R_Q_P01_checkV2(log_p, p);
    if (rc !== undefined) {
        this?.printer?.(DomainError, qexp.name);
        return rc;
    }
    if (p === R_DT_0(lower_tail, log_p)) {
        return 0;
    }

    return -scale * R_DT_Clog(lower_tail, log_p, p);
});
