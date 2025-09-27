import { LoggerEnhanced, decorateWithLogger } from '@common/debug-frontend';
import DomainError from '@lib/errors/DomainError';
import { isNaN, PI, log as ln } from '@lib/r-func';

export default decorateWithLogger(dcauchy);

function dcauchy(this: LoggerEnhanced, x: number, location = 0, scale = 1, log = false): number {
    if (isNaN(x) || isNaN(location) || isNaN(scale)) {
        return x + location + scale;
    }

    if (scale <= 0) {
        this?.printer?.(DomainError, dcauchy.name);
        return NaN;
    }

    const y = (x - location) / scale;
    return log ? -ln(PI * scale * (1 + y * y)) : 1 / (PI * scale * (1 + y * y));
}
