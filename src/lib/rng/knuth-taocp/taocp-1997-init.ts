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

const { trunc } = Math;

export function TAOCP1997init(seed: number): Uint32Array {
  const KK = 100;
  const LL = 37;
  const MM = 1073741824; // pow(2, 30);
  const MMF = 1073741824 - 1; //
  const KKK = 199; //KK + KK - 1;
  const KKL = 63; //KK - LL;

  let ss = seed - seed % 2 + 2;
  const X = new Uint32Array(KKK);
  //const arr = sequenceFactory(-1);
  for (let j = 0; j < KK; j++) {
    X[j] = ss;
    ss = ss + ss;
    if (ss >= MM) ss = ss - MM + 2;
  }
  X[1]++; //not js is zero based!!
  ss = seed;
  let T = 69;

  while (T > 0) {

    let j;

    for (j = KK - 1; j >= 1; j--) {
      X[j + j] = X[j];
    }
    for (j = KKK - 1; j >= KKL + 1; j -= 2) {

      X[KKK - j] = X[j] - X[j] % 2;
    }

    for (j = KKK - 1; j >= KK; j--) {
      if (X[j] % 2 === 1) {
        X[j - KKL] = (X[j - KKL] - X[j]) & MMF;
        X[j - KK] = (X[j - KK] - X[j]) & MMF;
      }
    }

    if (ss & 1) {
      for (j = KK-1; j>=0; j--) {
        X[j + 1] = X[j];
      }
      X[1 - 1] = X[KK + 1 - 1];
      if (X[KK + 1 - 1] % 2 === 1) {
        X[LL + 1 - 1] = (X[LL + 1 - 1] - X[KK + 1 - 1]) & MMF;
      }
    }

    if (ss) {
      ss = trunc(ss / 2);
    } else {
      T = T - 1;
    }
  }

  const res = new Uint32Array(KK);
  res.set(X.slice(LL, KK));
  res.set(X.slice(0, LL), KK - LL);
  return res;
}
