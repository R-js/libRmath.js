import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { M_1_SQRT_2PI, M_LN_SQRT_2PI, R_D__0, log as _log } from '@lib/r-func';
const printer = createNS('dlnorm');

export function dlnorm(x: number, meanlog = 0, sdlog = 1, log = false): number {
    if (isNaN(x) || isNaN(meanlog) || isNaN(sdlog)) {
        return x + meanlog + sdlog; // preserve NaN metatdata bits
    }
    if (sdlog <= 0) {
        if (sdlog < 0) {
            return ML_ERR_return_NAN2(printer);
        }
        // sdlog == 0 :
        return Math.log(x) === meanlog ? Infinity : R_D__0(log);
    }
    if (x <= 0) {
        return R_D__0(log);
    }
    // Z- transform
    const y = (_log(x) - meanlog) / sdlog;
    return log
        ? -(M_LN_SQRT_2PI + 0.5 * y * y + _log(x * sdlog))
        : (M_1_SQRT_2PI * Math.exp(-0.5 * y * y)) / (x * sdlog);
    // M_1_SQRT_2PI = 1 / sqrt( 2*pi )
    // M_LN_SQRT_2PI = log( sqrt( 2*pi ) )
}
