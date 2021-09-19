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

import { fixup, i2_32m1 } from '@rng/fixup';
import { IRNG } from '@rng/irng';
import { IRNGTypeEnum } from '@rng/irng-type';
import { seed } from '@rng/timeseed';
import { seedCheck } from '@rng/seedcheck';

export const SEED_LEN = 2;

export class SuperDuper extends IRNG {
    private m_seed: Int32Array;

    constructor(_seed: number = seed()) {
        super('Super-Duper', IRNGTypeEnum.SUPER_DUPER);
        this.m_seed = new Int32Array(SEED_LEN);
        this.init(_seed);
    }

    random(): number {
        const s = this.m_seed;
        /* This is Reeds et al (1984) implementation;
         * modified using __unsigned__	seeds instead of signed ones
         */

        s[0] ^= (s[0] >>> 15) & 0x1ffff; /* ) 0377777 = 0x1FFFF Tausworthe */
        s[0] ^= s[0] << 17;
        s[1] *= 69069; /* Congruential */
        const un = new Uint32Array(SEED_LEN);
        un[0] = s[0];
        un[1] = s[1];
        un[0] = un[0] ^ un[1];
        return fixup(un[0] * i2_32m1); /* in [0,1) */
    }

    private fixupSeeds(): void {
        const s = this.m_seed;
        if (s[0] === 0) s[0] = 1;
        /* I2 = Congruential: must be ODD */
        s[1] |= 1;
        return;
    }

    public init(_seed: number = seed()):void {
        /* Initial scrambling */
        const s = new Uint32Array([_seed]);
        for (let j = 0; j < 50; j++) {
            s[0] = 69069 * s[0] + 1;
        }
        for (let j = 0; j < this.m_seed.length; j++) {
            s[0] = 69069 * s[0] + 1;
            this.m_seed[j] = s[0];
        }
        this.fixupSeeds();
        super.init(_seed);
    }

    public set seed(_seed: Int32Array | Uint32Array) {
        seedCheck(this._kind, _seed, SEED_LEN);
        this.m_seed.set(_seed);
        this.fixupSeeds();
    }

    public get seed(): Int32Array|Uint32Array {
        return this.m_seed.slice();
    }
}
