'use strict';

export { dwilcox } from './dwilcox';
export { pwilcox } from './pwilcox';
export { qwilcox } from './qwilcox';
import { rwilcoxOne } from './rwilcox';
import { repeatedCall } from '@lib/r-func';


export { rwilcoxOne };
export function rwilcox(nn: number, m: number, n: number): Float32Array {
    return repeatedCall(nn, rwilcoxOne, m, n);
}

