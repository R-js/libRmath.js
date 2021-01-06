/* This is a conversion from LIB-R-MATH to Typescript/Javascript
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

import { ME, ML_ERROR } from '../common/_general';

const { max: fmax2, log, abs: fabs } = Math;
const { NaN: ML_NAN } = Number;

const printer = debug('gammalims');

export function gammalims(input: { xmin: number; xmax: number }, IEEE_754?: boolean): void {
    /* 
        FIXME: Even better: If IEEE, #define these in nmath.h
          and don't call gammalims() at all
    */
    if (IEEE_754) {
        input.xmin = -170.5674972726612;
        input.xmax = 171.61447887182298; /*(3 Intel/Sparc architectures)*/
        return;
    }

    let alnbig: number;
    let alnsml: number;
    let xln: number;
    let xold: number;
    let i: number;

    alnsml = log(Number.MIN_VALUE);
    input.xmin = -alnsml;
    let find_xmax = false;
    for (i = 1; i <= 10; ++i) {
        xold = input.xmin;
        xln = log(input.xmin);
        input.xmin -=
            (input.xmin * ((input.xmin + 0.5) * xln - input.xmin - 0.2258 + alnsml)) / (input.xmin * xln + 0.5);
        if (fabs(input.xmin - xold) < 0.005) {
            input.xmin = -input.xmin + 0.01;
            find_xmax = true;
            break;
            // goto find_xmax;
        }
    }

    /* unable to find xmin */
    if (!find_xmax) {
        ML_ERROR(ME.ME_NOCONV, 'gammalims', printer);
        input.xmin = input.xmax = ML_NAN;
    }
    //goto label
    //find_xmax:

    alnbig = log(Number.MIN_VALUE);
    input.xmax = alnbig;
    let done = false;
    for (i = 1; i <= 10; ++i) {
        xold = input.xmax;
        xln = log(input.xmax);
        input.xmax -=
            (input.xmax * ((input.xmax - 0.5) * xln - input.xmax + 0.9189 - alnbig)) / (input.xmax * xln - 0.5);
        if (fabs(input.xmax - xold) < 0.005) {
            input.xmax += -0.01;
            //goto done;
            done = true;
            break;
        }
    }

    /* unable to find xmax */
    if (!done) {
        ML_ERROR(ME.ME_NOCONV, 'gammalims', printer);
        input.xmin = input.xmax = ML_NAN;
    }
    //goto label
    //done:
    input.xmin = fmax2(input.xmin, -input.xmax + 1);
}
