/* This is a conversion from libRmath.js to Typescript/Javascript
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
import { DBL_MANT_DIG,M_LN2, DBL_MIN_EXP  } from '../../src/lib/common/_general'
const { sqrt } = Math
const threshold = sqrt(-2 * M_LN2 * (DBL_MIN_EXP + 1 - DBL_MANT_DIG))
const _ = undefined
const T = true;
const I = Infinity;
const { MAX_VALUE: DBL_MAX } = Number
//const F = false;
const fixture = {
    dnorm: {
        case0: {
            input: {
                x:     [2, 3, -1, 10, NaN, -2, I, -1, 1, 1, I, 4*sqrt(DBL_MAX)],
                mu:    [_, 1, 1,   1, _,   _,  I, -1, 0, 0, _, _],
                sigma: [_, 1, 1,   1, _,   I,  _,  0, 0, -1, _, _],
                asLog: [_, _, T,  _ , _,   _,  _,  0, 0, 0, _, _]
            },
            expected: [0.05399096651, 0.05399096651, -2.918938533, 1.027977357e-18]
        },
        case1: {
            input: {
                x:     [4*sqrt(DBL_MAX), 4*threshold],
                mu:    [_],
                sigma: [_],
                asLog: [_]
            },
            expected: [0.05399096651, 0.05399096651, -2.918938533, 1.027977357e-18]
        },
        
        /*case1: {
            desc: 'dnorm: x=3, mu=4, sigma=2',
            input: {
                x: [3],
                mu: 4,
                sigma: 2,
                asLog: undefined,
            },
            output: [0.17603266338214976]
        },
        case2: {
            desc: 'dnorm: x=-10, and go with defaults',
            input: {
                x: [-10],
                mu: undefined,
                sigma: undefined,
                asLog: undefined,
            },
            output: [7.69459862670642e-23]
        },
        case3: {
            desc: 'dnorm: x=-10, and go with defaults',
            input: {
                x: [-Infinity, Infinity, NaN, -4, -3, -2, 0, 1, 2, 3, 4],
                mu: undefined,
                sigma: undefined,
                asLog: undefined,
            },
            output: [
                0,
                0,
                NaN,
                0.00013383022576488537,
                0.0044318484119380075,
                0.05399096651318806,
                0.3989422804014327,
                0.24197072451914337,
                0.05399096651318806,
                0.0044318484119380075,
                0.00013383022576488537
            ]
        },
        case4: {
            desc: 'dnorm: mu:2, sigma:1, asLog:true',
            input: {
                x: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
                mu: 2,
                sigma: 1,
                asLog: true,
            },
            output:
                [-18.918938533204674,
                -13.418938533204672,
                -8.918938533204672,
                -5.418938533204673,
                -2.9189385332046727,
                -1.4189385332046727,
                -0.9189385332046728,
                -1.4189385332046727,
                -2.9189385332046727]
        },*/
    }
}

export default fixture