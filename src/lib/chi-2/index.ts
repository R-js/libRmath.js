/* This is a conversion from BLAS to Typescript/Javascript
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
import { Inversion, IRNGNormal } from '../rng/normal';
import { dchisq as _dchisq } from './dchisq';
import { dnchisq as _dnchisq } from './dnchisq';
import { pchisq as _pchisq } from './pchisq';
import { pnchisq as _pnchisq } from './pnchisq';
import { qchisq as _qchisq } from './qchisq';
import { qnchisq as _qnchisq } from './qnchisq';
import { rchisq as _rchisq } from './rchisq';
import { rnchisq as _rnchisq } from './rnchisq';

export function ChiSquared(rng: IRNGNormal = new Inversion()) {
  function rchisq(n: number|number[] = 1, df: number, ncp?: number) {
    return ncp === undefined
      ? _rchisq(n, df, rng)
      : _rnchisq(n, df, ncp, rng);
  }

  function qchisq(
    p: number,
    df: number,
    ncp?: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ) {
    return ncp === undefined
      ? _qchisq(p, df, lowerTail, logP)
      : _qnchisq(p, df, ncp, lowerTail, logP);
  }

  function pchisq(
    p: number,
    df: number,
    ncp?: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ) {
    return ncp === undefined
      ? _pchisq(p, df, lowerTail, logP)
      : _pnchisq(p, df, ncp, lowerTail, logP);
  }

  function dchisq(
    x: number,
    df: number,
    ncp?: number,
    log: boolean = false
  ) {
    return ncp === undefined ? _dchisq(x, df, log) : _dnchisq(x, df, ncp, log);
  }

  return {
      dchisq,
      pchisq,
      qchisq,
      rchisq
  };
}
