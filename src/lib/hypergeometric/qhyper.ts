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
import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../common/_general';
import { R_DT_qIv } from '../exp/expm1';
import { lfastchoose } from './lfastchoose';

const { log, exp, min: fmin2, max: fmax2, round: R_forceint } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE, EPSILON: DBL_EPSILON } = Number;

const printer_qhyper = debug('qhyper');

export function qhyper(
  p: number,
  nr: number,
  nb: number,
  n: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number {

    /* This is basically the same code as  ./phyper.c  *used* to be --> FIXME! */
    let N;
    let xstart;
    let xend;
    let xr;
    let xb;
    let sum;
    let term;
    let small_N;

    if (ISNAN(p) || ISNAN(nr) || ISNAN(nb) || ISNAN(n)) return NaN;

    if (/*!R_FINITE(p) ||*/ !R_FINITE(nr) || !R_FINITE(nb) || !R_FINITE(n))
      return ML_ERR_return_NAN(printer_qhyper);

    let NR = R_forceint(nr);
    let NB = R_forceint(nb);
    N = NR + NB;
    n = R_forceint(n);
    if (NR < 0 || NB < 0 || n < 0 || n > N)
      return ML_ERR_return_NAN(printer_qhyper);

    /* Goal:  Find  xr (= #{red balls in sample}) such that
     *   phyper(xr,  NR,NB, n) >= p > phyper(xr - 1,  NR,NB, n)
     */

    xstart = fmax2(0, n - NB);
    xend = fmin2(n, NR);

    let rc = R_Q_P01_boundaries(lowerTail, logP, p, xstart, xend);
    if (rc !== undefined) {
      return rc;
    }
    xr = xstart;
    xb = n - xr; /* always ( = #{black balls in sample} ) */

    small_N = N < 1000; /* won't have underflow in product below */
    /* if N is small,  term := product.ratio( bin.coef );
       otherwise work with its logarithm to protect against underflow */
    term = lfastchoose(NR, xr) + lfastchoose(NB, xb) - lfastchoose(N, n);
    if (small_N) term = exp(term);
    NR -= xr;
    NB -= xb;

    if (!lowerTail || logP) {
      p = R_DT_qIv(lowerTail, logP, p);
    }
    p *= 1 - 1000 * DBL_EPSILON; /* was 64, but failed on FreeBSD sometimes */
    sum = small_N ? term : exp(term);

    while (sum < p && xr < xend) {
      xr++;
      NB++;
      if (small_N) term *= NR / xr * (xb / NB);
      else term += log(NR / xr * (xb / NB));
      sum += small_N ? term : exp(term);
      xb--;
      NR--;
    }
    return xr
}
