/* This is a conversion from BLAS to Typescript/Javascript
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

import * as debug from 'debug';
import { DBL_MAX_EXP, ML_ERR_return_NAN } from '../common/_general';
import { randomGenHelper } from '../r-func'
import { IRNGNormal } from '../rng/normal';

const { LN2: M_LN2, log, min: fmin2, max: fmax2, exp, sqrt } = Math;
const { MAX_VALUE: DBL_MAX, isFinite: R_FINITE } = Number;
const printer = debug('rbeta');

export const expmax = DBL_MAX_EXP * M_LN2; /* = log(DBL_MAX) */

export function rbeta(n: number|number[], aa: number, bb: number, rng: IRNGNormal){
  return randomGenHelper(n, rbetaOne, aa, bb, rng);
}

export function rbetaOne(
  aa: number,
  bb: number,
  rng: IRNGNormal
): number  {

  if (aa < 0 || bb < 0) {
    return ML_ERR_return_NAN(printer);
  }
  if (!R_FINITE(aa) && !R_FINITE(bb))
    // a = b = Inf : all mass at 1/2
    return 0.5;
  if (aa === 0 && bb === 0)
    // point mass 1/2 at each of {0,1} :
    return rng.unif_rand() < 0.5 ? 0 : 1;
  // now, at least one of a, b is finite and positive
  if (!R_FINITE(aa) || bb === 0) return 1.0;
  if (!R_FINITE(bb) || aa === 0) return 0.0;

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

  a = fmin2(aa, bb);
  b = fmax2(aa, bb); /* a <= b */
  alpha = a + b;

  function v_w_from__u1_bet(AA: number) {
    v = beta * log(u1 / (1.0 - u1));
    if (v <= expmax) {
      w = AA * exp(v);
      if (!R_FINITE(w)) {
        w = DBL_MAX;
      }
    } else {
      w = DBL_MAX;
    }
  }

  if (a <= 1.0) {
    /* --- Algorithm BC --- */

    /* changed notation, now also a <= b (was reversed) */

    if (!qsame) {
      /* initialize */
      beta = 1.0 / a;
      delta = 1.0 + b - a;
      k1 = delta * (0.0138889 + 0.0416667 * a) / (b * beta - 0.777778);
      k2 = 0.25 + (0.5 + 0.25 / delta) * a;
    }
    /* FIXME: "do { } while()", but not trivially because of "continue"s:*/
    for (; ;) {
      u1 = rng.unif_rand() as number;
      u2 = rng.unif_rand() as number;
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

      if (alpha * (log(alpha / (a + w)) + v) - 1.3862944 >= log(z)) break;
    }
    return aa === a ? a / (a + w) : w / (a + w);
  } else {
    /* Algorithm BB */

    if (!qsame) {
      /* initialize */
      beta = sqrt((alpha - 2.0) / (2.0 * a * b - alpha));
      gamma = a + 1.0 / beta;
    }
    do {
      u1 = rng.unif_rand() as number;
      u2 = rng.unif_rand() as number;

      v_w_from__u1_bet(a);

      z = u1 * u1 * u2;
      r = gamma * v - 1.3862944;
      s = a + r - w;
      if (s + 2.609438 >= 5.0 * z) break;
      t = log(z);
      if (s > t) break;
    } while (r + alpha * log(alpha / (b + w)) < t);

    return aa !== a ? b / (b + w) : w / (b + w);
  }
}

