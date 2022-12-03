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

import { INT_MAX } from '@lib/r-func';
import { fixup, i2_32m1 } from '../fixup';
import { IRNG } from '../irng';
import { IRNGTypeEnum } from '../irng-type';
import seed from '../seed';
import { seedCheck } from '../seedcheck';

const SEED_LEN = 2;

export class MarsagliaMultiCarry extends IRNG {

    public static kind = IRNGTypeEnum.MARSAGLIA_MULTICARRY;
    private m_seed: Int32Array;

    private fixupSeeds(): void {
        const s = this.m_seed;
        if (s[0] === 0) s[0] = 1;
        if (s[1] === 0) s[1] = 1;
        return;
    }

    public constructor(_seed: number = seed()) {
        super('Marsaglia-MultiCarry');
        this.m_seed = new Int32Array(SEED_LEN);
        this.init(_seed);
    }

    public init(_seed: number = seed()):void {
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
        super.init(_seed);
    }

    random(): number {
        const s = this.m_seed;
        s[0] = 36969 * (s[0] & 65535) + (s[0] >>> 16);
        s[1] = 18000 * (s[1] & 65535) + (s[1] >>> 16);

        const un = new Uint32Array(SEED_LEN);
        un[0] = s[0] << 16;
        un[1] = s[1] & 0xffff;
        un[0] = un[0] ^ un[1];

        //const i2_32m1 = 2.328306437080797e-10; /* = 1/(2^32 - 1) */

        return fixup(un[0] * i2_32m1); /* in [0,1) */
    }

    public set seed(_seed: Int32Array) {
        seedCheck(this.name, _seed, SEED_LEN);
        this.m_seed.set(_seed);
        this.fixupSeeds();
    }

    public get seed(): Int32Array {
        return this.m_seed.slice();
    }

    public get cut(): number {
        return INT_MAX;
    }
}
