import { createObjectNs } from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';

import { rgamma } from '@dist/gamma/rgamma';
import { rpoisOne } from '@dist/poisson/rpois';
import DomainError from '@lib/errors/DomainError';

const domain = 'rnbinom'
const printer_rnbinom = createObjectNs(domain);

export function rnbinomOne(size: number, prob: number): number {
    if (!isFinite(size) || !isFinite(prob) || size <= 0 || prob <= 0 || prob > 1) {
        /* prob = 1 is ok, PR#1218 */
        printer_rnbinom(DomainError, domain);
        return NaN;
    }
    return prob === 1 ? 0 : rpoisOne(rgamma(size, (1 - prob) / prob));
}

const domain_mu = 'rnbinom_mu';
const printer_rnbinom_mu = createObjectNs(domain_mu);

export function rnbinom_muOne(size: number, mu: number): number {
    if (!isFinite(size) || !isFinite(mu) || size <= 0 || mu < 0) {
        printer_rnbinom_mu(DomainError, domain_mu);
        return NaN;
    }
    return mu === 0 ? 0 : rpoisOne(rgamma(size, mu / size));
}
