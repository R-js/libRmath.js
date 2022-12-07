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
import { IRNG, MessageType } from '@rng/irng';
import { qnorm } from '@dist/normal/qnorm';
import { MersenneTwister } from '@rng/mersenne-twister';
import { IRNGNormal } from '@rng/normal/normal-rng';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';

const BIG = 134217728; /* 2^27 */

export class Inversion extends IRNGNormal {

    public static override kind = IRNGNormalTypeEnum.INVERSION;

    constructor(_rng: IRNG = new MersenneTwister(0)) {
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
