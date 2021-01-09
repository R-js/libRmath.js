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

import { debug } from 'debug';

import { dgamma as _dgamma } from './dgamma';
import { pgamma as _pgamma } from './pgamma';
import { qgamma as _qgamma } from './qgamma';
import { rgammaOne as _rgammaOne } from './rgamma';

//aux
import { Inversion, IRNGNormal } from '../rng/normal';

//special
import { gammafn } from './gamma_fn';
import { lgammafn_sign as lgammafn } from './lgammafn_sign';
import { digamma, pentagamma, psigamma, tetragamma, trigamma } from './polygamma';

export default {
    digamma,
    gamma: gammafn,
    lgamma: lgammafn,
    pentagamma,
    psigamma,
    tetragamma,
    trigamma,
};

import { randomGenHelper } from '../../r-func';

const { abs } = Math;

export function Gamma(norm: IRNGNormal = new Inversion()) {
    const printer_n = debug('gamma_normalize_params');

    function gammaNormalizeParams(rate?: number, scale?: number): number | undefined {
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

    function dgamma(x: number, shape: number, rate?: number, scale?: number, asLog = false) {
        // scenarios
        const _scale = gammaNormalizeParams(rate, scale);
        if (_scale !== undefined) {
            return _dgamma(x, shape, _scale, asLog);
        }
        printer_d('Cannot normalize to [scale]');
        return NaN;
    }

    const printer_p = debug('pgamma');
    function pgamma(q: number, shape: number, rate?: number, scale?: number, lowerTail = true, logP = false) {
        // scenarios
        const _scale = gammaNormalizeParams(rate, scale);
        if (_scale !== undefined) {
            return _pgamma(q, shape, _scale, lowerTail, logP);
        }
        printer_p('Cannot normalize to [scale]');
        return NaN;
    }

    const printer_q = debug('qgamma');

    function qgamma(q: number, shape: number, rate?: number, scale?: number, lowerTail = true, logP = false) {
        // scenarios
        const _scale = gammaNormalizeParams(rate, scale);
        if (_scale !== undefined) {
            return _qgamma(q, shape, _scale, lowerTail, logP);
        }
        printer_q('Cannot normalize to [scale]');
        return NaN;
    }

    const printer_rgamma = debug('rgammaOne');

    function rgamma(n: number | number[], shape: number, rate?: number, scale?: number): number[] {
        return randomGenHelper(n, rgammaOne, shape, rate, scale);
    }

    function rgammaOne(shape: number, rate?: number, scale?: number): number {
        const _scale = gammaNormalizeParams(rate, scale);
        if (_scale !== undefined) {
            return _rgammaOne(shape, _scale, norm);
        }
        printer_rgamma('Cannot normalize to [scale]');
        return NaN;
    }

    return Object.freeze({
        dgamma,
        pgamma,
        qgamma,
        rgamma,
    });
}
