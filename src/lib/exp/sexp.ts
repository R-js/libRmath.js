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



import { IRNGCore } from '../rng/irng';

export function exp_rand(unif_rand: IRNGCore['internal_unif_rand']): number {

  const q: number[] = [
    0.6931471805599453,
    0.9333736875190459,
    0.9888777961838675,
    0.9984959252914960,
    0.9998292811061389,
    0.9999833164100727,
    0.9999985691438767,
    0.9999998906925558,
    0.9999999924734159,
    0.9999999995283275,
    0.9999999999728814,
    0.9999999999985598,
    0.9999999999999289,
    0.9999999999999968,
    0.9999999999999999,
    1.0000000000000000
  ];

  let a = 0.;
  let u = unif_rand();    // precaution if u = 0 is ever returned
  while (u <= 0. || u >= 1.) u = unif_rand();
  while (true) {
    u += u;
    if (u > 1.)
      break;
    a += q[0];
  }
  u -= 1.;

  if (u <= q[0])
    return a + u;

  let i = 0;
  let ustar = unif_rand();
  let umin = ustar;
  do {
    ustar = unif_rand();
    if (umin > ustar)
      umin = ustar;
    i++;
  } while (u > q[i]);
  return a + umin * q[0];
}

