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

import { fmod, ME, ML_ERROR } from '../common/_general';
const { NaN: ML_NAN, isNaN: ISNAN, isFinite: R_FINITE } = Number;

const { PI: M_PI } = Math;

// tan(pi * x)  -- exact when x = k/2  for all integer k
const printer_tanpi = debug('tanpi');
export function tanpi(x: number): number {
    if (ISNAN(x)) return x;
    if (!R_FINITE(x)) {
        ML_ERROR(ME.ME_DOMAIN, '', printer_tanpi);
        return ML_NAN;
    }
    x = fmod(x, 1); // tan(pi(x + k)) == tan(pi x)  for all integer k
    // map (-1,1) --> (-1/2, 1/2] :
    if (x <= -0.5) {
        x++;
    } else if (x > 0.5) {
        x--;
    }
    return x === 0 ? 0 : x === 0.5 ? ML_NAN : Math.tan(M_PI * x);
}

export function atanpi(x: number) {
    return Math.atan(x) / Math.PI;
}
