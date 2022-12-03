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
import { debug } from '@mangos/debug';

import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { exp_rand } from '@dist/exp/sexp';
import { rpoisOne } from '@dist/poisson/rpois';
import type { IRNGNormal } from '@rng/normal/normal-rng';

const printer = debug('rgeom');

export function rgeomOne(p: number, rng: IRNGNormal): number {
    if (!isFinite(p) || p <= 0 || p > 1) return ML_ERR_return_NAN2(printer, lineInfo4);
    return rpoisOne(exp_rand(rng.uniform_rng) * ((1 - p) / p), rng);
}
