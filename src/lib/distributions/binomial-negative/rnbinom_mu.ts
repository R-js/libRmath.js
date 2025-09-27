import { type LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';
import { rpoisOne } from "../poisson";
import { rgamma } from '@dist/gamma/rgamma';
import DomainError from "@lib/errors/DomainError";

export default decorateWithLogger(function rnbinom_mu(this: LoggerEnhanced, size: number, mu: number): number {
    if (!isFinite(size) || !isFinite(mu) || size <= 0 || mu < 0) {
        this?.printer?.(DomainError, rnbinom_mu.name);
        return NaN;
    }
    return mu === 0 ? 0 : rpoisOne(rgamma(size, mu / size));
});
