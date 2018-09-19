/* This is a conversion from BLAS to Typescript/Javascript
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
import { Inversion, IRNGNormal } from '../rng/normal';

import { dgeom } from './dgeom';
import { pgeom } from './pgeom';
import { qgeom } from './qgeom';
import { rgeom as _rgeom } from './rgeom';

export function Geometric(rng: IRNGNormal = new Inversion()) {
  return {
    dgeom,
    pgeom,
    qgeom,
    rgeom: (N: number, prob: number) => _rgeom(N, prob, rng)
  };
}
