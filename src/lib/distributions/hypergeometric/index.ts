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
import { dhyper } from './dhyper';
import { phyper } from './phyper';
import { qhyper } from './qhyper';
import { rhyper as _rhyper } from './rhyper';

import { IRNG } from '../../rng/irng';
import { MersenneTwister } from '../../rng/mersenne-twister';

export function HyperGeometric(rng: IRNG = new MersenneTwister()) {
    //rhyper(nn, m, n, k)
    function rhyper(N: number, nn1in: number, nn2in: number, kkin: number) {
        return _rhyper(N, nn1in, nn2in, kkin, rng);
    }

    return {
        dhyper,
        phyper,
        qhyper,
        rhyper,
    };
}
