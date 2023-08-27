import createNS from '@mangos/debug-frontend';
import { ME, R_Q_P01_check, mapErrV2 } from '@common/logger';
import { R_DT_0 } from '@lib/r-func';
import { R_DT_Clog } from './expm1';

const debug = createNS('qexp');

export function qexp(p: number, scale: number, lower_tail: boolean, log_p: boolean): number {
    if (isNaN(p) || isNaN(scale)) return p + scale;

    if (scale < 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    const rc = R_Q_P01_check(log_p, p);
    if (rc !== undefined) {
        return rc;
    }
    if (p === R_DT_0(lower_tail, log_p)) return 0;

    return -scale * R_DT_Clog(lower_tail, log_p, p);
}
