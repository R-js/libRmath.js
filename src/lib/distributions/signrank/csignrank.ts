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
import { imin2 } from '$constants';

export function csignrank(k: number, n: number, u: number, c: number, w: Float32Array): number {
    if (k < 0 || k > u) return 0;
    if (k > c) k = u - k;

    if (n === 1) return 1;
    if (w[0] === 1) return w[k];
    w[0] = w[1] = 1;
    for (let j = 2; j < n + 1; ++j) {
        let i;
        const end = imin2((j * (j + 1)) / 2, c);
        for (i = end; i >= j; --i) w[i] += w[i - j];
    }
    return w[k];
}
