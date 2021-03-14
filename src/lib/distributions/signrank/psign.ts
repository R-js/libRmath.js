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
import { debug } from 'debug';
import { ML_ERR_return_NAN,  } from '@common/logger';
import { R_DT_0, R_DT_1, R_DT_val} from '$constants';
import { csignrank } from './csignrank';

const { round, trunc, LN2: M_LN2, exp } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;

const printer_psignrank = debug('psignrank');

export function psignrank(x: number, n: number, lowerTail = true, logP = false): number {
    const roundN = round(n);
    const u = (roundN * (roundN + 1)) / 2;
    const c = trunc(u / 2);
    const w = new Float32Array(c + 1);

    x = round(x + 1e-7);
    let lowerT = lowerTail; // temp copy on each iteration
    if (ISNAN(x) || ISNAN(n)) return NaN;
    if (!R_FINITE(n)) return ML_ERR_return_NAN(printer_psignrank);
    if (n <= 0) return ML_ERR_return_NAN(printer_psignrank);

    if (x < 0.0) {
        return R_DT_0(lowerTail, logP);
    }

    if (x >= u) {
        return R_DT_1(lowerTail, logP); //returns 1 on the edge case or 0 (because log(1)= 0)
    }
    const f = exp(-roundN * M_LN2);
    let p = 0;
    if (x <= u / 2) {
        //smaller then mean
        for (let i = 0; i <= x; i++) {
            p += csignrank(i, roundN, u, c, w) * f;
        }
    } else {
        x = (n * (n + 1)) / 2 - x;
        for (let i = 0; i < x; i++) {
            p += csignrank(i, roundN, u, c, w) * f;
        }
        lowerT = !lowerT; /* p = 1 - p; */
    }
    return R_DT_val(lowerT, logP, p);
} /* psignrank() */
