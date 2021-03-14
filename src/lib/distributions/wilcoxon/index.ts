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
export { dwilcox } from './dwilcox';
export { pwilcox } from './pwilcox';
export { qwilcox } from './qwilcox';
import { rwilcoxOne } from './rwilcox';
import { repeatedCall } from '$helper';

import type { IRNG } from '@rng/irng';
import { globalUni } from '@rng/globalRNG';

export { rwilcoxOne };
export function rwilcox(N: number, m: number, n: number, rng:IRNG = globalUni()) {
    return repeatedCall(N, rwilcoxOne, m, n, rng);
}
