import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { dpois_raw } from '@dist/poisson/dpois';
import { R_D__0 } from '@lib/r-func';

const printer = createNS('dgamma');

export function dgamma(x: number, shape: number, scale: number, aslog: boolean): number {
    let pr: number;

    if (isNaN(x) || isNaN(shape) || isNaN(scale)) {
        return x + shape + scale;
    }
    if (shape < 0 || scale <= 0) {
        printer(DomainError);
        return NaN;
    }
    if (x < 0) {
        return R_D__0(aslog);
    }
    if (shape === 0) {
        /* point mass at 0 */
        return x === 0 ? Infinity : R_D__0(aslog);
    }
    if (x === 0) {
        if (shape < 1) return Infinity;
        if (shape > 1) {
            return R_D__0(aslog);
        }
        /* else */
        return aslog ? -Math.log(scale) : 1 / scale;
    }

    if (shape < 1) {
        pr = dpois_raw(shape, x / scale, aslog);
        return aslog ? pr + Math.log(shape / x) : (pr * shape) / x;
    }
    /* else  shape >= 1 */
    pr = dpois_raw(shape - 1, x / scale, aslog);
    //console.log(pr, aslog);
    return aslog ? pr - Math.log(scale) : pr / scale;
}
