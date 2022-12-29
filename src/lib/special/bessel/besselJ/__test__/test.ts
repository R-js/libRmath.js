/* This is a conversion from LIB-R-MATH to Typescript/Javascript
Copyright (C) 2022  Jacob K.F. Bogers  info@mail.jacob-bogers.com

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

// node
//import { resolve } from 'path';

//helper
//import { loadData } from '@common/load';
import { cl, select } from '@common/debug-mangos-select';

const regexpAll = /^.*$/
const msgBesselJ = select('BesselJ')(regexpAll);
const msgBesselJInternal = select('J_bessel')(regexpAll);

//app

import besselJ from '..';

describe('bessel function of first kind (besselJ)', function () {
    beforeEach(() => {
        cl.clear('BesselJ');
        cl.clear('J_bessel');
    });
    describe('invalid input and edge cases', () => {
        it('[NaN] in, NaN', () => {
            const actual = besselJ(NaN, 0);
            expect(actual).toEqualFloatingPointBinary(NaN);
        });
        it('[-1] in, NaN', () => {
            const actual = besselJ(-1, 0);
            expect(actual).toEqualFloatingPointBinary(NaN);
        });
        it('x=4,nu=1e9 gives NaN', () => {
            const actual = besselJ(4, 1e9);
            expect(actual).toEqualFloatingPointBinary(NaN);
        });
        it('x=4E5,nu=-52 gives warning', () => {
            const actual = besselJ(4E5, -52);
            // check error log
            expect(actual).toEqualFloatingPointBinary(0);
            expect(msgBesselJInternal()).toEqual([["argument out of range in '%s'", 'J_bessel_err_nr=1000']]);
        });
        it('x=27.595, nu=398.5', () => {
            const actual = besselJ(27.595, 398.5);
            expect(actual).toBe(0);
            expect(msgBesselJ()).toEqual([
                ['debug (nu=%d, na=%d, nb=%d, rc=%j', 0.5, 398, 399, { nb: 399, ncalc: 320, x: 0 } ],
                ['bessel_j(%d,nu=%d): precision lost in result', 27.595, 398.5]
            ]);
            expect(msgBesselJInternal()).toEqual([['rest: x=%d, nb=%d\t', 27.595, 399]]);
        });
    });
    describe('fidelity', () => {
        it('x=0.1,nu=-0.5', () => {
            const actual = besselJ(0.1, -0.5);
            expect(actual).toEqualFloatingPointBinary(2.5105273689585096974);
        });
        it('x=0.1,nu=-0.9', () => {
            const actual = besselJ(0.1, -0.9);
            expect(actual).toEqualFloatingPointBinary(1.5191602453485768542);
        });
        it('x< 1E-4, nu=-4.9', () => {
            const actual = besselJ(1E-4/2.1, 4.9);
            expect(actual).toEqualFloatingPointBinary(2.1907703120848136824e-25);
        });
        it('x > 25, nu = 3', ()=>{
            const actual = besselJ(40, 3);
            expect(actual).toEqualFloatingPointBinary(-0.12614481550582079539);
        })
    });
});