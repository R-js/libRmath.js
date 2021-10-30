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
import { MersenneTwister } from '@rng/mersenne-twister';
import { IRNGNormal } from '@rng/normal/normal-rng';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';

const { exp, log, sqrt, max: fmax2, min: fmin2, abs: fabs } = Math;

const A = 2.216035867166471;
const C1 = 0.398942280401433;
const C2 = 0.180025191068563;
/*----------- Constants and definitions for  Kinderman - Ramage --- */
/*
 *  REFERENCE
 *
 *    Kinderman A. J. and Ramage J. G. (1976).
 *    Computer generation of normal random variables.
 *    JASA 71, 893-896.
 */
export class KindermanRamage extends IRNGNormal {
    public static kind = IRNGNormalTypeEnum.KINDERMAN_RAMAGE;

    constructor(_rng: IRNG = new MersenneTwister(0)) {
        super(_rng, 'KinderMan Ramage');
        this._rng.unregister(MessageType.INIT, this.reset);
    }

    public random(): number {
        let u2: number;
        let u3: number;
        let tt: number;
        const g = (x: number) => C1 * exp((-x * x) / 2.0) - C2 * (A - x);
        // corrected version from Josef Leydold

        const u1 = this._rng.random();

        if (u1 < 0.884070402298758) {
            u2 = this._rng.random();
            return A * (1.13113163544418 * u1 + u2 - 1);
        }

        if (u1 >= 0.973310954173898) {
            /* tail: */
            for (;;) {
                u2 = this._rng.random();
                u3 = this._rng.random();
                tt = A * A - 2 * log(u3);
                if (u2 * u2 < (A * A) / tt) return u1 < 0.986655477086949 ? sqrt(tt) : -sqrt(tt);
            }
        }

        if (u1 >= 0.958720824790463) {
            /* region3: */
            for (;;) {
                u2 = this._rng.random();
                u3 = this._rng.random();
                tt = A - 0.63083480192196 * fmin2(u2, u3);
                if (fmax2(u2, u3) <= 0.755591531667601) return u2 < u3 ? tt : -tt;
                if (0.034240503750111 * fabs(u2 - u3) <= g(tt)) return u2 < u3 ? tt : -tt;
            }
        }

        if (u1 >= 0.911312780288703) {
            /* region2: */
            for (;;) {
                u2 = this._rng.random();
                u3 = this._rng.random();
                tt = 0.479727404222441 + 1.10547366102207 * fmin2(u2, u3);
                if (fmax2(u2, u3) <= 0.87283497667179) return u2 < u3 ? tt : -tt;
                if (0.049264496373128 * fabs(u2 - u3) <= g(tt)) return u2 < u3 ? tt : -tt;
            }
        }

        /* ELSE	 region1: */
        for (;;) {
            u2 = this._rng.random();
            u3 = this._rng.random();
            tt = 0.479727404222441 - 0.59550713801594 * fmin2(u2, u3);
            if (tt < 0) continue;
            if (fmax2(u2, u3) <= 0.805577924423817) return u2 < u3 ? tt : -tt;
            if (0.053377549506886 * fabs(u2 - u3) <= g(tt)) return u2 < u3 ? tt : -tt;
        }
    }
}
