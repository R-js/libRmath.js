/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';
import { ME, ML_ERROR } from '../../common/_general';
import { multiplexer } from '../../r-func';
import { sinpi } from '../../trigonometry/sinpi';
import { boolVector, numVector } from '../../types';
import { internal_bessel_k } from '../besselK';
import { I_bessel } from './IBessel';



const { isNaN: ISNAN } = Number;
const { exp, trunc, floor, PI: M_PI } = Math;

const printer = debug('bessel_i');

export function bessel_i(_x: numVector, _alpha: numVector, _expo: boolVector): numVector {
    return multiplexer(_x, _alpha, _expo)((x, alpha, expo) => internal_bessel_i(x, alpha, expo));
}

/* .Internal(besselI(*)) : */
export function internal_bessel_i(x: number, alpha: number, expo: boolean = false): number {

    //int
    let nb;
    let ize;

    //double 
    let na;

    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(alpha)) return x + alpha;
    if (x < 0) {
        ML_ERROR(ME.ME_RANGE, 'bessel_i', printer);
        return NaN;
    }
    ize = expo ? 2 : 1;
    na = floor(alpha);
    if (alpha < 0) {
        /* Using Abramowitz & Stegun  9.6.2 & 9.6.6
         * this may not be quite optimal (CPU and accuracy wise) */
        return (internal_bessel_i(x, -alpha, expo) +
            ((alpha === na) ? /* sin(pi * alpha) = 0 */ 0 :
                internal_bessel_k(x, -alpha, expo) *
                ((ize === 1) ? 2. : 2. * exp(-2. * x)) / M_PI * sinpi(-alpha)));
    }
    nb = 1 + trunc(na); /* nb-1 <= alpha < nb */
    alpha -= (nb - 1);



    const rc = I_bessel(x, alpha, nb, ize);
    if (rc.ncalc !== rc.nb) {/* error input */
        if (rc.ncalc < 0)
            printer('bessel_i(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?',
                x, rc.ncalc, rc.nb, alpha);
        else
            printer('bessel_i(%d,nu=%d): precision lost in result\n',
                rc.x, alpha + rc.nb - 1);
    }
    x = rc.x; // bi[nb - 1];

    return x;
}

