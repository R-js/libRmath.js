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
        'case': {
            input: {
                x:     [2, 3, -1, 10, NaN, -2, I, -1, 1, 1, I, 4*sqrt(DBL_MAX), 4*threshold],
                mu:    [_, 1, 1,   1, _,   _,  I, -1, 0, 0, _, _, _],
                sigma: [_, 1, 1,   1, _,   I,  _,  0, 0, -1, _, _, _],
                asLog: [_, _, T,  _ , _,   _,  _,  0, 0, 0, _, _, _]
            },
            expected: [
                0.05399096651318806,
                0.05399096651318806,
                -2.9189385332046727,
                1.0279773571668917e-18,
                NaN,
                0,
                NaN,
                Infinity,
                0,
                NaN,
                0,
                0,
                0
            ]
        }
    },
    qnorm: {
        'case': {
            input: {
                x:     [2, 3, -1, 10, NaN, -2, I, -1, 1, 1, I, 4*sqrt(DBL_MAX), 4*threshold],
                mu:    [_, 1, 1,   1, _,   _,  I, -1, 0, 0, _, _, _],
                sigma: [_, 1, 1,   1, _,   I,  _,  0, 0, -1, _, _, _],
                asLog: [_, _, T,  _ , _,   _,  _,  0, 0, 0, _, _, _]
            },
            expected: [
                0.05399096651318806,
                0.05399096651318806,
                -2.9189385332046727,
                1.0279773571668917e-18,
                NaN,
                0,
                NaN,
                Infinity,
                0,
                NaN,
                0,
                0,
                0
            ]
        }
    }
}

export default fixture