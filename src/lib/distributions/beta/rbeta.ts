/* This is a conversion from LIB-R-MATH to Typescript/Javascript
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

import { debug } from 'debug';
import { ML_ERR_return_NAN } from '@common/logger';
import { DBL_MAX_EXP } from '$constants';
import { IRNG } from '@rng/irng';
import { globalUni } from '@rng/globalRNG';

const printer = debug('rbeta');

export const expmax = DBL_MAX_EXP * Math.LN2; /* = log(DBL_MAX) */

export function rbetaOne(aa: number, bb: number, rng: IRNG = globalUni()): number {
    if (aa < 0 || bb < 0) {
        return ML_ERR_return_NAN(printer);
    }
    if (!isFinite(aa) && !isFinite(bb))
        // a = b = Inf : all mass at 1/2
        return 0.5;
    if (aa === 0 && bb === 0)
        // point mass 1/2 at each of {0,1} :
        return rng.random() < 0.5 ? 0 : 1;
    // now, at least one of a, b is finite and positive
    if (!isFinite(aa) || bb === 0) return 1.0;
    if (!isFinite(bb) || aa === 0) return 0.0;

    let a;
    let b;
    let alpha;
    let r;
    let s;
    let t;
    let u1 = 0;
    let u2;
    let v = 0;
    let w = 0;
    let y;
    let z;
    let qsame;
    /* FIXME:  Keep Globals (properly) for threading */
    /* Uses these GLOBALS to save time when many rv's are generated : */
    let beta = 0;
    let gamma = 0;
    let delta;
    let k1 = 0;
    let k2 = 0;
    let olda = -1.0;
    let oldb = -1.0;

    /* Test if we need new "initializing" */
    qsame = olda === aa && oldb === bb;
    if (!qsame) {
        olda = aa;
        oldb = bb;
    }

    a = Math.min(aa, bb);
    b = Math.max(aa, bb); /* a <= b */
    alpha = a + b;

    function v_w_from__u1_bet(AA: number) {
        v = beta * Math.log(u1 / (1.0 - u1));
        if (v <= expmax) {
            w = AA * Math.exp(v);
            if (!isFinite(w)) {
                w = Number.MAX_VALUE;
            }
        } else {
            w = Number.MAX_VALUE;
        }
    }

    if (a <= 1.0) {
        /* --- Algorithm BC --- */

        /* changed notation, now also a <= b (was reversed) */

        if (!qsame) {
            /* initialize */
            beta = 1.0 / a;
            delta = 1.0 + b - a;
            k1 = (delta * (0.0138889 + 0.0416667 * a)) / (b * beta - 0.777778);
            k2 = 0.25 + (0.5 + 0.25 / delta) * a;
        }
        /* FIXME: "do { } while()", but not trivially because of "continue"s:*/
        for (;;) {
            u1 = rng.random();
            u2 = rng.random();
            if (u1 < 0.5) {
                y = u1 * u2;
                z = u1 * y;
                if (0.25 * u2 + z - y >= k1) continue;
            } else {
                z = u1 * u1 * u2;
                if (z <= 0.25) {
                    v_w_from__u1_bet(b);
                    break;
                }
                if (z >= k2) continue;
            }

            v_w_from__u1_bet(b);

            if (alpha * (Math.log(alpha / (a + w)) + v) - 1.3862944 >= Math.log(z)) break;
        }
        return aa === a ? a / (a + w) : w / (a + w);
    } else {
        /* Algorithm BB */

        if (!qsame) {
            /* initialize */
            beta = Math.sqrt((alpha - 2.0) / (2.0 * a * b - alpha));
            gamma = a + 1.0 / beta;
        }
        do {
            u1 = rng.random();
            u2 = rng.random();

            v_w_from__u1_bet(a);

            z = u1 * u1 * u2;
            r = gamma * v - 1.3862944;
            s = a + r - w;
            if (s + 2.609438 >= 5.0 * z) break;
            t = Math.log(z);
            if (s > t) break;
        } while (r + alpha * Math.log(alpha / (b + w)) < t);

        return aa !== a ? b / (b + w) : w / (b + w);
    }
}
