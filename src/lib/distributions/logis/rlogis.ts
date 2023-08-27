import createNS from '@mangos/debug-frontend';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { globalUni } from '@lib/rng';
const printer_rlogis = debug('rlogis');

export function rlogisOne(location = 0, scale = 1): number {
    const rng = globalUni();
    if (isNaN(location) || !isFinite(scale)) {
        return ML_ERR_return_NAN2(printer_rlogis, lineInfo4);
    }

    if (scale === 0 || !isFinite(location)) return location;
    else {
        const u: number = rng.random();
        return location + scale * Math.log(u / (1 - u));
    }
}
