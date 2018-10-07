'use strict'
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
import { dwilcox } from './dwilcox';
import { pwilcox } from './pwilcox';
import { qwilcox } from './qwilcox';
import { rwilcox as _rwilc }  from './rwilcox';
//import { WilcoxonCache } from './WilcoxonCache';

import { IRNG } from '../rng';
import { MersenneTwister } from '../rng/mersenne-twister';


export function Wilcoxon(rng: IRNG = new MersenneTwister(0)){
    function rwilcox(nn: number, m: number, n: number){
        return _rwilc(nn, m, n, rng);
    }
    return {
        dwilcox,
        pwilcox,
        qwilcox,
        rwilcox
    };
}
