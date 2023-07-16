'use strict';

import { IRNG, MessageType } from '@rng/irng';
import { IRNGNormal } from '@rng/normal/normal-rng';
import type { IRNGNormalType } from '@lib/rng/normal/rng-types';

const { log, sqrt, min: fmin2, max: fmax2, abs: fabs, exp } = Math;

export class BuggyKindermanRamage extends IRNGNormal {
    public static override kind: IRNGNormalType = 'BUGGY_KINDERMAN_RAMAGE';

    constructor(_rng: IRNG) {
        super(_rng, 'Buggy-Kinderman-Ramage');
        // there is no reset via message init
        this._rng.unregister(MessageType.INIT, this.reset.bind(this));
    }

    public override random(): number {
        /* see Reference above */
        /* note: this has problems, but is retained for
         * reproducibility of older codes, with the same
         * numeric code */

        const A = 2.216035867166471;
        const C1 = 0.398942280401433;
        const C2 = 0.180025191068563;

        const g = (x: number) => C1 * exp((-x * x) / 2.0) - C2 * (A - x);

        const u1 = this._rng.random();
        let u2: number;
        let u3: number;
        let tt: number;
        if (u1 < 0.884070402298758) {
            const u2 = this._rng.random();
            return A * (1.1311316354418 * u1 + u2 - 1);
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
            if (fmax2(u2, u3) <= 0.805577924423817) return u2 < u3 ? tt : -tt;
        }
    }
}
