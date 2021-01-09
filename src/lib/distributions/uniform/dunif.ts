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

import { R_D__0 } from '../../common/_general';

const { isNaN: ISNAN } = Number;
const { log } = Math;

export function dunif(x: number, min = 0, max = 1, logP = false): number {
    if (ISNAN(x) || ISNAN(min) || ISNAN(max)) {
        return x + min + max;
    }
    if (min <= x && x <= max) {
        return logP ? -log(max - min) : 1 / (max - min);
    }
    return R_D__0(logP); // return logP ? ML_NEGINF : 0.0;
}
