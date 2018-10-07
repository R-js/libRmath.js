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

import {
  ML_ERR_return_NAN,
  R_D__0,
  R_D__1,
  R_D_exp,
  R_D_fexp,
  R_D_nonint_check
} from '../common/_general';

import { bd0 } from '../deviance'; 
import { lgammafn } from '../gamma/lgamma_fn';
import { map } from '../r-func';
import { stirlerr } from '../stirling';

const { round: R_forceint, log, PI } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE, MIN_VALUE: DBL_MIN } = Number;
const M_2PI = 2 * PI;
const printer = debug('dpois');

export function dpois_raw(
  x: number,
  lambda: number,
  give_log: boolean
): number {
  /*       x >= 0 ; integer for dpois(), but not e.g. for pgamma()!
        lambda >= 0
    */
  if (lambda === 0) return x === 0 ? R_D__1(give_log) : R_D__0(give_log);
  if (!R_FINITE(lambda)) return R_D__0(give_log);
  if (x < 0) return R_D__0(give_log);
  if (x <= lambda * DBL_MIN) return R_D_exp(give_log, -lambda);
  if (lambda < x * DBL_MIN)
    return R_D_exp(give_log, -lambda + x * log(lambda) - lgammafn(x + 1));

    return R_D_fexp(give_log, M_2PI * x, -stirlerr(x) - bd0(x, lambda));
}

export function dpois(
  _x: number | number[],
  lambda: number,
  give_log: boolean = false
): number | number[] {
  
  return map(_x)(x => {
    if (ISNAN(x) || ISNAN(lambda)) {
      return x + lambda;
    }

    if (lambda < 0) {
      return ML_ERR_return_NAN(printer);
    }
    let rc = R_D_nonint_check(give_log, x, printer);
    if (rc !== undefined) {
      return rc;
    }
    if (x < 0 || !R_FINITE(x)) {
      return R_D__0(give_log);
    }
    x = R_forceint(x);
    return dpois_raw(x, lambda, give_log);
  });
}
