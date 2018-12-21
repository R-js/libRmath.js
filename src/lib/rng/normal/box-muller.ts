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
import { IRNG } from '../';
import { MersenneTwister } from '../mersenne-twister';
import { IRNGNormal } from './inormal-rng';

const { log, sqrt, cos, sin } = Math;

const DBL_MIN = 2.22507e-308;
const M_PI = 3.14159265358979323846264338327950288;

export class BoxMuller extends IRNGNormal {
  private BM_norm_keep: number;

  private reset() {
    this.BM_norm_keep = 0;
  }

  constructor(_rng: IRNG = new MersenneTwister(0) ) {
    super(_rng);
    this.BM_norm_keep = 0;
    _rng.register('INIT', this.reset.bind(this));
  }

  protected internal_norm_rand() {
    let s = 0.0;
    let theta = 0;

    if (this.BM_norm_keep !== 0.0) {
      /* An exact test is intentional */
      s = this.BM_norm_keep;
      this.BM_norm_keep = 0.0;
      return s;
    } else {
      theta = 2 * M_PI * (this.rng.internal_unif_rand());
      let R =
        sqrt(-2 * log(this.rng.internal_unif_rand())) +
        10 * DBL_MIN; /* ensure non-zero */
      this.BM_norm_keep = R * sin(theta);
      return R * cos(theta);
    }
  }
}
