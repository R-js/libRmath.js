'use strict';
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
import { dweibull } from './dweibull';
import { pweibull } from './pweibull';
import { qweibull } from './qweibull';
import { rweibull as _rweibull } from './rweibull';

import { IRNG, rng as _rng } from '../../rng';

export function Weibull(rng: IRNG = new _rng.MersenneTwister(0)) {
    function rweibull(n: number, shape: number, scale = 1) {
        return _rweibull(n, shape, scale, rng);
    }

    return {
        dweibull,
        pweibull,
        qweibull,
        rweibull,
    };
}
