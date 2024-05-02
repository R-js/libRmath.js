

export { dweibull } from './dweibull';
export { pweibull } from './pweibull';
export { qweibull } from './qweibull';
import { rweibullOne } from './rweibull';

import { repeatedCall64 } from '@lib/r-func';

export { rweibullOne };

export function rweibull(n: number, shape: number, scale = 1): Float64Array {
    return repeatedCall64(n, rweibullOne, shape, scale);
}
