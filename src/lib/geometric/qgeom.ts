/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';
import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../common/_general';

import { R_DT_Clog } from '../exp/expm1';

const { ceil, max: fmax2, log1p } = Math;
const { POSITIVE_INFINITY: ML_POSINF, isNaN: ISNAN } = Number;
const printer = debug('qgeom');

export function qgeom<T>(
  pp: T,
  prob: number,
  lower_tail: boolean = true,
  log_p: boolean = false
): T {
  const fp: number[] = Array.isArray(pp) ? pp : ([pp] as any);

  const result = fp.map(p => {
    if (prob <= 0 || prob > 1) {
      return ML_ERR_return_NAN(printer);
    }

    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);
    if (rc !== undefined) {
      return rc;
    }

    if (ISNAN(p) || ISNAN(prob)) return p + prob;

    if (prob === 1) return 0;
    /* add a fuzz to ensure left continuity, but value must be >= 0 */
    return fmax2(
      0,
      ceil(R_DT_Clog(lower_tail, log_p, p) / log1p(-prob) - 1 - 1e-12)
    );
  });
  return result.length === 1 ? result[0] : result as any;
}
