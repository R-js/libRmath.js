'use strict'
/* This is a conversion from libRmath.so to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import * as debug from 'debug';

import { ML_ERR_return_NAN, R_D__0 } from '../common/_general';
import { internal_choose, internal_lchoose } from '../common/choose';
import { cwilcox } from './cwilcox';
import { WilcoxonCache } from './WilcoxonCache';

const { round: R_forceint, abs: fabs, log } = Math;
const { isNaN: ISNAN } = Number;
const printer_dwilcox = debug('dwilcox');

export function dwilcox(
  x: number,
  m: number,
  n: number,
  giveLog: boolean = false
): number {
  // outside the potential loop

  m = R_forceint(m);
  n = R_forceint(n);

  //const nm = m * n;
 
    const w = new WilcoxonCache();
    //#ifdef IEEE_754
    /* NaNs propagated correctly */

    if (ISNAN(x) || ISNAN(m) || ISNAN(n)) {
     // console.log(`1. x:${x}, m:${m}, n:${n}`);
      return (x + m + n);
    }
    //#endif

    if (m <= 0 || n <= 0) {
     // console.log(`2. x:${x}, m:${m}, n:${n}`);
      return ML_ERR_return_NAN(printer_dwilcox);
    }

    if (fabs(x - R_forceint(x)) > 1e-7) {
     // console.log(`3. x:${x}, m:${m}, n:${n}`);
      return R_D__0(giveLog);
    }
    x = R_forceint(x);
    if (x < 0 || x > m * n) {
      return R_D__0(giveLog);
    }
    //const w = initw(m, n);
    //console.log(`0. special: ${w[4][4].length}`);
    //const c1 = cwilcox(x, m, n, w);
    
    //console.log(`4. c1:${c1} <- x:${x}, m:${m}, n:${n}`);
    return giveLog
      ? log(cwilcox(x, m, n, w)) - internal_lchoose(m + n, n)
      : cwilcox(x, m, n, w) / internal_choose(m + n, n);
}
