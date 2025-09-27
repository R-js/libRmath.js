import rcauchyOne from './rcauchy';
import { repeatedCall } from '@lib/r-func';

export { default as dcauchy } from './dcauchy';
export { default as pcauchy } from './pcauchy';
export { default as qcauchy } from './qcauchy';
export { rcauchyOne };

export function rcauchy(n: number, location = 0, scale = 1): Float32Array {
    return repeatedCall(n, rcauchyOne, location, scale);
}
