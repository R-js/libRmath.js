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

import * as debug from 'debug';

import { rchisqOne } from '../chi-2/rchisq';
import { ML_ERR_return_NAN } from '../common/_general';
import { randomGenHelper } from '../r-func';
import { IRNGNormal } from '../rng/normal';

const { sqrt } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;

const printer = debug('rt');

export function rt(n: number| number[], df: number, rng: IRNGNormal) { 
  return randomGenHelper(n, rtOne, df, rng);
}

export function rtOne(df: number, rng: IRNGNormal): number {
  if (ISNAN(df) || df <= 0.0) {
    return ML_ERR_return_NAN(printer);
  }

  if (!R_FINITE(df)) return rng.internal_norm_rand();

  /* Some compilers (including MW6) evaluated this from right to left
        return norm_rand() / sqrt(rchisq(df) / df); */

  let num = rng.internal_norm_rand();
  return num / sqrt(rchisqOne(df, rng) / df);
}
