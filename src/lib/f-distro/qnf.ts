/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../common/_general';


import { qnbeta } from '../beta/qnbeta';
import { qnchisq } from '../chi-2/qnchisq';

const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer = debug('qnf');

export function qnf<T>(
  pp: T,
  df1: number,
  df2: number,
  ncp: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  const fp: number[] = Array.isArray(pp) ? pp : ([pp] as any);

  const result = fp.map(p => {
    let y;

    if (ISNAN(p) || ISNAN(df1) || ISNAN(df2) || ISNAN(ncp))
      return p + df1 + df2 + ncp;

    switch (true) {
      case df1 <= 0 || df2 <= 0 || ncp < 0:
      case !R_FINITE(ncp):
      case !R_FINITE(df1) && !R_FINITE(df2):
        return ML_ERR_return_NAN(printer);
      default:
        // pass through
        break;
    }
    //if (df1 <= 0 || df2 <= 0 || ncp < 0) ML_ERR_return_NAN(printer);
    //if (!R_FINITE(ncp)) ML_ERR_return_NAN;
    //if (!R_FINITE(df1) && !R_FINITE(df2)) ML_ERR_return_NAN;
    let rc = R_Q_P01_boundaries(lowerTail, logP, p, 0, ML_POSINF);
    if (rc !== undefined) {
      return rc;
    }

    if (df2 > 1e8)
      /* avoid problems with +Inf and loss of accuracy */
      return qnchisq(p, df1, ncp, lowerTail, logP) / df1;

    y = qnbeta(p, df1 / 2, df2 / 2, ncp, lowerTail, logP);
    return y / (1 - y) * (df2 / df1);
  });
  return result.length === 1 ? result[0] : result as any;
}
