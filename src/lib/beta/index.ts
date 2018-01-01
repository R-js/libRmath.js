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
import { rbeta as _rbeta } from './rbeta';

import { INormal, Normal } from '~normal';
import { forceToArray } from '../r-func';

export const special = {
  beta,
  lbeta
};

export function Beta(norm: INormal = Normal()) {
  function dbeta<T>(
    x: T,
    shape1: number,
    shape2: number,
    ncp?: number,
    log: boolean = false
  ): T {
    if (ncp === undefined) {
      return _dbeta(x, shape1, shape2, log);
    } else {
      return _dnbeta(x, shape1, shape2, ncp, log);
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
    if (ncp === undefined) {
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
      return _rbeta(n, shape1, shape2, norm);
    } else {
      let ax = forceToArray(rnchisq(n, 2 * shape1, ncp, norm));
      let bx = forceToArray(rchisq(n, 2 * shape2, norm));
      let result = ax.map((a, i) => a / (a + bx[i]));
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
