
import { abs as fabs, max as fmax2, min as fmin2, } from '@lib/r-func';

import {
    POSITIVE_INFINITY,
    EPSILON,
    isNaN,
    isFinite,
} from '@lib/r-func';
/* Used as a substitute for the C99 function hypot, which all currently
   known platforms have */

/* hypot(a,b)	finds sqrt(a^2 + b^2)
 *		without overflow or destructive underflow.
 */

 export default function hypot(a: number, b: number): number {
    let p: number;
    let r: number;
    let s: number;
    let t: number;
    let tmp: number;
    let u: number;

    if (isNaN(a) || isNaN(b)) {
        //* propagate Na(N)s:
        return a + b;
    }
    if (!isFinite(a) || !isFinite(b)) {
        return POSITIVE_INFINITY;
    }
    p = fmax2(fabs(a), fabs(b));
    if (p !== 0.0) {
        // r = (min(|a|,|b|) / p) ^2
        tmp = fmin2(fabs(a), fabs(b)) / p;
        r = tmp * tmp;
        for (;;) {
            t = 4.0 + r;
            // This was a test of 4.0 + r == 4.0, but optimizing
            //      compilers nowadays infinite loop on that.
            if (fabs(r) < 2 * EPSILON) break;
            s = r / t;
            u = 1 + 2 * s;
            p *= u;

            // r = (s / u)^2 * r
            tmp = s / u;
            r *= tmp * tmp;
        }
    }
    return p;
}
