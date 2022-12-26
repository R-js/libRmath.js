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
import { R_Q_P01_boundaries } from '@common/logger';
import { exp } from '@lib/r-func';
import { qnorm } from '@dist/normal/qnorm';

export function qlnorm(p: number, meanlog = 0, sdlog = 1, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(meanlog) || isNaN(sdlog)) return p + meanlog + sdlog;

    const rc = R_Q_P01_boundaries(lowerTail, logP, p, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }
    return exp(qnorm(p, meanlog, sdlog, lowerTail, logP));
}
