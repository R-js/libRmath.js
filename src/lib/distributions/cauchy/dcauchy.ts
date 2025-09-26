import { createObjectNs } from '@common/debug-frontend';
import DomainError from '@lib/errors/DomainError';
import { isNaN, PI, log as ln } from '@lib/r-func';

const domain = 'dcauchy'
const printer = createObjectNs(domain);

export function dcauchy(x: number, location = 0, scale = 1, log = false): number {
    /* NaNs propagated correctly */
    if (isNaN(x) || isNaN(location) || isNaN(scale)) {
        return x + location + scale;
    }

    if (scale <= 0) {
        printer(DomainError, domain);
        return NaN;
    }

    const y = (x - location) / scale;
    return log ? -ln(PI * scale * (1 + y * y)) : 1 / (PI * scale * (1 + y * y));
}
