'use strict';
/* This is a conversion from libRmath.so to Typescript/Javascript
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

import { M_LN_SQRT_2PI, trunc, log } from '@lib/r-func';
import { lgammafn_sign } from '@special/gamma/lgammafn_sign';

const sferr_halves = new Float64Array([
    0.0, // n=0 - wrong, place holder only
    0.1534264097200273611245, // 0.5
    0.08106146679532726, // 1.0
    0.054814121051917653896139, // 1.5
    0.0413406959554092940938221, // 2.0
    0.03316287351993628748511048, // 2.5
    0.02767792568499833914878929, // 3.0
    0.0237461636562974959713292, // 3.5
    0.02079067210376509311152277, // 4.0
    0.01848845053267318523077934, // 4.5
    0.01664469118982119216319487, // 5.0
    0.01513497322191737887351255, // 5.5
    0.01387612882307074799874573, // 6.0
    0.01281046524292022692424986, // 6.5
    0.01189670994589177009505572, // 7.0
    0.01110455975820691732662991, // 7.5
    0.010411265261972096497478567, // 8.0
    0.009799416126158803298389475, // 8.5
    0.009255462182712732917728637, // 9.0
    0.008768700134139385462952823, // 9.5
    0.008330563433362871256469318, // 10.0
    0.0079341145643140205472481, // 10.5
    0.007573675487951840794972024, // 11.0
    0.007244554301320383179543912, // 11.5
    0.006942840107209529865664152, // 12.0
    0.006665247032707682442354394, // 12.5
    0.006408994188004207068439631, // 13.0
    0.006171712263039457647532867, // 13.5
    0.005951370112758847735624416, // 14.0
    0.005746216513010115682023589, // 14.5
    0.00555473355196280137103869, // 15.0
]);

const S0 = 0.08333333333333333; // 1/12
const S1 = 0.002777777777777778; // 1/360
const S2 = 0.0007936507936507937; // 1/1260
const S3 = 0.0005952380952380953; // 1/1680
const S4 = 0.0008417508417508417; // 1/1188

// stirlerr(n) = log(n!) - log( sqrt(2*pi*n)*(n/e)^n )
//              = log Gamma(n+1) - 1/2 * [log(2*pi) + log(n)] - n*[log(n) - 1]
//             = log Gamma(n+1) - (n + 1/2) * log(n) + n - log(2*pi)/2
//
// see also lgammacor() in ./lgammacor.c  which computes almost the same!
//

export function stirlerr(n: number): number {
    //  error for 0, 0.5, 1.0, 1.5, ..., 14.5, 15.0.
    let nn: number;

    if (n <= 15.0) {
        nn = n + n;
        if (nn === trunc(nn)) return sferr_halves[trunc(nn)];
        return lgammafn_sign(n + 1) - (n + 0.5) * log(n) + n - M_LN_SQRT_2PI;
    }

    nn = n * n;
    if (n > 500) return (S0 - S1 / nn) / n;
    if (n > 80) return (S0 - (S1 - S2 / nn) / nn) / n;
    if (n > 35) return (S0 - (S1 - (S2 - S3 / nn) / nn) / nn) / n;
    // 15 < n <= 35 :
    return (S0 - (S1 - (S2 - (S3 - S4 / nn) / nn) / nn) / nn) / n;
}
