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

const { trunc } = Math;
const frac = (x: number) => x - trunc(x);

import { fixup } from '../fixup';
import { IRNG } from '../irng';
import { IRNGTypeEnum } from '../irng-type';
import { seed } from '../timeseed';
import { seedCheck } from '../seedcheck';

export const SEED_LEN = 3;

export class WichmannHill extends IRNG {
    private m_seed: Uint32Array;

    protected internal_unif_rand(): number {
        const s = this.m_seed;
        s[0] = (s[0] * 171) % 30269;
        s[1] = (s[1] * 172) % 30307;
        s[2] = (s[2] * 170) % 30323;

        const value = s[0] / 30269.0 + s[1] / 30307.0 + s[2] / 30323.0;

        return fixup(frac(value)); /* in [0,1) */
    }

    constructor(_seed: number = seed()) {
        super('Wichmann-Hill', IRNGTypeEnum.WICHMANN_HILL);
        this.m_seed = new Uint32Array(SEED_LEN);
        this.init(_seed);
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

    public init(_seed: number = seed()) {
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

    public set seed(_seed: Uint32Array) {
        seedCheck(this._kind, _seed, SEED_LEN);
        this.m_seed.set(_seed);
        this.fixupSeeds();
    }

    public get seed() {
        return this.m_seed.slice();
    }
}
