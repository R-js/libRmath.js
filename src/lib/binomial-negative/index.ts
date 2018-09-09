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
import { dnbinom as _dnbinom, dnbinom_mu } from './dnbinom';
import { pnbinom as _pnbinom, pnbinom_mu } from './pnbinom';
import { qnbinom as _qnbinom, qnbinom_mu } from './qnbinom';
import { rnbinom as _rnbinom, rnbinom_mu } from './rnbinom';

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

export function NegativeBinomial(rng: IRNGNormal = new Inversion()) {
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
    return select('r', mu, prob)(n, size, val, rng);
  }

  return {
    dnbinom,
    pnbinom,
    qnbinom,
    rnbinom
  };
}
