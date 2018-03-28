/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';
import { ML_ERR_return_NAN, R_D__0 } from '../common/_general';

import { dnbeta } from '../beta/dnbeta';
import { dnchisq } from '../chi-2/dnchisq';
import { dgamma } from '../gamma/dgamma';

const { log1p, log } = Math;

const {
  isFinite: R_FINITE,
  isNaN: ISNAN,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer = debug('dnf');

export function dnf<T>(
  xx: T,
  df1: number,
  df2: number,
  ncp: number,
  giveLog: boolean
): T {
  const fx: number[] = Array.isArray(xx) ? xx : ([xx] as any);
  const result = fx.map(x => {
    let y: number;
    let z: number;
    let f: number;

    if (ISNAN(x) || ISNAN(df1) || ISNAN(df2) || ISNAN(ncp)) {
      return x + df2 + df1 + ncp;
    }

    /* want to compare dnf(ncp=0) behavior with df() one, hence *NOT* :
     * if (ncp == 0)
     *   return df(x, df1, df2, give_log); */

    if (df1 <= 0 || df2 <= 0 || ncp < 0) {
      return ML_ERR_return_NAN(printer);
    }
    if (x < 0) {
      return R_D__0(giveLog);
    }
    if (!R_FINITE(ncp)) {
      /* ncp = +Inf -- FIXME?: in some cases, limit exists */
      return ML_ERR_return_NAN(printer);
    }

    /* This is not correct for  df1 == 2, ncp > 0 - and seems unneeded:
     *  if (x == 0.) return(df1 > 2 ? R_D__0 : (df1 == 2 ? R_D__1 : ML_POSINF));
     */
    if (!R_FINITE(df1) && !R_FINITE(df2)) {
      /* both +Inf */
      /* PR: not sure about this (taken from  ncp==0)  -- FIXME ? */
      if (x === 1) return ML_POSINF;
      else return R_D__0(giveLog);
    }
    if (!R_FINITE(df2))
      /* i.e.  = +Inf */
      return df1 * dnchisq(x * df1, df1, ncp, giveLog);
    /*	 ==  dngamma(x, df1/2, 2./df1, ncp, give_log)  -- but that does not exist */
    if (df1 > 1e14 && ncp < 1e7) {
      /* includes df1 == +Inf: code below is inaccurate there */
      f =
        1 +
        ncp / df1; /* assumes  ncp << df1 [ignores 2*ncp^(1/2)/df1*x term] */
      z = dgamma(1 / x / f, df2 / 2, 2 / df2, giveLog);
      return giveLog ? z - 2 * log(x) - log(f) : z / (x * x) / f;
    }

    y = df1 / df2 * x;
    z = dnbeta(y / (1 + y), df1 / 2, df2 / 2, ncp, giveLog) as number;
    return giveLog
      ? z + log(df1) - log(df2) - 2 * log1p(y)
      : z * (df1 / df2) / (1 + y) / (1 + y);
  });
  return result.length === 1 ? result[0] : result as any;
}
