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
import type { IRNGNormal } from '@rng/normal/normal-rng';
import { globalNorm } from '@rng/globalRNG';
import { dnbinom as _dnb, dnbinom_mu } from './dnbinom';
import { pnbinom as _pnb , pnbinom_mu } from './pnbinom';
import { qnbinom as _qnb, qnbinom_mu } from './qnbinom';
import { rnbinomOne, rnbinom_muOne } from './rnbinom';
import { repeatedCall } from '$helper';

const errText = [
  'at most specify either argument "mu" or  "prob", but not both at the same time!',
  'both arguments "mu" and "prob" are undefined'
];

interface dnbmu {
  d: typeof dnbinom_mu,
  p: typeof pnbinom_mu,
  q: typeof qnbinom_mu,
  r: typeof rnbinom_muOne
}

interface p {
  d: typeof _dnb,
  p: typeof _pnb,
  q: typeof _qnb,
  r: typeof rnbinomOne
}

interface sel {
  mu: dnbmu,
  p:p
}

const selector:sel = {
  mu: {
    d: dnbinom_mu,
    p: pnbinom_mu,
    q: qnbinom_mu,
    r: rnbinom_muOne
  },
  p: {
    d: _dnb,
    p: _pnb,
    q: _qnb,
    r: rnbinomOne
  }
};

function select<F extends keyof p & keyof dnbmu>(
  fs: F,
  mu?: number,
  prob?: number
) {
  
  if (prob !== undefined && mu !== undefined) {
    throw new Error(errText[0]);
  }
  if (prob === undefined && mu === undefined) {
    throw new Error(errText[1]);
  }
  const s: keyof sel = prob === undefined ? 'mu' : 'p';
  const ss = selector[s];
  const fn = ss[fs];
  return fn;
}


export function dnbinom(
  x: number,
  size: number,
  prob?: number,
  mu?: number,
  giveLog = false
): number {
  const val: number = (mu || prob) as number;
  const fn = select('d', mu, prob);
  return fn(x, size, val, giveLog);
}

export function pnbinom(
  q: number,
  size: number,
  prob?: number,
  mu?: number,
  lowerTail = true,
  logP = false
): number  {
  const val = (mu || prob) as number;
  const fn = select('p', mu, prob);
  return fn(q, size, val, lowerTail, logP);
}

export function qnbinom(
  q: number,
  size: number,
  prob?: number,
  mu?: number,
  lowerTail = true,
  logP = false
): number {
  const val = (mu || prob) as number;
  const fn = select('q', mu, prob);
  return fn(q, size, val, lowerTail, logP);
}

export function rnbinom(
  n: number,
  size: number,
  prob?: number,
  mu?: number,
  rng: IRNGNormal = globalNorm()
): Float32Array {
  const val = (mu || prob) as number;
  const fn = select('r', mu, prob);
  return repeatedCall(n, fn, size, val, rng);
}

