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
import { debug } from 'debug';
import { ML_ERR_return_NAN } from '@common/logger';
import { IRNG } from '../../rng/irng';

const { isNaN: ISNAN } = Number;
const { floor, round } = Math;
const printer_rsignrank = debug('rsignrank');

export function rsignrank(nn: number, n: number, rng: IRNG): number | number[] {
    return Array.from({ length: nn }).map(() => {
        /* NaNs propagated correctly */
        if (ISNAN(n)) return n;
        const nRound = round(n);
        if (nRound < 0) return ML_ERR_return_NAN(printer_rsignrank);

        if (nRound === 0) return 0;
        let r = 0.0;
        const k = floor(nRound);
        for (let i = 0; i < k /**/; ) {
            r += ++i * floor(rng.random() + 0.5);
        }
        return r;
    });
}
