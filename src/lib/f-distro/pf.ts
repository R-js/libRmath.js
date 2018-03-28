/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';

import { ML_ERR_return_NAN, R_DT_0, R_DT_1, R_P_bounds_01 } from '../common/_general';

//import { INormal } from '../exp/expm1'normal';
import { pbeta } from '../beta/pbeta';
import { pchisq } from '../chi-2/pchisq';

const {
  isNaN: ISNAN,
  POSITIVE_INFINITY: ML_POSINF,
  NaN: ML_NAN,
  isFinite: ML_VALID
} = Number;

const { LN2: M_LN2 } = Math;

const printer_pf = debug('pf');

export function pf<T>(
  q: T,
  df1: number,
  df2: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  const fx: number[] = Array.isArray(q) ? q : [q] as any;

  const result = fx.map(x => {
    if (ISNAN(x) || ISNAN(df1) || ISNAN(df2)) return x + df2 + df1;

    if (df1 <= 0 || df2 <= 0) {
      return ML_ERR_return_NAN(printer_pf);
    }

    let rc = R_P_bounds_01(lowerTail, logP, x, 0, ML_POSINF);
    if (rc !== undefined) {
      return rc;
    }

    /* move to pchisq for very large values - was 'df1 > 4e5' in 2.0.x,
       now only needed for df1 = Inf or df2 = Inf {since pbeta(0,*)=0} : */
    if (df2 === ML_POSINF) {
      if (df1 === ML_POSINF) {
        if (x < 1) return R_DT_0(lowerTail, logP);
        if (x === 1) return logP ? -M_LN2 : 0.5;
        if (x > 1) return R_DT_1(lowerTail, logP);
      }

      return pchisq(x * df1, df1, lowerTail, logP);
    }

    if (df1 === ML_POSINF)
      /* was "fudge"	'df1 > 4e5' in 2.0.x */
      return pchisq(df2 / x, df2, !lowerTail, logP);

    /* Avoid squeezing pbeta's first parameter against 1 :  */
    if (df1 * x > df2)
      x = pbeta(df2 / (df2 + df1 * x), df2 / 2, df1 / 2, !lowerTail, logP);
    else
      x = pbeta(df1 * x / (df2 + df1 * x), df1 / 2, df2 / 2, lowerTail, logP);

    return ML_VALID(x) ? x : ML_NAN;
  });
  return result.length === 1 ? result[0] : (result as any);
}
