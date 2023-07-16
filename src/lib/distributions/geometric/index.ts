export { dgeom } from './dgeom';
export { pgeom } from './pgeom';
export { qgeom } from './qgeom';
import { rgeomOne } from './rgeom';
import { repeatedCall64 } from '@lib/r-func';

export function rgeom(n: number, prob: number): Float64Array {
    return repeatedCall64(n, rgeomOne, prob);
}

export { rgeomOne };
