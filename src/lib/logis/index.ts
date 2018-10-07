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
import { IRNG } from '../rng/irng';
import { MersenneTwister } from '../rng/mersenne-twister';
import { dlogis } from './dlogis';
import { plogis } from './plogis';
import { qlogis } from './qlogis';
import { rlogis as _rlogis } from './rlogis';

export function Logistic(rng: IRNG = new MersenneTwister(0)) {
  //
  function rlogis(N: number, location: number = 0, scale: number = 1) {
    return _rlogis(N, location, scale, rng);
  }

  return {
    dlogis,
    plogis,
    qlogis,
    rlogis
  };
}
