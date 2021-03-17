/* This is a conversion from LIB-R-MATH to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//distros
//dbeta
import { dbeta_scalar } from './dbeta';
import { dnbeta_scalar } from './dnbeta';

//pbeta
import { pbeta as _pbeta } from './pbeta';
import { pnbeta as _pnbeta } from './pnbeta';

//qbeta
import { qbeta_scalar } from './qbeta';
import { qnbeta as _qnbeta } from './qnbeta';

//rbeta
import { rchisqOne } from '@dist/chi-2/rchisq';
import { rnchisqOne } from '@dist/chi-2/rnchisq';
import { rbetaOne } from './rbeta';

//helper
import { repeatedCall } from '$helper'
import { IRNGNormal } from '@rng/normal/normal-rng';
import { globalNorm } from '@rng/globalRNG';

export { rbetaOne };

export function dbeta(x: number, shape1: number, shape2: number, ncp?: number, log?: boolean): number {
    // I added the === 0 here, because dnbeta will go back to dbeta if 0 (c source code)
    if (ncp === undefined || ncp === 0) {
        return dbeta_scalar(x, shape1, shape2, log || false);
    } else {
        return dnbeta_scalar(x, shape1, shape2, ncp, log || false);
    }
}

export function pbeta(q: number, shape1: number, shape2: number, ncp?: number, lowerTail = true, logP = false): number {
    if (ncp === undefined || ncp === 0) {
        return _pbeta(q, shape1, shape2, lowerTail, logP);
    } else {
        return _pnbeta(q, shape1, shape2, ncp, lowerTail, logP);
    }
}

export function qbeta(p: number, shape1: number, shape2: number, ncp?: number, lowerTail = true, logP = false): number {
    if (ncp === undefined) {
        return qbeta_scalar(p, shape1, shape2, lowerTail, logP);
    } else {
        return _qnbeta(p, shape1, shape2, ncp, lowerTail, logP);
    }
}

export function rbeta(
    n: number,
    shape1: number,
    shape2: number,
    ncp = 0, // NOTE: normally the default is undefined, here it is '0'.
    rng?: IRNGNormal
): Float32Array {
    const _rng = rng || globalNorm();
    if (ncp === 0) {
        return repeatedCall(n, rbetaOne, shape1, shape2, _rng.uniform_rng);
    } else {
        const ar = repeatedCall(n, rnchisqOne, 2 * shape1, ncp, _rng);
        const br = repeatedCall(n, rchisqOne, 2 * shape2, _rng);
        const result = ar.map((a, i) => a/(a+br[i]));
        return result;
    }
}

