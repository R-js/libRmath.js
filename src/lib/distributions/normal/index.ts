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
'use strict';
import { dnorm4 as dnorm } from './dnorm';
import { pnorm5 as pnorm } from './pnorm';
import { qnorm } from './qnorm';
import { rnorm as _rnorm } from './rnorm';

import { IRNGNormal, rng as _rng } from '../rng';
const { normal: { Inversion } } = _rng;


export function Normal(prng: IRNGNormal = new Inversion()) {

  return {
    rnorm: (n = 1, mu = 0, sigma = 1) => _rnorm(n, mu, sigma, prng),
    dnorm,
    pnorm,
    qnorm,
    rng: prng,
  };
}
