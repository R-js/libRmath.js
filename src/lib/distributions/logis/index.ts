
export { dlogis } from './dlogis';
export { plogis } from './plogis';
export { qlogis } from './qlogis';
import { rlogisOne } from './rlogis';
import { repeatedCall64 } from '@lib/r-func';


export { rlogisOne };

export function rlogis(n: number, location = 0, scale = 1): Float64Array {
    return repeatedCall64(n, rlogisOne, location, scale);
}


