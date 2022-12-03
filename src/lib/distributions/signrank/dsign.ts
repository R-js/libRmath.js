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
import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4, } from '@common/logger';
import { cpu_csignrank } from './csignrank';
import { R_D__0, R_D_exp, isNaN, trunc, abs, log, M_LN2, round } from '@lib/r-func';
import { growMemory, memory } from './csignrank_wasm';

import type { CSingRank, CSignRankMap } from './csignrank_wasm';

let _csignrank: CSingRank  = cpu_csignrank; 

function registerBackend(fns: CSignRankMap): void {
    _csignrank = fns.csignrank;
}

function unRegisterBackend(): boolean {
    _csignrank = cpu_csignrank
    return _csignrank === cpu_csignrank ? false: true
}

export { unRegisterBackend, registerBackend };

const printer = debug('dsignrank');

export function dsignrank(x: number, n: number, logX = false): number {

    if (isNaN(x) || isNaN(n)) {
        return x + n;
    }

    if (n <= 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    if (abs(x - round(x)) > 1e-7) {
        return R_D__0(logX);
    }

    // both "n" and "x" are typecasted to (int) 32bit signed integer 
    // so in original source they came into this function as doubles
    // this means that it makes no sense that n or x are greater then 
    // MAX_INT (about 2.7 billion)    

    n = trunc(n);
    x = round(x);

    if (x < 0 || x > (n * (n + 1)) / 2) {
        return R_D__0(logX);
    }

    // int
    const u = n * (n + 1) / 2;
    // int
    const c = Math.trunc(u / 2)
    growMemory(c+1);
    new Float64Array(memory.buffer).fill(0, 0, c+1);
    
    const d = R_D_exp(logX, log(_csignrank(trunc(x), n, u, c)) - n * M_LN2);
    return d;
}


