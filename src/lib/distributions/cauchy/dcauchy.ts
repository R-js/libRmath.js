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
import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { isNaN, PI, log as ln} from '@lib/r-func';
const printer = debug('dcauchy');

export function dcauchy(x: number, location = 0, scale = 1, log = false): number {
    /* NaNs propagated correctly */
    if (isNaN(x) || isNaN(location) || isNaN(scale)) {
        return x + location + scale;
    }

    if (scale <= 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    const y = (x - location) / scale;
    return log ? -ln(PI * scale * (1 + y * y)) : 1 / (PI * scale * (1 + y * y));
}
