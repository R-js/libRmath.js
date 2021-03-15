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

export const i2_32m1 = 2.328306437080797e-10;

export function fixup(x: number): number {
    /* ensure 0 and 1 are never returned */
    if (x <= 0.0) return 0.5 * i2_32m1;
    if (1.0 - x <= 0.0) return 1.0 - 0.5 * i2_32m1;
    return x;
}
