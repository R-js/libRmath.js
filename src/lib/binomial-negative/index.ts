import { dnbinom as _dnbinom, dnbinom_mu } from './dnbinom';
import { pnbinom as _pnbinom, pnbinom_mu } from './pnbinom';
import { qnbinom as _qnbinom, qnbinom_mu } from './qnbinom';
import { rnbinom as _rnbinom, rnbinom_mu } from './rnbinom';

import { INormal, Normal } from '../normal';

const errText = Object.freeze([
  'at most specify either argument "mu" or  "prob", but not both at the same time!',
  'both arguments "mu" and "prob" are undefined'
]);



function select(
  fs: 'd' | 'p' | 'r' | 'q',
  mu?: number,
  prob?: number
) {
  const selector = {
    mu: {
      d: dnbinom_mu,
      p: pnbinom_mu,
      q: qnbinom_mu,
      r: rnbinom_mu
    },
    p: {
      d: _dnbinom,
      p: _pnbinom,
      q: _qnbinom,
      r: _rnbinom
    }
  };

  if (prob !== undefined && mu !== undefined) {
    throw new Error(errText[0]);
  }
  if (prob === undefined && mu === undefined) {
    throw new Error(errText[1]);
  }
  const s = prob === undefined ? 'mu' : 'p';
  return selector[s][fs] as any;
}

export function NegativeBinomial(rng: INormal = Normal()) {
  function dnbinom(
    x: number | number[],
    size: number,
    prob?: number,
    mu?: number,
    giveLog =  false
  ): number|number[] {
    const val = mu || prob;
    return select('d', mu, prob)(x, size, val, giveLog);
  }

  function pnbinom(
    q: number | number[],
    size: number,
    prob?: number,
    mu?: number,
    lowerTail = true,
    logP = false
  ): number | number[] {
    const val = mu || prob;
    return select('p', mu, prob)(q, size, val, lowerTail, logP);
  }

  function qnbinom(
    q: number | number[],
    size: number,
    prob?: number,
    mu?: number,
    lowerTail = true,
    logP = false
  ): number | number[] {
    const val = mu || prob;
    return select('q', mu, prob)(q, size, val, lowerTail, logP);
  }

  function rnbinom(
    n: number,
    size: number,
    prob?: number,
    mu?: number
  ): number | number[] {
    const val = mu || prob;
    return select('q', mu, prob)(n, size, val, rng);
  }

  return {
    dnbinom,
    pnbinom,
    qnbinom,
    rnbinom
  };
}
