/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../common/_general';

import { qbeta } from '../beta/qbeta';
import { qchisq } from '../chi-2/qchisq';

const printer = debug('qf');

const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  NaN: ML_NAN,
  POSITIVE_INFINITY: ML_POSINF,
  isFinite: ML_VALID
} = Number;

export function qf<T>(
  pp: T,
  df1: number,
  df2: number,
  lower_tail: boolean,
  log_p: boolean
): T {
  const fp: number[] = Array.isArray(pp) ? pp : ([pp] as any);
  const result = fp.map(p => {
    if (ISNAN(p) || ISNAN(df1) || ISNAN(df2)) return p + df1 + df2;

    if (df1 <= 0 || df2 <= 0) return ML_ERR_return_NAN(printer);

    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);
    if (rc !== undefined) {
      return rc;
    }

    /* fudge the extreme DF cases -- qbeta doesn't do this well.
       But we still need to fudge the infinite ones.
     */

    if (df1 <= df2 && df2 > 4e5) {
      if (!R_FINITE(df1))
        /* df1 == df2 == Inf : */
        return 1;
      /* else */
      return qchisq(p, df1, lower_tail, log_p) / df1;
    }
    if (df1 > 4e5) {
      /* and so  df2 < df1 */
      return df2 / qchisq(p, df2, !lower_tail, log_p);
    }

    // FIXME: (1/qb - 1) = (1 - qb)/qb; if we know qb ~= 1, should use other tail
    p = (1 / qbeta(p, df2 / 2, df1 / 2, !lower_tail, log_p) - 1) * (df2 / df1);
    return ML_VALID(p) ? p : ML_NAN;
  });
  return result.length === 1 ? result[0] : (result as any);
}
