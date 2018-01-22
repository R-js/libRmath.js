'use strict';
/** 
 * Ported by Jacob Bogers nov 2017
#  File src/main/R/base/TAOCP.R
#  Part of the R package, http://www.R-project.org
#  Copyright (C) 2007 R Development Core Team
#
#  This program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  A copy of the GNU General Public License is available at
#  http://www.r-project.org/Licenses/
*/
import { seq } from '../../r-func';

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
  const arr = seq(-1)();
  for (let j of arr(1, KK)) {
    X[j] = ss;
    ss = ss + ss;
    if (ss >= MM) ss = ss - MM + 2;
  }
  X[1]++; //not js is zero based!!
  ss = seed;
  let T = 69;

  while (T > 0) {
    //console.log('TopT', T);
    for (let j of arr(KK, 2)) {
      X[j + j] = X[j];
    }
    for (let j of arr(KKK, KKL + 1, -2)) {
      X[KKK - j] = X[j] - X[j] % 2;
    }

    for (let j of arr(KKK, KK + 1)) {
      //console.log({ j2: j - KKL, j, x:X[j]});
      if (X[j] % 2 === 1) {
        X[j - KKL] = (X[j - KKL] - X[j]) & MMF;
        X[j - KK] = (X[j - KK] - X[j]) & MMF;
      }
    }

    if (ss & 1) {
      for (let j of arr(KK, 1)) {
        X[j + 1] = X[j];
      }
      //console.log({xb:X[0], Xk:X[KK]} );
      X[1 - 1] = X[KK + 1 - 1];
      //  console.log({_xb:X[0], _Xk:X[KK]} );
      //  console.log('');

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
