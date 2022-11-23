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
import { cl, select } from '@common/debug-select'

const regexpAll = /^.*$/
const msgBesselI = select('besselI')(regexpAll);
const msgBesselIInternal = select('I_bessel')(regexpAll);

//app
msgBesselI
msgBesselIInternal

import besselI from '..';

describe('bessel function of first kind (besselJ)', function () {
    beforeEach(() => {
        cl.clear('BesselJ');
        cl.clear('J_bessel');
    });
    describe('invalid input and edge cases', () => {

    });
    describe('fidelity', () => {

        
    });
});