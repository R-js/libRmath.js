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
import { lazyMap, range } from '../../src/lib/r-func'
import { DBL_MANT_DIG, M_LN2, DBL_MIN_EXP, M_SQRT_32 } from '../../src/lib/common/_general'
const { sqrt } = Math
const threshold = sqrt(-2 * M_LN2 * (DBL_MIN_EXP + 1 - DBL_MANT_DIG))
const _ = undefined
const T = true;
const I = Infinity;
const { MAX_VALUE: DBL_MAX } = Number
const F = false;




const fixture = {
    dnorm: {
        'case': {
            skip: F,
            input: [
                { x: 2 },
                { x: 3, mu: 1, sd: 1 },
                { x: -1, mu: 1, sd: 1, l: true },
                { x: 10, mu: 1, sd: 1 },
                { x: NaN },
                { x: -2, sd: Infinity },
                { x: Infinity, mu: Infinity },
                { x: -1, mu: -1 },
                { x: 1 },
                { x: 1, sd: -1 },
                { x: Infinity },
                { x: 5.363123171977038e+154 },
                { x: 155.5607738721713 },
                { x: 0, mu: 0, sd: 0 },
                { x: 1, mu: 0, sd: 0 }
            ],
            expected: [
                0.05399096651318806,
                0.05399096651318806,
                -2.9189385332046727,
                1.0279773571668917e-18,
                NaN,
                0,
                NaN,
                0.3989422804014327,
                0.24197072451914337,
                NaN,
                0,
                0,
                0,
                Infinity,
                0
            ]
        }
    },
    qnorm: {
        'defaults & Edges': {
            input: [
                { p: 0.5, mu: 1 },
                { p: -1E-6, l: T, lt: F },
                { p: -1E3, l: T, lt: T },
                { p: 1E-3 },
                { p: 0 },
                { p: NaN, l: F },
                { p: 0.5, lt: T },
                { p: 0.5, sd: -1 },
                { p: 0.5, sd: 0 },
                { p: 0.99 }
            ],
            expected: [ // in R set options(digits=19)
                1,
                -4.7534244098670255,
                -44.615747731966628,
                -3.0902323061678132,
                -Infinity,
                NaN,
                0,
                NaN,
                0,
                2.3263478740408408
            ]
        }
    },
    pnorm: {
        /* pnorm5(
             q: number,
             mu: number = 0,
             sigma: number = 1,
             lowerTail: boolean = true,
             logP: boolean = false
         */
        'linear scan': {
            input: lazyMap<number, { q: number, mu: number, sd: number }>(v => ({
                q: v,
                mu: 0,
                sd: 5
            }))(range(-15, 15 )),
            expected: [
                2
            ]
        },
        'defaults & Edges': {
            input: [
                { q: 0.5 },//1
                { q: NaN, mu: 1, sd: 2, lt: T, l: F },
                { q: Infinity, mu: Infinity, l: T, lt: T },
                { q: 1E-3, sd: -1 },
                { q: 0, sd: 0 },//5
                { q: -1, mu: -Infinity },
                { q: -1, mu: Infinity, sd: 0 },
                { q: -1, mu: -Infinity, sd: 0 },
                { q: -1, mu: -Infinity, sd: 1 },
                { q: -1, mu: +Infinity, sd: 1 },//10
                { q: -1, mu: 0, sd: 1, lt: T },//11
                { q: -1, mu: 0, sd: 1, lt: F },//12
                { q: Number.EPSILON * 0.25 },//13
                { q: Number.EPSILON * 0.25, lt: F },//14
                { q: Number.EPSILON * 0.25, l: T },//15
                { q: Number.EPSILON * 0.25, lt: F, l: T },
            ],
            expected: [ // in R set options(digits=19)
                0.69146246127401301,//1
                NaN,
                NaN,
                NaN,
                1,//5
                1,
                0,
                1,
                1,
                0,//10
                0.15865525393145705,//11
                0.84134474606854293,//12
                0.5,//13
                0.5,//14
                -0.69314718055994529,//15
                -0.69314718055994529,//16
                /*-4.7534244098670255,
                -44.615747731966628,
                -3.0902323061678132,
                -Infinity,
                NaN,
                0,
                NaN,
                0,
                2.3263478740408408*/
            ]
        }
    }
}

export default fixture