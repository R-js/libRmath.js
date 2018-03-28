/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';
import { ML_ERR_return_NAN, R_P_bounds_01 } from '../common/_general';

import { pnbeta2 } from '../beta/pnbeta';
import { pnchisq } from '../chi-2/pnchisq';


const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer_pnf = debug('pnf');
export function pnf<T>(
  xx: T,
  df1: number,
  df2: number,
  ncp: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  const fx: number[] = Array.isArray(xx) ? xx : ([xx] as any);
  const result = fx.map(x => {
    let y;

    if (ISNAN(x) || ISNAN(df1) || ISNAN(df2) || ISNAN(ncp))
      return x + df2 + df1 + ncp;

    if (df1 <= 0 || df2 <= 0 || ncp < 0) return ML_ERR_return_NAN(printer_pnf);
    if (!R_FINITE(ncp)) return ML_ERR_return_NAN(printer_pnf);
    if (!R_FINITE(df1) && !R_FINITE(df2))
      /* both +Inf */
      return ML_ERR_return_NAN(printer_pnf);

    let rc = R_P_bounds_01(lowerTail, logP, x, 0, ML_POSINF);
    if (rc !== undefined) {
      return rc;
    }
    if (df2 > 1e8)
      /* avoid problems with +Inf and loss of accuracy */
      return pnchisq(x * df1, df1, ncp, lowerTail, logP);

    y = df1 / df2 * x;
    return pnbeta2(
      y / (1 + y),
      1 / (1 + y),
      df1 / 2,
      df2 / 2,
      ncp,
      lowerTail,
      logP
    );
  });
  return result.length === 1 ? result[0] : (result as any);
}
