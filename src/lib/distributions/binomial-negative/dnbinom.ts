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

import { ML_ERR_return_NAN, } from '@common/logger';
import { R_D__0, R_D__1, R_D_exp, R_D_nonint_check } from '$constants';
import { dbinom_raw } from '@dist/binomial/dbinom';
import { lgammafn_sign } from '@special/gamma/lgammafn_sign';

const printer = debug('dnbinom');

export function dnbinom(x: number, size: number, prob: number, give_log: boolean): number {

    let ans: number;
    let p: number;

    if (isNaN(x) || isNaN(size) || isNaN(prob)) {
        return x + size + prob;
    }

    if (prob <= 0 || prob > 1 || size < 0) {
        return ML_ERR_return_NAN(printer);
    }

    const rc = R_D_nonint_check(give_log, x, printer);
    if (rc !== undefined) {
        return rc;
    }

    if (x < 0 || !isFinite(x)) {
        return R_D__0(give_log);
    }
    /* limiting case as size approaches zero is point mass at zero */
    if (x === 0 && size === 0) {
        return R_D__1(give_log);
    }

    x = Math.round(x);

    ans = dbinom_raw(size, x + size, prob, 1 - prob, give_log);

    p = size / (size + x);

    return give_log ? Math.log(p) + ans : p * ans;
}

const printer_dnbinom_mu = debug('dnbinom_mu');

export function dnbinom_mu(x: number, size: number, mu: number, give_log: boolean): number {


    /* originally, just set  prob :=  size / (size + mu)  and called dbinom_raw(),
     * but that suffers from cancellation when   mu << size  */
    let ans: number;
    let p: number;

    if (isNaN(x) || isNaN(size) || isNaN(mu)) {
        return x + size + mu;
    }

    if (mu < 0 || size < 0) {
        return ML_ERR_return_NAN(printer_dnbinom_mu);
    }

    const rc = R_D_nonint_check(give_log, x, printer_dnbinom_mu);
    if (rc !== undefined) {
        return rc;
    }

    if (x < 0 || !isFinite(x)) {
        return R_D__0(give_log);
    }

    /* limiting case as size approaches zero is point mass at zero,
     * even if mu is kept constant. limit distribution does not
     * have mean mu, though.
     */
    if (x === 0 && size === 0) {
        return R_D__1(give_log);
    }

    x = Math.round(x);
    if (x === 0) {
        /* be accurate, both for n << mu, and n >> mu :*/
        // old code   size * (size < mu ? Math.log(size / (size + mu)) : Math.log1p(- mu / (size + mu))));
        let llogx: number;
        if (size < mu) {
            llogx = Math.log(size / (size + mu));
        } else {
            llogx = Math.log1p(-mu / (size + mu));
        }
        return R_D_exp(give_log, size * llogx);
    }
    if (x < 1e-10 * size) {
        /* don't use dbinom_raw() but MM's formula: */
        /* FIXME --- 1e-8 shows problem; rather use algdiv() from ./toms708.c */
        p = size < mu ? Math.log(size / (1 + size / mu)) : Math.log(mu / (1 + mu / size));
        return R_D_exp(give_log, x * p - mu - lgammafn_sign(x + 1) + Math.log1p((x * (x - 1)) / (2 * size)));
    }

    /* else: no unnecessary cancellation inside dbinom_raw, when
     * x_ = size and n_ = x+size are so close that n_ - x_ loses accuracy
     */

    ans = dbinom_raw(size, x + size, size / (size + mu), mu / (size + mu), give_log);
    p = size / (size + x);

    return give_log ? Math.log(p) + ans : p * ans;

}
