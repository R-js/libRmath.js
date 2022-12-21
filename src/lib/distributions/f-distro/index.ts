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
//needed for rf
import { rchisqOne } from '../chi-2/rchisq';
import { rnchisqOne } from '../chi-2/rnchisq';
import { repeatedCall64 } from '@lib/r-func';
//
import { df as _df } from './df';
import { dnf } from './dnf';
//
import { pf as _pf } from './pf';
import { pnf } from './pnf';
//
import { qf as _qf } from './qf';
import { qnf } from './qnf';
import { rfOne as _rfOne } from './rf';

export function df(x: number, df1: number, df2: number, ncp?: number, log = false): number {
    if (ncp === undefined) {
        return _df(x, df1, df2, log);
    }
    return dnf(x, df1, df2, ncp, log);
}

export function pf(q: number, df1: number, df2: number, ncp?: number, lowerTail = true, logP = false): number {
    if (ncp === undefined) {
        return _pf(q, df1, df2, lowerTail, logP);
    }
    return pnf(q, df1, df2, ncp, lowerTail, logP);
}

export function qf(p: number, df1: number, df2: number, ncp?: number, lowerTail = true, logP = false): number {
    if (ncp === undefined) {
        return _qf(p, df1, df2, lowerTail, logP);
    }
    return qnf(p, df1, df2, ncp, lowerTail, logP);
}

export function rf(n: number, df1: number, df2: number, ncp?: number): Float64Array {

    if (ncp === undefined) {
        return repeatedCall64(n, _rfOne, df1, df2);
    }

    // short cuts
    if (isNaN(ncp) || isNaN(df1) || isNaN(df2) || !isFinite(df1) || !isFinite(df2)) {
        return repeatedCall64(n, () => NaN);
    }
    // R fidelity
    const noms = repeatedCall64(n, () => rnchisqOne(df1, ncp) / df1);
    // loop over all noms
    for (let i = 0; i < noms.length; i++) {
        const dom = rchisqOne(df2) / df2;
        noms[i] = noms[i] / dom;
    }
    return noms;
}

export function rfOne(df1: number, df2: number, ncp?: number): number {
    if (ncp === undefined) {
        return _rfOne( df1, df2);
    }
    if (isNaN(ncp) || isNaN(df1) || isNaN(df2) || !isFinite(df1) || !isFinite(df2)) {
        return NaN;
    }
    const nom = rnchisqOne(df1, ncp) / df1;
    const dom = rchisqOne(df2) / df2;
    return nom / dom;
}
