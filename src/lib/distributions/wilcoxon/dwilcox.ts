'use strict';
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

import { debug } from 'debug';

import { ML_ERR_return_NAN } from '@common/logger';
import { R_D__0 } from '$constants';
import { choose, lchoose } from '@special/choose';
import { cwilcox } from './cwilcox';
import { WilcoxonCache } from './WilcoxonCache';

const printer_dwilcox = debug('dwilcox');

export function dwilcox(x: number, m: number, n: number, giveLog = false): number {
    // outside the potential loop

    m = Math.round(m);
    n = Math.round(n);

    //const nm = m * n;

    const w = new WilcoxonCache();
    //#ifdef IEEE_754
    /* NaNs propagated correctly */

    if (isNaN(x) || isNaN(m) || isNaN(n)) {
        // console.log(`1. x:${x}, m:${m}, n:${n}`);
        return x + m + n;
    }
    //#endif

    if (m <= 0 || n <= 0) {
        // console.log(`2. x:${x}, m:${m}, n:${n}`);
        return ML_ERR_return_NAN(printer_dwilcox);
    }

    if (Math.abs(x - Math.round(x)) > 1e-7) {
        // console.log(`3. x:${x}, m:${m}, n:${n}`);
        return R_D__0(giveLog);
    }
    x = Math.round(x);
    if (x < 0 || x > m * n) {
        return R_D__0(giveLog);
    }
    //const w = initw(m, n);
    //console.log(`0. special: ${w[4][4].length}`);
    //const c1 = cwilcox(x, m, n, w);

    //console.log(`4. c1:${c1} <- x:${x}, m:${m}, n:${n}`);
    return giveLog
        ? Math.log(cwilcox(x, m, n, w)) - lchoose(m + n, n)
        : cwilcox(x, m, n, w) / choose(m + n, n);
}
