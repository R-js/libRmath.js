import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';

const printer = debug('rcauchy');
import { globalUni } from '@lib/rng';

export function rcauchyOne(location = 0, scale = 1): number {
    const rng = globalUni();
    if (isNaN(location) || !isFinite(scale) || scale < 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    if (scale === 0 || !isFinite(location)) {
        return location;
    }
    return location + scale * Math.tan(Math.PI * rng.random());
}
