/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';

import { ML_ERR_return_NAN } from '../common/_general';
import { map, seq } from '../r-func';
import { IRNG } from '../rng';

const { log } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const sequence = seq()();
const printer_rlogis = debug('rlogis');

export function rlogis(
  N: number,
  location: number = 0,
  scale: number = 1,
  rng: IRNG
): number | number[] {
  return map(sequence(N))(() => {
    if (ISNAN(location) || !R_FINITE(scale)) {
      return ML_ERR_return_NAN(printer_rlogis);
    }

    if (scale === 0 || !R_FINITE(location)) return location;
    else {
      let u: number = rng.unif_rand() as number;
      return location + scale * log(u / (1 - u));
    }
  }) as any;
}
