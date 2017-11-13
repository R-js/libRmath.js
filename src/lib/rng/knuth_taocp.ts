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
import { seq, integer, flatten as c, mul, filterOnIdx } from '~R';

const { trunc, round, ceil, min, log2, pow } = Math; 
const { now } = Date;

export function TAOCP1997init(seed: number): number[]
{
    let KK = 100;
    let LL = 37;
    let MM =  pow(2, 30);
    let KKK = KK + KK - 1;
    let KKL = KK - LL;

    let ss = seed - (seed % 2) + 2;
    let X = integer(KKK);
    for (let j of seq(0, KK - 1)) {
        X[j] = ss;
        ss = ss + ss;
        if (ss >= MM) ss = ss - MM + 2;
    }
    X[2]++;
    ss = seed;
    let T = 69;
    while (T > 0) {
        for (let j of seq(KK, 2)) X[j + j - 1] = X[j];
        for (let j of seq(KKK, KKL + 1, -2)) {
            X[KKK - j + 2 ] = X[j] - (X[j] % 2);
        }
        for (let j of seq(KKK - 1, KK)){
            if (X[j] % 2 === 1 ) {
                X[j - KKL] < - (X[j - KKL] - X[j]) % MM;
                X[j - KK] < - (X[j - KK] - X[j]) % MM;
            }
        }
        if (ss % 2 === 1 ) {
            for (let j of seq(KK - 1, 0)) X[j + 1] = X[j];
            X[1] = X[KK + 1];
            if (X[KK + 1] % 2 === 1 )
                X[LL + 1] = (X[LL + 1] - X[KK + 1]) % MM;
        }
        if (ss) ss = ss % 2; else T = T - 1;
    }
   
    return ( mul(-1)(...c<number>(
           ...X.filter(filterOnIdx(seq(LL - 1, 0))), 
           ...X.slice(0, LL + 1) 
        )
    ));
}

