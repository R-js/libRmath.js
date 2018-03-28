/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';
import {
  ML_ERR_return_NAN,
  R_D__0,
  R_D_exp
} from '../common/_general';
import { dpois_raw } from '../poisson/dpois';
import { multiplexer } from '../r-func';
import { boolVector, numVector } from '../types';
import { dbeta } from './dbeta';


const { log:ln, sqrt, ceil } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('dnbeta');

//also used by f-distriution
export function dnbeta(
  _x: numVector,
  _shape1: numVector,
  _shape2: numVector,
  _ncp: numVector,
  _asLog: boolVector): numVector {

  return multiplexer(_x, _shape1, _shape2, _ncp, _asLog)(
    function(x: number, shape1, shape2, ncp, asLog){
      return _dnbeta(x, shape1, shape2, ncp, asLog);
    }) ;
}

function _dnbeta(
  x: number,
  a: number,
  b: number,
  ncp: number,
  give_log: boolean
): number {
  const eps = 1e-15;
  //int
  let kMax;
  //double
  let k;
  let ncp2;
  let dx2;
  let d;
  let D;
  let term;
  //long double
  let sum;
  let p_k;
  let q;

  if (ISNAN(x) || ISNAN(a) || ISNAN(b) || ISNAN(ncp)) return x + a + b + ncp;
  if (ncp < 0 || a <= 0 || b <= 0) {
    return ML_ERR_return_NAN(printer);
  }

  if (!R_FINITE(a) || !R_FINITE(b) || !R_FINITE(ncp)) {
    return ML_ERR_return_NAN(printer);
  }

  if (x < 0 || x > 1) {
    return R_D__0(give_log);
  }
  if (ncp === 0) {
    return dbeta(x, a, b, give_log) as number;
  }
  /* New algorithm, starting with *largest* term : */
  ncp2 = 0.5 * ncp;
  dx2 = ncp2 * x;
  d = (dx2 - a - 1) / 2;
  D = d * d + dx2 * (a + b) - a;
  if (D <= 0) {
    kMax = 0;
  } else {
    D = ceil(d + sqrt(D));
    kMax = D > 0 ? D : 0;
  }

  /* The starting "middle term" --- first look at it's log scale: */
  term = dbeta(x, a + kMax, b, /* log = */ true);
  p_k = dpois_raw(kMax, ncp2, true);
  if (x === 0 || !R_FINITE(term) || !R_FINITE(p_k)) {
    /* if term = +Inf */
    return R_D_exp(give_log, p_k + term);
  }

  /* Now if s_k := p_k * t_k  {here = exp(p_k + term)} would underflow,
     * we should rather scale everything and re-scale at the end:*/

  p_k += term; /* = log(p_k) + log(t_k) == log(s_k) -- used at end to rescale */
  /* mid = 1 = the rescaled value, instead of  mid = exp(p_k); */

  /* Now sum from the inside out */
  sum = term = 1 /* = mid term */;
  /* middle to the left */
  k = kMax;
  while (k > 0 && term > sum * eps) {
    k--;
    q = /* 1 / r_k = */ (k + 1) * (k + a) / (k + a + b) / dx2;
    term *= q;
    sum += term;
  }
  /* middle to the right */
  term = 1;
  k = kMax;
  do {
    q = /* r_{old k} = */ dx2 * (k + a + b) / (k + a) / (k + 1);
    k++;
    term *= q;
    sum += term;
  } while (term > sum * eps);

  return R_D_exp(give_log, p_k + ln(sum));
}
