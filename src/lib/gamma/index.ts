/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';

import { dgamma as _dgamma } from './dgamma';
import { pgamma as _pgamma } from './pgamma';
import { qgamma as _qgamma } from './qgamma';
import { rgamma as _rgamma } from './rgamma';

//aux
import { Inversion, IRNGNormal } from '../rng/normal';

//special
import { multiplexer } from '../r-func';
import { gammafn } from './gamma_fn';
import { lgammafn } from './lgamma_fn';
import {
  digamma,
  pentagamma,
  psigamma,
  tetragamma,
  trigamma
} from './polygamma';

export const special = {
  digamma,
  gamma: gammafn,
  lgamma: lgammafn,
  pentagamma,
  psigamma,
  tetragamma,
  trigamma
};

const { abs } = Math;

export function Gamma(norm: IRNGNormal = new Inversion()) {
  const printer_n = debug('gamma_normalize_params');

  function gammaNormalizeParams(
    rate?: number,
    scale?: number
  ): number | undefined {
    //B: if scale and rate are undefined then _scale = 1
    //C: if scale and rate are both defined and scale != 1/rate, return undefined
    //D: if scale is defined and rate is not , use scale
    //E: if rate is defined and scale is not then use 1/rate

    //B
    if (scale === undefined && rate === undefined) {
      return 1;
    }

    //C
    if (scale !== undefined && rate !== undefined) {
      if (abs(scale * rate - 1) >= 1e-16) {
        printer_n('Both scale:%d and rate:%d are defined but scale <> 1/rate');
        return undefined;
      }
      return scale;
    }

    //D
    if (scale !== undefined && rate === undefined) {
      return scale;
    }

    //E
    if (scale === undefined && rate !== undefined) {
      return 1 / rate;
    }

    throw new Error('unreachable code, you cant be here!');
  }

  const printer_d = debug('dgamma');

  function dgamma(
    x: number | number[],
    shape: number,
    rate?: number,
    scale?: number,
    asLog = false
  ) {
    // scenarios
    let _scale = gammaNormalizeParams(rate, scale);
    if (_scale !== undefined) {
      return _dgamma(x, shape, _scale, asLog);
    }
    printer_d('Cannot normalize to [scale]');
    return multiplexer(x)(() => NaN);
  }

  const printer_p = debug('pgamma');
  function pgamma(
    q: number | number[],
    shape: number,
    rate?: number,
    scale?: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ) {
    // scenarios
    let _scale = gammaNormalizeParams(rate, scale);
    if (_scale !== undefined) {
      return _pgamma(q, shape, _scale, lowerTail, logP);
    }
    printer_p('Cannot normalize to [scale]');
    return multiplexer(q)(() => NaN);
  }

  const printer_q = debug('qgamma');

  function qgamma(
    q: number | number[],
    shape: number,
    rate?: number,
    scale?: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ) {
    // scenarios
    let _scale = gammaNormalizeParams(rate, scale);
    if (_scale !== undefined) {
      return _qgamma(q, shape, _scale, lowerTail, logP);
    }
    printer_q('Cannot normalize to [scale]');
    return multiplexer(q)(() => NaN);
  }

  const printer_r = debug('rgamma');
  function rgamma(n: number, shape: number, rate?: number, scale?: number) {
    let _scale = gammaNormalizeParams(rate, scale);
    if (_scale !== undefined) {
      return _rgamma(n, shape, _scale, norm);
    }
    printer_r('Cannot normalize to [scale]');
  }

  return Object.freeze({
    dgamma,
    pgamma,
    qgamma,
    rgamma
  });
}
