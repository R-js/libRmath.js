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
import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '@common/logger';
import { lfastchoose } from '@special/choose';
import { R_DT_qIv } from '@distributions/exp/expm1';
import { DBL_EPSILON } from '$constants';

import type { QHyperFunctionMap, CalcQHyper } from './';

const printer_qhyper = debug('qhyper');

const _d = new Float64Array(7);
const ixr = 0;
const isum = 1;
const ixb = 2;
const iterm = 3;
const iNR = 4;
const iNB = 5;

let accelerateTinyN: CalcQHyper | undefined;
let accelerateBigN: CalcQHyper | undefined;

export function registerBackend(fns: QHyperFunctionMap): void {
    accelerateTinyN = fns.calcTinyN;
    accelerateBigN = fns.calcBigN;
}

export function unRegisterBackend() : boolean {
    const previous = !!accelerateTinyN && !!accelerateBigN;
    
    accelerateTinyN = undefined;
    accelerateBigN = undefined;

    return previous;
}

export function qhyper(
    p: number,
    nr: number,
    nb: number,
    n: number,
    lowerTail = true,
    logP = false
): number {
    /* This is basically the same code as  ./phyper.c  *used* to be --> FIXME! */
    //let N;
    //let xstart;
    //let xend;
    //let xr;
    //let xb;
    //let sum;
    //let term;
    //let small_N;

    if (isNaN(p) || isNaN(nr) || isNaN(nb) || isNaN(n)) {
        return NaN;
    }

    if (!isFinite(p) || !isFinite(nr) || !isFinite(nb) || !isFinite(n)) {
        return ML_ERR_return_NAN(printer_qhyper);
    }

    _d[iNR] = Math.round(nr);
    _d[iNB] = Math.round(nb);

    const N = _d[iNR] + _d[iNB];

    n = Math.round(n);
    if (_d[iNR] < 0 || _d[iNB] < 0 || n < 0 || n > N) return ML_ERR_return_NAN(printer_qhyper);

    /* Goal:  Find  xr (= #{red balls in sample}) such that
     *   phyper(xr,  NR,NB, n) >= p > phyper(xr - 1,  NR,NB, n)
     */

    const xstart = Math.max(0, n - _d[iNB]);
    const xend = Math.min(n, _d[iNR]);

    const rc = R_Q_P01_boundaries(lowerTail, logP, p, xstart, xend);
    if (rc !== undefined) {
        return rc;
    }
    _d[ixr] = xstart;
    _d[ixb] = n - _d[ixr]; /* always ( = #{black balls in sample} ) */

    const small_N = N < 1000; /* won't have underflow in product below */
    /* if N is small,  term := product.ratio( bin.coef );
       otherwise work with its logarithm to protect against underflow */
    _d[iterm] =
        lfastchoose(_d[iNR], _d[ixr])
        +
        lfastchoose(_d[iNB], _d[ixb])
        -
        lfastchoose(N, n);
    if (small_N) _d[iterm] = Math.exp(_d[iterm]);
    _d[iNR] -= _d[ixr];
    _d[iNB] -= _d[ixb];

    if (!lowerTail || logP) {
        p = R_DT_qIv(lowerTail, logP, p);
    }
    p *= 1 - 1000 * DBL_EPSILON; /* was 64, but failed on FreeBSD sometimes */
    _d[isum] = small_N ? _d[iterm] : Math.exp(_d[iterm]);
    /*
        let lc = 0;
        const log = (x: number) => {
            lc++;
            return Math.log(x);
        }
    
        let ec = 0;
        const exp = (x: number) => {
            ec++;
            return Math.exp(x);
        }
    */
    // for speed, removed if (small_N) out of the while loop
    if (small_N) {
        if (accelerateTinyN) {
            console.log('wasm'); // debug, flag its use
            _d[ixr] = accelerateTinyN(
                _d[isum],
                _d[iterm],
                p,
                _d[ixr],
                xend,
                _d[ixb],
                _d[iNB],
                _d[iNR]
            );
        }
        else {
            while (_d[isum] < p && _d[ixr] < xend) {
                //xr++ 
                _d[ixr]++;
                
                _d[iNB]++;
                _d[iterm] *= (_d[iNR] / _d[ixr]) * (_d[ixb] / _d[iNB]);
                _d[isum] += _d[iterm];
                _d[ixb]--;
                _d[iNR]--;
            }
        }
    }
    else {
        if (accelerateBigN) {
            console.log('wasm');
            _d[ixr] = accelerateBigN(
                _d[isum],
                _d[iterm],
                p,
                _d[ixr],
                xend,
                _d[ixb],
                _d[iNB],
                _d[iNR]
            );
        }
        else {
            while (_d[isum] < p && _d[ixr] < xend) {
                _d[ixr]++;
                _d[iNB]++;
                _d[iterm] += Math.log((_d[iNR] / _d[ixr]) * (_d[ixb] / _d[iNB]));
                _d[isum] += Math.exp(_d[iterm]);
                _d[ixb]--;
                _d[iNR]--;
            }
        }
    }

    //    console.log({ lc, ec });
    return _d[ixr];

}

