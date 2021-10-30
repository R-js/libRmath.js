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
import { IRNG } from '@rng/irng';
import { round, trunc, floor } from '@lib/r-func';
import { R_unif_index } from '@rng/utils';
import { IRNGSampleKindTypeEnum } from '@rng/sample-kind-type'

const printer_rwilcox = debug('rwilcox');

const MAXSIZE = 4294967296;

export function rwilcoxOne(m: number, n: number, rng: IRNG, sampleKind: IRNGSampleKindTypeEnum): number 
{
    /* NaNs propagated correctly */
    if (isNaN(m) || isNaN(n))
    {   
        return m + n;
    }
    m = round(m);
    n = round(n);
    if (m < 0 || n < 0)
    {
        return ML_ERR_return_NAN(printer_rwilcox);
    }
    if (m === 0 || n === 0)
    {
        return 0;
    }

    let k = trunc(m + n);

    let x;
    if (k <= 65536) {
        x = new Uint16Array(k);
    }
    else if (k <= MAXSIZE) {
        x = new Uint32Array(k);
    }
    else {
        return ML_ERR_return_NAN(printer_rwilcox);
    }

    for (let i = 0; i < k; i++) {
        x[i] = i+1;
    }
    let r = 0.0;
    printer_rwilcox(`------v`);
    for (let i = 0; i < n; i++) {
        const j = floor(R_unif_index(k, rng, sampleKind));
        r += x[j];
        x[j] = x[--k];
        printer_rwilcox('i:%d,\tn:%d\tj:%d\tk:%d\tr:%d\tx:%o', i, n, j, k, x);
    }
    return r - (n * (n - 1)) / 2;
}
