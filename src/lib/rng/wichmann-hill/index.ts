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

const { trunc } = Math;
const frac = (x: number) => x - trunc(x);

import { fixup } from '../fixup';
import { IRNG } from '../irng';
import { IRNGType } from '../irng-type';
import { timeseed } from '../timeseed';

const SEED_LEN = 3;

export class WichmannHill extends IRNG {

  private m_seed: Uint32Array;

  constructor(_seed: number = timeseed()) {
    super(_seed);
  }


  public _setup() {
    this._kind = IRNGType.WICHMANN_HILL;
    this._name = 'Wichmann-Hill';
    const buf = new ArrayBuffer(SEED_LEN * 4);
    this.m_seed = new Uint32Array(buf).fill(0);
  }

  internal_unif_rand(): number {
    const s = this.m_seed;
    s[0] = (s[0] * 171) % 30269;
    s[1] = (s[1] * 172) % 30307;
    s[2] = (s[2] * 170) % 30323;

    let value = s[0] / 30269.0 + s[1] / 30307.0 + s[2] / 30323.0;

    return fixup(frac(value)); /* in [0,1) */
  }

  public fixupSeeds(): void {
    const s = this.m_seed;
    s[0] = s[0] % 30269;
    s[1] = s[1] % 30307;
    s[2] = s[2] % 30323;

    if (s[0] === 0) s[0] = 1;
    if (s[1] === 0) s[1] = 1;
    if (s[2] === 0) s[2] = 1;
    return;
  }

  public init(seed: number =  timeseed()) {
    /* Initial scrambling */
    const s = new Uint32Array([seed]);

    for (let j = 0; j < 50; j++) {
      s[0] = 69069 * s[0] + 1;
    }
    for (let j = 0; j < this.m_seed.length; j++) {
      s[0] = 69069 * s[0] + 1;
      this.m_seed[j] = s[0];
    }
    this.fixupSeeds();
    super.init(seed);
  }

  public set seed(_seed: number[]) {


    if (_seed.length > this.m_seed.length || _seed.length === 0) {
      this.init(timeseed());
      return;
    }
    this.m_seed.set(_seed);
  }

  public get seed() {
    return Array.from(this.m_seed);
  }
}
