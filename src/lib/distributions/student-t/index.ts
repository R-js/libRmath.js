'use strict';
/* This is a conversion from libRmath.so to Typescript/Javascript
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

// needed for random
import { rchisq } from '@dist/chi-2';
import { rnorm } from '@dist/normal';
import { rtOne } from './rt';

//export { rtOne };
//
import { dnt } from './dnt';
import { pnt } from './pnt';
import { qnt } from './qnt';
import { qt as _qt } from './qt';
//
import { repeatedCall64, sqrt } from '@lib/r-func';

export function dt(x: number, df: number, ncp = 0, log = false): number {
    return dnt(x, df, ncp, log);
}

export function pt(q: number, df: number, ncp = 0, lowerTail = true, logP = false): number {
    return pnt(q, df, ncp, lowerTail, logP);
}

export function qt(p: number, df: number, ncp?: number, lowerTail = true, logP = false): number {
    return ncp === undefined ? _qt(p, df, lowerTail, logP) : qnt(p, df, ncp, lowerTail, logP);
}

export function rt(n: number, df: number, ncp?: number): Float64Array {
    if (ncp === undefined) {
        return repeatedCall64(n, rtOne, df);
    }
    // cannot do this enhancement because of bleeding of RNG by rchisq below
    //        (must achieve fidelity)
    //else if (isNaN(ncp))
    //{
    //    return repeatedCall64(n, ()=> NaN)
    //}
    else {
        // have to do it like this, bleeds the RNG's in this order, to create fidelity
        const norm = rnorm(n, ncp, 1); // bleed this first from rng
        const chisq = rchisq(n, df, undefined);
        for (let i = 0; i < n; i++) {
            chisq[i] /= df;
            chisq[i] = sqrt(chisq[i]);
            norm[i] /= chisq[i];
        }
        return norm;
    }
}
export { rtOne };
