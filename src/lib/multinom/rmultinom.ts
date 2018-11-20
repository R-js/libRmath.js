/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';

const { isFinite: R_FINITE } = Number;
const { abs: fabs } = Math;

import { rbinom } from '../binomial/rbinom';
import { flatten, possibleScalar,  sum } from '../r-func';
import { IRNG } from '../rng/irng';

const printer_rmultinom = debug('rmultinom');
//const sequence = seq()();

export function rmultinom(
  n: number,
  size: number,
  prob: number | number[],
  rng: IRNG
): (number[]) | (number[][]) {
  const result = Array.from({length:n}).map(() => _rmultinom(size, prob, rng));
  return possibleScalar(result);
}

//workhorse
function _rmultinom(
  size: number,
  prob: number | number[],
  rng: IRNG
): number[] {
  /* `Return' vector  rN[1:K] {K := length(prob)}
     *  where rN[j] ~ Bin(n, prob[j]) ,  sum_j rN[j] == n,  sum_j prob[j] == 1,
     */
  const rN: number[] = [];
  let p = flatten(prob);
  const K = p.length;
  //let pp;
  /* This calculation is sensitive to exact values, so we try to
       ensure that the calculations are as accurate as possible
       so different platforms are more likely to give the same
       result. */

  if (p.length === 0) {
    printer_rmultinom('list of probabilities cannot be empty');
    return rN;
  }
  if (size < 0) {
    printer_rmultinom('Illegal Argument:size is negative');
    rN.splice(0);
    return rN;
  }
  /* Note: prob[K] is only used here for checking  sum_k prob[k] = 1 ;
     *       Could make loop one shorter and drop that check !
     */
  //check probabilities
  if (p.find(pp => !R_FINITE(pp) || pp < 0)) {
    printer_rmultinom('some propbabilities are invalid or negative numbers');
    rN.splice(0);
    return rN;
  }

  rN.splice(0, rN.length, ...new Array(K).fill(0)); //remove, insert and init

  if (size === 0) {
    return rN;
  }
  /* Generate the first K-1 obs. via binomials */
  // context vars for the next loop
  let _size = size;
  let p_tot = sum(p);

  printer_rmultinom('%o', { p, p_tot, _size, K, rN });
  for (let k = 0; k < K - 1; k++) {
    //can happen, protect against devide by zero
    if (fabs(p_tot) < Number.EPSILON) {
      rN[k] = _size;
      _size = 0;
      p_tot = 0;
      continue;
    }

    const pp = p[k] / p_tot;

    if (pp === 0) {
      rN[k] = 0;
      continue;
    }
    // nothing left, rest will be zero
    if (_size === 0) {
      rN[k] = 0;
      continue;
    }
    /* printf("[%d] %.17f\n", k+1, pp); */
    rN[k] = pp < 1 ? (rbinom(1, _size, pp, rng) as number) : _size;
    //adjust size
    _size -= rN[k];
    //adjust probabilities
    p_tot -= p[k];
    printer_rmultinom('%o', { p_tot, _size, k, rN });
  }
  rN[K - 1] = _size; //left over
  return rN;
}
