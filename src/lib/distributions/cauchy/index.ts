import { rcauchyOne } from './rcauchy';

export { dcauchy } from './dcauchy';
export { pcauchy } from './pcauchy';
export { qcauchy } from './qcauchy';
export { rcauchyOne};

import { repeatedCall } from '@lib/r-func';

export function rcauchy(n: number, location = 0, scale = 1): Float32Array {
    return repeatedCall(n, rcauchyOne, location, scale);
}

