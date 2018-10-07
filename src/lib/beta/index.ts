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

//special
import { beta } from './beta';
import { lbeta } from './lbeta';

//distros
//dbeta
import { dbeta as _dbeta } from './dbeta';
import { dnbeta as _dnbeta } from './dnbeta';

//pbeta
import { pbeta as _pbeta } from './pbeta';
import { pnbeta as _pnbeta } from './pnbeta';

//qbeta
import { qbeta as _qbeta } from './qbeta';
import { qnbeta as _qnbeta } from './qnbeta';

//rbeta
import { rchisq } from '../chi-2/rchisq';
import { rnchisq } from '../chi-2/rnchisq';
import { multiplexer } from '../r-func';
import { Inversion, IRNGNormal } from '../rng/normal';
import { rbeta as _rbeta } from './rbeta';
export const special = {
  beta,
  lbeta
};

export function Beta(rng: IRNGNormal = new Inversion()) {
  function dbeta(
    x: number,
    shape1: number,
    shape2: number,
    ncp?: number,
    log?: boolean
  ): number {
    // I added the === 0 here, because dnbeta will go back to dbeta if 0 (c source code)
    if (ncp === undefined || ncp === 0) {
      return _dbeta(x, shape1, shape2, log || false);
    } else {
      return _dnbeta(x, shape1, shape2, ncp || 0, log || false);
    }
  }

  function pbeta<T>(
    q: T,
    shape1: number,
    shape2: number,
    ncp?: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ): T {
    if (ncp === undefined || ncp === 0) {
      return _pbeta(q, shape1, shape2, lowerTail, logP);
    } else {
      return _pnbeta(q, shape1, shape2, ncp, lowerTail, logP);
    }
  }

  function qbeta<T>(
    p: T,
    shape1: number,
    shape2: number,
    ncp?: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ): T {
    if (ncp === undefined) {
      return _qbeta(p, shape1, shape2, lowerTail, logP);
    } else {
      return _qnbeta(p, shape1, shape2, ncp, lowerTail, logP);
    }
  }

  function rbeta(
    n: number,
    shape1: number,
    shape2: number,
    ncp = 0 // NOTE: normally the default is undefined, here it is '0'.
  ): number | number[] {
    if (ncp === 0) {
      return _rbeta(n, shape1, shape2, rng);
    } else {
      let ax = rnchisq(n, 2 * shape1, ncp, rng);
      let bx = rchisq(n, 2 * shape2, rng);
      let result = multiplexer(ax, bx)((a, b) => a / (a + b));
      return result.length === 1 ? result[0] : result;
    }
  }

  return Object.freeze({
    dbeta,
    pbeta,
    qbeta,
    rbeta
  });
}
