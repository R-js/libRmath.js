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
import { debug } from '@mangos/debug';

import { ML_ERR_return_NAN2, lineInfo4, R_Q_P01_boundaries } from '@common/logger';

import { NumberW } from '@common/toms708/NumberW';
import { R_DT_qIv } from '@dist/exp/expm1';
import { qnorm } from '@dist/normal/qnorm';
import { pbinom } from './pbinom';

const printer_do_search = debug('do_search');

function do_search(y: number, z: NumberW, p: number, n: number, pr: number, incr: number): number {
    if (z.val >= p) {
        /* search to the left */

        printer_do_search('new z=%o >= p = %d  --> search to left (y--) ..', z, p);

        while (true) {
            let newz: number;
            if (y === 0 || (newz = pbinom(y - incr, n, pr, /*l._t.*/ true, /*log_p*/ false)) < p) return y;
            y = Math.max(0, y - incr);
            z.val = newz;
        }
    } else {
        /* search to the right */

        printer_do_search('new z=%d < p = %d  --> search to right (y++) ..', z.val, p);

        while (true) {
            y = Math.min(y + incr, n);
            if (y === n || (z.val = pbinom(y, n, pr, /*l._t.*/ true, /*log_p*/ false)) >= p) return y;
        }
    }
}

const printer_qbinom = debug('qbinom');

export function qbinom(p: number, size: number, pr: number, lower_tail = true, log_p = false): number {

    const z = new NumberW(0);
    let y: number;

    if (isNaN(p) || isNaN(size) || isNaN(pr)) return NaN;

    if (!isFinite(size) || !isFinite(pr)) {
        return ML_ERR_return_NAN2(printer_qbinom, lineInfo4);
    }
    /* if log_p is true, p = -Inf is a legitimate value */
    if (!isFinite(p) && !log_p) {
        return ML_ERR_return_NAN2(printer_qbinom, lineInfo4);
    }

    if (!Number.isInteger(size)) {
        return ML_ERR_return_NAN2(printer_qbinom, lineInfo4);
    }

    if (pr < 0 || pr > 1 || size < 0) {
        return ML_ERR_return_NAN2(printer_qbinom, lineInfo4);
    }

    const rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, size);
    if (rc !== undefined) {
        return rc;
    }

    //edge cases

    if (pr === 0 || size === 0) return 0;

    const q = 1 - pr;
    if (q === 0) return size; /* covers the full range of the distribution */

    const mu = size * pr; //mean
    const sigma = Math.sqrt(size * pr * q); //standard deviation

    const gamma = (q - pr) / sigma; // = (  (1 - pr)-pr )/sd = (1 - 2pr)/sd

    printer_qbinom(
        'qbinom(p=%d, n=%d, pr=%d, l.t.=%s, log=%s): sigm=%d, gam=%d',
        p,
        size,
        pr,
        lower_tail,
        log_p,
        sigma,
        gamma,
    );

    /* Note : "same" code in qpois.c, qbinom.c, qnbinom.c --
     * FIXME: This is far from optimal [cancellation for p ~= 1, etc]: */
    if (!lower_tail || log_p) {
        p = R_DT_qIv(lower_tail, log_p, p); /* need check again (cancellation!): */
        if (p === 0) return 0; // will never happen
        if (p === 1) return size; // will never happen
    }
    /* temporary hack --- FIXME --- */
    //if (p + 1.01 * Number.EPSILON >= 1.) return size;
    if ((1-p) < Number.EPSILON) {
        return size;
    }

    /* y := approx.value (Cornish-Fisher expansion) :  */
    z.val = qnorm(p, 0, 1, /*lower_tail*/ true, /*log_p*/ false);
    y = Math.floor(mu + sigma * (z.val + (gamma * (z.val * z.val - 1)) / 6) + 0.5);

    if (y > size) {
        /* way off */ y = size;
    }

    printer_qbinom('new (p,1-p)=(%d,%d), z=qnorm(..)=%d, y=%d, size=%d', p, 1 - p, z.val, y, size);

    z.val = pbinom(y, size, pr, /*lower_tail*/ true, /*log_p*/ false);

    /* fuzz to ensure left continuity: */
    p *= 1 - 64 * Number.EPSILON;

    if (size < 1e5) {
        return do_search(y, z, p, size, pr, 1);
    }
    /* Otherwise be a bit cleverer in the search */

    let incr = Math.floor(size * 0.001);
    let oldincr;
    do {
        oldincr = incr;
        y = do_search(y, z, p, size, pr, incr);
        incr = Math.max(1, Math.floor(incr / 100));
    } while (oldincr > 1 && incr > size * 1e-15);
    return y;
}
