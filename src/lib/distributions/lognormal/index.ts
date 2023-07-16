export { dlnorm } from './dlnorm';
export { plnorm } from './plnorm';
export { qlnorm } from './qlnorm';
import { rlnormOne } from './rlnorm';
import { repeatedCall } from '@lib/r-func';

export { rlnormOne };

export function rlnorm(n: number, meanlog = 0, sdlog = 1): Float32Array {
    return repeatedCall(n, rlnormOne, meanlog, sdlog);
}
