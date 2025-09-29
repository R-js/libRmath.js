//distros
//dbeta
import dbeta_scalar from './dbeta';
import dnbeta_scalar from './dnbeta';

//pbeta
import { default as _pbeta } from './pbeta';
import { default as _pnbeta } from './pnbeta';

//qbeta
import { default as _qbeta } from './qbeta';
import { default as _qnbeta } from './qnbeta';

//rbeta
import { default as rchisqOne } from '@dist/chi-2/rchisq';
import { default as rnchisqOne } from '@dist/chi-2/rnchisq';
import { default as rbetaOne } from './rbeta';

//helper
import { repeatedCall } from '@lib/r-func';

export { rbetaOne };

export function dbeta(x: number, shape1: number, shape2: number, ncp?: number, log = false): number {
    // I added the === 0 here, because dnbeta will go back to dbeta if 0 (c source code)
    if (ncp === undefined) {
        return dbeta_scalar(x, shape1, shape2, log);
    } else {
        return dnbeta_scalar(x, shape1, shape2, ncp, log);
    }
}

export function pbeta(q: number, shape1: number, shape2: number, ncp?: number, lowerTail = true, logP = false): number {
    if (ncp === undefined) {
        return _pbeta(q, shape1, shape2, lowerTail, logP);
    } else {
        return _pnbeta(q, shape1, shape2, ncp, lowerTail, logP);
    }
}

export function qbeta(p: number, shape1: number, shape2: number, ncp?: number, lowerTail = true, logP = false): number {
    if (ncp === undefined) {
        return _qbeta(p, shape1, shape2, lowerTail, logP);
    } else {
        return _qnbeta(p, shape1, shape2, ncp, lowerTail, logP);
    }
}

export function rbeta(n: number, shape1: number, shape2: number, ncp?: number): Float32Array {
    if (ncp === undefined) {
        return repeatedCall(n, rbetaOne, shape1, shape2);
    } else {
        const ar = repeatedCall(n, rnchisqOne, 2 * shape1, ncp);
        const br = repeatedCall(n, rchisqOne, 2 * shape2);
        const result = ar.map((a, i) => a / (a + br[i]));
        return result;
    }
}
