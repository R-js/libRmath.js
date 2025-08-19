import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';

import { rgamma } from '@dist/gamma/rgamma';
import { rpoisOne } from '@dist/poisson/rpois';

const printer_rnbinom = createNS('rnbinom');

export function rnbinomOne(size: number, prob: number): number {
    if (!isFinite(size) || !isFinite(prob) || size <= 0 || prob <= 0 || prob > 1) {
        /* prob = 1 is ok, PR#1218 */
        return ML_ERR_return_NAN2(printer_rnbinom);
    }
    return prob === 1 ? 0 : rpoisOne(rgamma(size, (1 - prob) / prob));
}

const printer_rnbinom_mu = createNS('rnbinom_mu');

export function rnbinom_muOne(size: number, mu: number): number {
    if (!isFinite(size) || !isFinite(mu) || size <= 0 || mu < 0) {
        return ML_ERR_return_NAN2(printer_rnbinom_mu);
    }
    return mu === 0 ? 0 : rpoisOne(rgamma(size, mu / size));
}
