/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';
import { ML_ERR_return_NAN, R_D_Lval, R_DT_0, R_DT_1 } from '../common/_general';
import { R_DT_log } from '../exp/expm1';
import { map } from '../r-func';
import { dhyper } from './dhyper';

const { floor, round: R_forceint, log1p } = Math;
const { EPSILON: DBL_EPSILON, isNaN: ISNAN, isFinite: R_FINITE } = Number;

//NOTE: p[d]hyper is not  typo!!
//const printer_pdhyper = debug('pdhyper');

function pdhyper(
  x: number,
  NR: number,
  NB: number,
  n: number,
  log_p: boolean
): number {
  /*
     * Calculate
     *
     *	    phyper (x, NR, NB, n, TRUE, FALSE)
     *   [log]  ----------------------------------
     *	       dhyper (x, NR, NB, n, FALSE)
     *
     * without actually calling phyper.  This assumes that
     *
     *     x * (NR + NB) <= n * NR
     *
     */

  let sum = 0;
  let term = 1;

  while (x > 0 && term >= DBL_EPSILON * sum) {
    term *= x * (NB - n + x) / (n + 1 - x) / (NR + 1 - x);
    sum += term;
    x--;
  }

  let ss = sum;
  return log_p ? log1p(ss) : 1 + ss;
}

/* FIXME: The old phyper() code was basically used in ./qhyper.c as well
 * -----  We need to sync this again!
*/
const printer_phyper = debug('phyper');

export function phyper<T>(
  xx: T,
  nr: number,
  nb: number,
  nn: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  /* Sample of  n balls from  NR red  and	 NB black ones;	 x are red */

  return map(xx)(x => {
    let d: number;
    let pd: number;
    let lower_tail = lowerTail; //copy it gets changed
    let log_p = logP;
    let NR = nr;
    let NB = nb;
    let n = nn;
    if (ISNAN(x) || ISNAN(NR) || ISNAN(NB) || ISNAN(n)) return x + NR + NB + n;

    x = floor(x + 1e-7);
    NR = R_forceint(NR);
    NB = R_forceint(NB);
    n = R_forceint(n);

    if (NR < 0 || NB < 0 || !R_FINITE(NR + NB) || n < 0 || n > NR + NB) {
      return ML_ERR_return_NAN(printer_phyper);
    }

    if (x * (NR + NB) > n * NR) {
      /* Swap tails.	*/
      let oldNB = NB;
      NB = NR;
      NR = oldNB;
      x = n - x - 1;
      lower_tail = !lower_tail;
    }

    if (x < 0) return R_DT_0(lower_tail, log_p);
    if (x >= NR || x >= n) return R_DT_1(lower_tail, log_p);

    d = dhyper(x, NR, NB, n, log_p);
    pd = pdhyper(x, NR, NB, n, log_p);

    return log_p
      ? R_DT_log(lower_tail, log_p, d + pd)
      : R_D_Lval(lower_tail, d * pd);
  }) as any;

}
