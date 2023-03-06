import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { rgamma } from '@dist/gamma/rgamma';

const printer = debug('rchisq');

export function rchisqOne(df: number): number {
    if (!isFinite(df) || df < 0.0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    return rgamma(df / 2.0, 2.0);
}
