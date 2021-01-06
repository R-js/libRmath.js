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
import { IRNG } from '../..';
import { MersenneTwister } from '../../mersenne-twister';
import { IRNGNormal } from '../normal-rng';

const { log, sqrt, min: fmin2, max: fmax2, abs: fabs, exp } = Math;

export class BuggyKindermanRamage extends IRNGNormal {
    constructor(rng: IRNG = new MersenneTwister(0)) {
        super(rng);
    }

    public internal_norm_rand() {
        /* see Reference above */
        /* note: this has problems, but is retained for
         * reproducibility of older codes, with the same
         * numeric code */

        const A = 2.216035867166471;
        const C1 = 0.398942280401433;
        const C2 = 0.180025191068563;

        const g = (x: number) => C1 * exp((-x * x) / 2.0) - C2 * (A - x);

        const u1 = this.rng.internal_unif_rand();
        let u2: number;
        let u3: number;
        let tt: number;
        if (u1 < 0.884070402298758) {
            const u2 = this.rng.internal_unif_rand();
            return A * (1.1311316354418 * u1 + u2 - 1);
        }

        if (u1 >= 0.973310954173898) {
            /* tail: */
            for (;;) {
                u2 = this.rng.internal_unif_rand();
                u3 = this.rng.internal_unif_rand();
                tt = A * A - 2 * log(u3);
                if (u2 * u2 < (A * A) / tt) return u1 < 0.986655477086949 ? sqrt(tt) : -sqrt(tt);
            }
        }

        if (u1 >= 0.958720824790463) {
            /* region3: */
            for (;;) {
                u2 = this.rng.internal_unif_rand();
                u3 = this.rng.internal_unif_rand();
                tt = A - 0.63083480192196 * fmin2(u2, u3);
                if (fmax2(u2, u3) <= 0.755591531667601) return u2 < u3 ? tt : -tt;
                if (0.034240503750111 * fabs(u2 - u3) <= g(tt)) return u2 < u3 ? tt : -tt;
            }
        }

        if (u1 >= 0.911312780288703) {
            /* region2: */
            for (;;) {
                u2 = this.rng.internal_unif_rand();
                u3 = this.rng.internal_unif_rand();
                tt = 0.479727404222441 + 1.10547366102207 * fmin2(u2, u3);
                if (fmax2(u2, u3) <= 0.87283497667179) return u2 < u3 ? tt : -tt;
                if (0.049264496373128 * fabs(u2 - u3) <= g(tt)) return u2 < u3 ? tt : -tt;
            }
        }

        /* ELSE	 region1: */
        for (;;) {
            u2 = this.rng.internal_unif_rand();
            u3 = this.rng.internal_unif_rand();
            tt = 0.479727404222441 - 0.59550713801594 * fmin2(u2, u3);
            if (fmax2(u2, u3) <= 0.805577924423817) return u2 < u3 ? tt : -tt;
        }
    }
}
