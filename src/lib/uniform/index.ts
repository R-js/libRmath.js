'use strict'
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

import { dunif } from './dunif';
import { punif } from './punif';
import { qunif } from './qunif';
import { runif } from './runif';

import { IRNG, rng } from '../rng';
const { MersenneTwister } = rng;

export function Uniform(rng: IRNG = new MersenneTwister(0)) {
  return {
    dunif,
    punif,
    qunif,
    rng, // class of the rng
    runif: (n: number = 1, min: number = 0, max: number = 1) =>
      runif(n, min, max, rng)
  };
}
