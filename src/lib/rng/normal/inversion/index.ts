'use strict';

import { IRNG, MessageType } from '@rng/irng';
import { qnorm } from '@dist/normal/qnorm';
import { IRNGNormal } from '@rng/normal/normal-rng';
import type { IRNGNormalType } from '@lib/rng/normal/rng-types';

const BIG = 134217728; /* 2^27 */

export class Inversion extends IRNGNormal {
    public static override kind: IRNGNormalType = 'INVERSION';

    constructor(_rng: IRNG) {
        super(_rng, 'Inversion');
        // there is no reset via message init
        this._rng.unregister(MessageType.INIT, this.reset.bind(this));
    }

    public override random(): number {
        /* unif_rand() alone is not of high enough precision */
        let u1 = this._rng.random();
        const t = this._rng.random();
        u1 = new Int32Array([BIG * u1])[0] + t;
        const result = qnorm(u1 / BIG, 0.0, 1.0, !!1, !!0);
        return result;
    }
}
