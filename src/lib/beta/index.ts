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
import { boolVector, numVector } from '../types';
import { rbeta as _rbeta } from './rbeta';
export const special = {
  beta,
  lbeta
};

export function Beta(rng: IRNGNormal = new Inversion()) {
  function dbeta(
    x: numVector,
    shape1: numVector,
    shape2: numVector,
    ncp?: numVector,
    log?: boolVector
  ): numVector {
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
