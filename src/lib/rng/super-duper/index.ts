'use strict';

import { fixup, i2_32m1 } from '@rng/fixup';
import { IRNG } from '@rng/irng';
import type { IRNGType } from '@rng/rng-types';
import seed from '@lib/rng/seed';
import { seedCheck } from '@rng/seedcheck';
import { INT_MAX } from '@lib/r-func';

const SEED_LEN = 2;

export class SuperDuper extends IRNG {
    public static override kind: IRNGType = 'SUPER_DUPER';

    private m_seed: Int32Array;

    constructor(_seed: number = seed()) {
        super('Super-Duper');
        this.m_seed = new Int32Array(SEED_LEN);
        this.init(_seed);
    }

    override random(): number {
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

    public override init(_seed: number = seed()): void {
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
        seedCheck(this.name, _seed, SEED_LEN);
        this.m_seed.set(_seed);
        this.fixupSeeds();
    }

    public get seed(): Int32Array | Uint32Array {
        return this.m_seed.slice();
    }

    public get cut(): number {
        return INT_MAX;
    }
}
