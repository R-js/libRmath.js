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

import { debug } from 'debug';
import { ML_ERR_return_NAN } from '@common/logger.js';
import { rgamma } from '@dist/gamma/rgamma.js';
import { rpoisOne } from '@dist/poisson/rpois.js';
import { rchisqOne } from '@dist/chi-2/rchisq.js';

import type { IRNGNormal } from '@rng/normal/normal-rng.js';

const printer = debug('rnchisq');

export function rnchisqOne(df: number, lambda: number, rng: IRNGNormal): number {
    if (!isFinite(df) || !isFinite(lambda) || df < 0 || lambda < 0) {
        return ML_ERR_return_NAN(printer);
    }
    if (lambda === 0) {
        return df === 0 ? 0 : rgamma(df / 2, 2, rng);
    } else {
        let r = rpoisOne(lambda / 2, rng);
        if (r > 0) r = rchisqOne(2 * r, rng);
        if (df > 0) r += rgamma(df / 2, 2, rng);
        return r;
    }
}
