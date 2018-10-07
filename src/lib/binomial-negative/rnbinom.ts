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

import * as debug from 'debug';
import { ML_ERR_return_NAN } from '../common/_general';

import { rgammaOne } from '../gamma/rgamma';
import { rpoisOne } from '../poisson/rpois';
import { randomGenHelper } from '../r-func'
import { IRNGNormal } from '../rng/normal/inormal-rng';

const { isFinite: R_FINITE } = Number;

const printer_rnbinom = debug('rnbinom');

export function rnbinom(
  n: number | number[],
  size: number,
  prob: number,
  rng: IRNGNormal
): number[] {
  printer_rnbinom('n:%d, size:%d, prob:%d', n, size, prob);
  return randomGenHelper(n, rnbinomOne, size, prob, rng)
}

export function rnbinomOne(
  size: number,
  prob: number,
  rng: IRNGNormal
): number | number[] {

  if (
    !R_FINITE(size) ||
    !R_FINITE(prob) ||
    size <= 0 ||
    prob <= 0 ||
    prob > 1
  ) {
    /* prob = 1 is ok, PR#1218 */
    return ML_ERR_return_NAN(printer_rnbinom);
  }
  return prob === 1
    ? 0
    : (rpoisOne(
      rgammaOne(size, (1 - prob) / prob, rng),
      rng
    ) as number);

}

const printer_rnbinom_mu = debug('rnbinom_mu');

export function rnbinom_mu(n: number | number[] = 1, size: number, mu: number, rng: IRNGNormal): number[] {
  printer_rnbinom_mu('n:%d, size:%d, mu:%d', n, size, mu);
  return randomGenHelper(n, _rnbinom_mu, size, mu, rng)
}

function _rnbinom_mu(size: number, mu: number, rng: IRNGNormal): number {


  if (!R_FINITE(size) || !R_FINITE(mu) || size <= 0 || mu < 0) {
    return ML_ERR_return_NAN(printer_rnbinom_mu);
  }
  return mu === 0
    ? 0
    : (rpoisOne(
      rgammaOne(size, mu / size, rng),
      rng
    ) as number);

}


