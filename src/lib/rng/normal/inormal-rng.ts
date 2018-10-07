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
import { map, seq } from '../../r-func';

export abstract class IRNGNormal {
  protected rng: IRNG;
  constructor(_rng: IRNG) {
    this.rng = _rng;
    this.unif_rand = this.unif_rand.bind(this);
    this.norm_rand = this.norm_rand.bind(this);
    this.internal_norm_rand = this.internal_norm_rand.bind(this);
  }

  public norm_rand(n: number = 1): number|number[]{
    n = !n || n < 0 ? 1 : n;
    return map(seq()()(n))(() => this.internal_norm_rand());
  } 

  protected abstract internal_norm_rand(): number;

  public unif_rand(n: number = 1): number|number[] {
     return this.rng.unif_rand(n);
  }
}
