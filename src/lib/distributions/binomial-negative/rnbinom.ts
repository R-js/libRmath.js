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

import debug from 'debug';
import { ML_ERR_return_NAN } from '@common/logger.js';

import { rgammaOne } from '@dist/gamma/rgamma.js';
import { rpoisOne } from '@dist/poisson/rpois.js';
import type { IRNGNormal } from '@rng/normal/normal-rng.js';

const printer_rnbinom = debug('rnbinom');

export function rnbinomOne(size: number, prob: number, rng: IRNGNormal): number {
    if (!isFinite(size) || !isFinite(prob) || size <= 0 || prob <= 0 || prob > 1) {
        /* prob = 1 is ok, PR#1218 */
        return ML_ERR_return_NAN(printer_rnbinom);
    }
    return prob === 1 ? 0 : rpoisOne(rgammaOne(size, (1 - prob) / prob, rng), rng);
}

const printer_rnbinom_mu = debug('rnbinom_mu');

export function rnbinom_muOne(size: number, mu: number, rng: IRNGNormal): number {
    if (!isFinite(size) || !isFinite(mu) || size <= 0 || mu < 0) {
        return ML_ERR_return_NAN(printer_rnbinom_mu);
    }
    return mu === 0 ? 0 : rpoisOne(rgammaOne(size, mu / size, rng), rng);
}
