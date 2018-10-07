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
//needed for rf
import { rchisqOne } from '../chi-2/rchisq';
import { rnchisqOne } from '../chi-2/rnchisq';
import { randomGenHelper } from '../r-func';
import { Inversion, IRNGNormal } from '../rng/normal';
//
import { df as _df } from './df';
import { dnf } from './dnf';
//
import { pf as _pf } from './pf';
import { pnf } from './pnf';
//
import { qf as _qf } from './qf';
import { qnf } from './qnf';
import { rfOne as _rfOne } from './rf';

export function FDist(rng: IRNGNormal = new Inversion()) {
  function df(
    x: number,
    df1: number,
    df2: number,
    ncp?: number,
    log: boolean = false
  ) {
    /*
    function (x, df1, df2, ncp, log = FALSE) 
      {
    if (missing(ncp)) 
        .Call(C_df, x, df1, df2, log)
    else .Call(C_dnf, x, df1, df2, ncp, log)
      }
    */
    if (ncp === undefined) {
      return _df(x, df1, df2, log);
    }
    return dnf(x, df1, df2, ncp, log);
  }
  function pf(
    q: number,
    df1: number,
    df2: number,
    ncp?: number,
    lowerTail = true,
    logP = false
  ) {
    /*  if (missing(ncp)) 
        .Call(C_pf, q, df1, df2, lower.tail, log.p)
    else .Call(C_pnf, q, df1, df2, ncp, lower.tail, log.p)
*/
    if (ncp === undefined) {
      return _pf(q, df1, df2, lowerTail, logP);
    }
    return pnf(q, df1, df2, ncp, lowerTail, logP);
  }

  function qf(
    p: number,
    df1: number,
    df2: number,
    ncp?: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ) {
    if (ncp === undefined) {
      return _qf(p, df1, df2, lowerTail, logP);
    }
    return qnf(p, df1, df2, ncp, lowerTail, logP);
  }

 
  function rf(n: number|number, n1: number, n2: number, rng: IRNGNormal): number[] {
    return randomGenHelper(n, rfOne, n1, n2, rng);
  }

  function rfOne(df1: number, df2: number, ncp?: number) {

    if (ncp === undefined) {
      return _rfOne(df1, df2, rng);
    }

    if (Number.isNaN(ncp)) {
      return NaN;
    }


    const numerator = rnchisqOne(df1, ncp, rng) / df1;
    const denominator = rchisqOne(df2, rng) / df2;

    return numerator / denominator;
  }

  return {
    df,
    pf,
    qf,
    rf
  };
}
