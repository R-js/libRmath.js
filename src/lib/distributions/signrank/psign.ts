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
import { ML_ERR_return_NAN, } from '@common/logger.js';
import { R_DT_0, R_DT_1, R_DT_val, round, trunc, M_LN2, exp, isNaN, isFinite } from '@lib/r-func.js';
import { cpu_csignrank } from './csignrank.js';
import { growMemory, memory } from './csignrank_wasm.js';

import type { CSingRank, CSignRankMap } from './csignrank_wasm.js';

const printer = debug('psignrank');

let _csignrank: CSingRank  = cpu_csignrank; 

function registerBackend(fns: CSignRankMap): void {
    _csignrank = fns.csignrank;
}

function unRegisterBackend(): boolean {
    _csignrank = cpu_csignrank
    return _csignrank === cpu_csignrank ? false: true
}

export { unRegisterBackend, registerBackend };


export function psignrank(x: number, n: number, lowerTail = true, logP = false): number {
    if (isNaN(x) || isNaN(n)) {
        return NaN;
    }
    if (!isFinite(n) || n <= 0) {
        return ML_ERR_return_NAN(printer);
    }

    x = round(x + 1e-7);

    if (x < 0.0) {
        return R_DT_0(lowerTail, logP);
    }

    if (x >= n * (n + 1) / 2) {
        return R_DT_1(lowerTail, logP); //returns 1 on the edge case or 0 (because log(1)= 0)
    }

    // ints
    n = round(n);
    const u = n * (n + 1) / 2;
    const c = trunc(u / 2);

    growMemory(c + 1);
    new Float64Array(memory.buffer).fill(0, 0, c+1);

    const f = exp(-n * M_LN2);
    let p = 0;


    
    if (x <= u / 2) {
        //smaller then mean
        for (let i = 0; i <= x; i++) {
            p += _csignrank(i, n, u, c) * f;
        }
    } else {
        x = (n * (n + 1)) / 2 - x;
        for (let i = 0; i < x; i++) {
            p += _csignrank(i, n, u, c) * f;
        }
        lowerTail = !lowerTail; /* p = 1 - p; */
    }
    return R_DT_val(lowerTail, logP, p);
}
