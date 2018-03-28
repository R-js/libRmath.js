/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';

import { ML_ERR_return_NAN, R_DT_0, R_DT_1 } from '../common/_general';

import { R_DT_Clog } from '../exp/expm1';

const { expm1, log1p, log, exp, floor } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('pgeom');

export function pgeom<T>(
  xx: T,
  p: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  const fx: number[] = Array.isArray(xx) ? xx : ([xx] as any);

  const result = fx.map(x => {
    if (ISNAN(x) || ISNAN(p)) return x + p;

    if (p <= 0 || p > 1) {
      return ML_ERR_return_NAN(printer);
    }

    if (x < 0) return R_DT_0(lowerTail, logP);
    if (!R_FINITE(x)) return R_DT_1(lowerTail, logP);
    x = floor(x + 1e-7);

    if (p === 1) {
      /* we cannot assume IEEE */
      x = lowerTail ? 1 : 0;
      return logP ? log(x) : x;
    }
    x = log1p(-p) * (x + 1);
    if (logP) return R_DT_Clog(lowerTail, logP, x);
    else return lowerTail ? -expm1(x) : exp(x);
  });
  return result.length === 1 ? result[0] : (result as any);
}
