'use strict';

/*
 *  Javascript conversion by Jacob Bogers Nov 2017
 *  jkfbogers@gmail.com
 * 
 *  R : A Computer Language for Statistical Data Analysis
 *  Copyright (C) 1995, 1996  Robert Gentleman and Ross Ihaka
 *  Copyright (C) 1997--2016  The R Core Team
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, a copy is available at
 *  https://www.R-project.org/Licenses/
 */

const { trunc } = Math;
const frac = (x: number) => x - trunc(x);

import { warning, error } from '../../_logging';
import { IRNGType } from '../irng-type';
import { timeseed } from '../timeseed';
import { IRNG } from '../irng';
import { fixup } from '../fixup';

const SEED_LEN = 2;
const buf = new ArrayBuffer(SEED_LEN * 4);

export class MarsagliaMultiCarry extends IRNG {
  private kind: IRNGType;
  private name: string;
  private m_seed: Int32Array;

  private fixupSeeds(): void {
    const s = this.m_seed;
    if (s[0] === 0) s[0] = 1;
    if (s[1] === 0) s[1] = 1;
    return;
  }

  public constructor(_seed: number = timeseed()) {
    super(_seed);
  }

  public init(_seed: number) {
    /* Initial scrambling */
    const s = new Int32Array([_seed]);
    for (let j = 0; j < 50; j++) {
      s[0] = 69069 * s[0] + 1;
    }
    for (let j = 0; j < this.m_seed.length; j++) {
      s[0] = 69069 * s[0] + 1;
      this.m_seed[j] = s[0];
    }
    this.fixupSeeds();
  }

  public _setup() {
    this.kind = IRNGType.MARSAGLIA_MULTICARRY;
    this.name = 'Marsaglia-MultiCarry';
    this.m_seed = new Int32Array(buf).fill(0);
  }

  public unif_rand(): number {
    const s = this.m_seed;
    s[0] = 36969 * (s[0] & 65535) + (s[0] >>> 16);
    s[1] = 18000 * (s[1] & 65535) + (s[1] >>> 16);

    const un = new Uint32Array(SEED_LEN);
    un[0] = s[0] << 16;
    un[1] = s[1] & 0xffff;
    un[0] = un[0] ^ un[1];

    //const i2_32m1 = 2.328306437080797e-10; /* = 1/(2^32 - 1) */

    return fixup(un[0] * fixup.prototype.i2_32m1); /* in [0,1) */
  }

  public set seed(_seed: number[]) {
    let errors = 0;

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
