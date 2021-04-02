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
import { rchisq } from '@dist/chi-2';
import { rnorm } from '@dist/normal';

//
import { dnt } from './dnt';
import { dt as _dt } from './dt';
import { pnt } from './pnt';
import { pt as _pt } from './pt';
import { qnt } from './qnt';
import { qt as _qt } from './qt';
//
import { rtOne } from './rt';

import { repeatedCall } from '$helper';
import { emptyFloat32Array } from '$constants';
import { globalNorm } from '@rng/globalRNG';
export { rtOne };



export function dt(x: number, df: number, ncp?: number, asLog = false): number {
    if (ncp === undefined) {
        return _dt(x, df, asLog);
    }
    return dnt(x, df, ncp, asLog);
}

export function pt(q: number, df: number, ncp?: number, lowerTail = true, logP = false): number {
    if (ncp === undefined) {
        return _pt(q, df, lowerTail, logP);
    }

    return pnt(q, df, ncp, lowerTail, logP);
}

export function qt(p: number, df: number, ncp?: number, lowerTail = true, logP = false): number {
    if (ncp === undefined) {
        return _qt(p, df, lowerTail, logP);
    }
    return qnt(p, df, ncp, lowerTail, logP);
}

export function rt(n: number, df: number, ncp?: number, rng = globalNorm()): Float32Array {
    if (ncp === undefined) {
        return repeatedCall(n, rtOne, df, rng);
    } else if (isNaN(ncp)) {
        return emptyFloat32Array;
    } else {
        const norm = rnorm(n, ncp, 1, rng); // bleed this first from rng
        const chisq = rchisq(n, df, undefined, rng);
        for (let i = 0; i < n; i++) {
            chisq[i] /= df;
            chisq[i] = Math.sqrt(chisq[i]);
            norm[i] /= chisq[i];
        }
        return norm;
    }
}

