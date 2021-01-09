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

import { fmod } from '../common/_general';

import { ME, ML_ERROR } from '@common/logger';

const { PI: M_PI } = Math;

const { NaN: ML_NAN, isNaN: ISNAN, isFinite: R_FINITE } = Number;

// sin(pi * x)  -- exact when x = k/2  for all integer k
const printer_sinpi = debug('sinpi');
export function sinpi(x: number): number {
    if (ISNAN(x)) return x;
    if (!R_FINITE(x)) {
        ML_ERROR(ME.ME_DOMAIN, 'sinpi not finite', printer_sinpi);
        return ML_NAN;
    }
    x = fmod(x, 2); // sin(pi(x + 2k)) == sin(pi x)  for all integer k
    // map (-2,2) --> (-1,1] :
    if (x <= -1) x += 2;
    else if (x > 1) x -= 2;
    if (x === 0 || x === 1) return 0;
    if (x === 0.5) return 1;
    if (x === -0.5) return -1;
    // otherwise
    return Math.sin(M_PI * x);
}

export default sinpi;
