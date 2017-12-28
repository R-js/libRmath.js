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

export const special = {
  beta,
  lbeta
};

function NSbeta(norm: INormal = Normal()) {
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
    x: T,
    shape1: number,
    shape2: number,
    ncp?: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ): T {
    if (ncp === undefined) {
      return _pbeta(x, shape1, shape2, lowerTail, logP);
    } else {
      return _pnbeta(x, shape1, shape2, ncp, lowerTail, logP);
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
    n: number = 1,
    shape1: number,
    shape2: number,
    ncp: number = 0
  ) {
    if (ncp === 0) {
      return _rbeta(n, shape1, shape2, norm);
    } else {
      const result: number[] = [];
      for (let i = 0; i < n; i++) {
        let x = rnchisq(1, 2 * shape1, ncp, norm) as number;
        let x2 = rchisq(1, 2 * shape2, norm) as number;
        result.push(x / (x + x2));
      }
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

export { NSbeta as Beta };
