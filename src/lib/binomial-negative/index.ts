import { dnbinom as _dnbinom, dnbinom_mu } from './dnbinom';
import { pnbinom as _pnbinom, pnbinom_mu } from './pnbinom';
import { qnbinom as _qnbinom, qnbinom_mu } from './qnbinom';
import { rnbinom as _rnbinom, rnbinom_mu } from './rnbinom';

import { INormal, Normal } from '../normal';

const errText = Object.freeze([
  'at most specify either argument "mu" or  "prob", but not both at the same time!',
  'both arguments "mu" and "prob" are undefined'
]);

export function NegativeBinomial(rng: INormal = Normal()) {
  function dnbinom(
    x: number | number[],
    size: number,
    prob?: number,
    mu?: number,
    giveLog: boolean = false
  ) {
    if (prob !== undefined && mu !== undefined) {
      throw new Error(errText[0]);
    }
    if (mu !== undefined) {
      return dnbinom_mu(x, size, mu, giveLog);
    }
    if (prob !== undefined) {
      return _dnbinom(x, size, prob, giveLog);
    }
    throw new Error(errText[1]);
  }

  function pnbinom(
    q: number | number[],
    size: number,
    prob?: number,
    mu?: number,
    lowerTail: boolean = true,
    logP = false
  ) {
    if (prob !== undefined && mu !== undefined) {
      throw new Error(errText[0]);
    }
    if (mu !== undefined) {
      return pnbinom_mu(q, size, mu, lowerTail, logP);
    }
    if (prob !== undefined) {
      return _pnbinom(q, size, prob, lowerTail, logP);
    }
    throw new Error(errText[1]);
  }

  function qnbinom(
    q: number | number[],
    size: number,
    prob?: number,
    mu?: number,
    lowerTail: boolean = true,
    logP = false
  ) {
    if (prob !== undefined && mu !== undefined) {
      throw new Error(errText[0]);
    }
    if (mu !== undefined) {
      return qnbinom_mu(q, size, mu, lowerTail, logP, rng);
    }
    if (prob !== undefined) {
      return _qnbinom(q, size, prob, lowerTail, logP, rng);
    }
    throw new Error(errText[1]);
  }

  function rnbinom(n: number, size: number, prob?: number, mu?: number): number|number[] {
    if (prob !== undefined && mu !== undefined) {
        throw new Error(errText[0]);
      }
      if (mu !== undefined) {
        return rnbinom_mu(n, size, mu, rng);
      }
      if (prob !== undefined) {
        return _rnbinom(n, size, prob, rng);
      }
      throw new Error(errText[1]);  
  }

  return {
    dnbinom,
    pnbinom,
    qnbinom,
    rnbinom
  };
}

/*
export function dnbinom<T>(
  xx: T,
  size: number,
  prob: number,
  give_log: boolean
): T

export function pnbinom<T>(
  xx: T,
  size: number,
  prob: number,
  lower_tail: boolean,
  log_p: boolean
): T

export function qnbinom<T>(
  pp: T,
  size: number,
  prob: number,
  lower_tail: boolean,
  log_p: boolean,
  normal: INormal
): T


export function rnbinom(
  n: number,
  size: number,
  prob: number,
  normal: INormal
): number| number[] 

*/
