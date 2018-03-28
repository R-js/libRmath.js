/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';

import {
    ME,
    ML_ERROR
} from '../common/_general';

const { max: fmax2, log, abs: fabs } = Math;
const { NaN: ML_NAN } = Number;

const printer = debug('gammalims');

export function gammalims(input: { xmin: number, xmax: number }, IEEE_754?: boolean): void {
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
        input.xmin -= input.xmin * ((input.xmin + .5) * xln - input.xmin - .2258 + alnsml) /
            (input.xmin * xln + .5);
        if (fabs(input.xmin - xold) < .005) {
            input.xmin = -(input.xmin) + .01;
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
        input.xmax -= input.xmax * ((input.xmax - .5) * xln - input.xmax + .9189 - alnbig) /
            (input.xmax * xln - .5);
        if (fabs(input.xmax - xold) < .005) {
            input.xmax += -.01;
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
    input.xmin = fmax2(input.xmin, -(input.xmax) + 1);
}


