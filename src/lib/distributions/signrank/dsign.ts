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
import { ML_ERR_return_NAN, } from '@common/logger';
import { csignrank } from './csignrank';
import { R_D__0, R_D_exp, isNaN, trunc, abs, log, M_LN2, round } from '@lib/r-func';

const printer = debug('dsignrank');

export function dsignrank(x: number, n: number, logX = false): number {

    if (isNaN(x) || isNaN(n)) {
        return x + n;
    }

    if (n <= 0) {
        return ML_ERR_return_NAN(printer);
    }

    if (abs(x - round(x)) > 1e-7) {
        return R_D__0(logX);
    }

    // both "n" and "x" are typecasted to (int) 32bit signed integer 
    // so in original source they came into this function as doubles
    // this means that it makes no sense that n or x are greater then 
    // MAX_INT (about 2.7 billion)    

    n = round(n);
    x = round(x);

    if (x < 0 || x > (n * (n + 1)) / 2) {
        return R_D__0(logX);
    }

    // int
    const u = n * (n + 1) / 2;
    // int
    const c = Math.trunc(u / 2)
    const w = new Float64Array(c+1);
    const d = R_D_exp(logX, log(csignrank(trunc(x), n, u, c, w)) - n * M_LN2);
    return d;
}
