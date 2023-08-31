import createNS from '@mangos/debug-frontend';

import { ME, mapErrV2 } from '@common/logger';
import { R_DT_0, R_DT_1 } from '@lib/r-func';
import { R_DT_Clog } from '@dist/exp/expm1';

const debug = createNS('pgeom');

export function pgeom(q: number, p: number, lowerTail = true, logP = false): number {
    if (isNaN(q) || isNaN(p)) return NaN;

    if (p <= 0 || p > 1) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    if (q < 0) return R_DT_0(lowerTail, logP);
    if (!isFinite(q)) return R_DT_1(lowerTail, logP);
    q = Math.floor(q + 1e-7);

    if (p === 1) {
        /* we cannot assume IEEE */
        q = lowerTail ? 1 : 0;
        return logP ? Math.log(q) : q;
    }
    q = Math.log1p(-p) * (q + 1);
    if (logP) return R_DT_Clog(lowerTail, logP, q);
    else return lowerTail ? -Math.expm1(q) : Math.exp(q);
}
