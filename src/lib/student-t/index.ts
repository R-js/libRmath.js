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
import { rchisq } from '../chi-2/rchisq';
import { rnorm } from '../normal/rnorm';
import { IRNGNormal } from '../rng/normal/normal-rng';
import { Inversion } from '../rng/normal/inversion';
//
import { dnt } from './dnt';
import { dt as _dt } from './dt';
import { pnt } from './pnt';
import { pt as _pt } from './pt';
import { qnt } from './qnt';
import { qt as _qt } from './qt';
//
import { rt as _rt } from './rt';

export function StudentT(rng: IRNGNormal = new Inversion()) {
    function dt(x: number, df: number, ncp?: number, asLog = false) {
        if (ncp === undefined) {
            return _dt(x, df, asLog);
        }
        return dnt(x, df, ncp, asLog);
    }

    function pt(q: number, df: number, ncp?: number, lowerTail = true, logP = false) {
        if (ncp === undefined) {
            return _pt(q, df, lowerTail, logP);
        }

        return pnt(q, df, ncp, lowerTail, logP);
    }

    function qt(p: number, df: number, ncp?: number, lowerTail = true, logP = false) {
        if (ncp === undefined) {
            return _qt(p, df, lowerTail, logP);
        }
        return qnt(p, df, ncp, lowerTail, logP);
    }

    function rt(n: number, df: number, ncp?: number) {
        if (ncp === undefined) {
            return _rt(n, df, rng);
        } else if (Number.isNaN(ncp)) {
            return Array.from({ length: n }).fill(NaN);
        } else {
            const norm = rnorm(n, ncp, 1, rng); // bleed this first from rng
            const chisq = rchisq(n, df, rng)
                .map((v) => v / df)
                .map(Math.sqrt);
            const result = norm.map((n, i) => n / chisq[i]);
            return result;
        }
    }

    return {
        dt,
        pt,
        qt,
        rt,
    };
}
