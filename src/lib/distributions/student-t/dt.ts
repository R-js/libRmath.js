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
import { debug } from 'debug';

import { 
    ML_ERR_return_NAN, 
} from '@common/logger';

import {
    M_1_SQRT_2PI, 
    M_LN_SQRT_2PI,
    R_D__0 
} from '$constants'

import { bd0 } from '$deviance';
import { dnorm } from '@dist/normal';
import { stirlerr } from '$stirling';

const printer_dt = debug('dt');
export function dt(x: number, n: number, giveLog = false): number {
    if (isNaN(x) || isNaN(n)) {
        return x + n;
    }
    if (n <= 0) {
        return ML_ERR_return_NAN(printer_dt);
    }
    if (!isFinite(x)) {
        return R_D__0(giveLog);
    }
    if (!isFinite(n)) {
        return dnorm(x, 0, 1, giveLog);
    }

    let u: number;
    const t = -bd0(n / 2, (n + 1) / 2) + stirlerr((n + 1) / 2) - stirlerr(n / 2);
    const x2n = (x * x) / n;
    // in  [0, Inf]
    let ax = 0; // <- -Wpedantic
    let l_x2n; // := log(sqrt(1 + x2n)) = log(1 + x2n)/2
    const lrg_x2n: boolean = x2n > 1 / Number.EPSILON;
    if (lrg_x2n) {
        // large x^2/n :
        ax = Math.abs(x);
        l_x2n = Math.log(ax) - Math.log(n) / 2; // = log(x2n)/2 = 1/2 * log(x^2 / n)
        u = n * l_x2n; //  log(1 + x2n) * n/2 =  n * log(1 + x2n)/2 =
    } else if (x2n > 0.2) {
        l_x2n = Math.log(1 + x2n) / 2;
        u = n * l_x2n;
    } else {
        l_x2n = Math.log1p(x2n) / 2;
        u = -bd0(n / 2, (n + x * x) / 2) + (x * x) / 2;
    }

    //old: return  R_D_fexp(M_2PI*(1+x2n), t-u);

    // R_D_fexp(f,x) :=  (give_log ? -0.5*log(f)+(x) : Math.exp(x)/sqrt(f))
    // f = 2pi*(1+x2n)
    //  ==> 0.5*log(f) = log(2pi)/2 + log(1+x2n)/2 = log(2pi)/2 + l_x2n
    //	     1/sqrt(f) = 1/sqrt(2pi * (1+ x^2 / n))
    //		       = 1/sqrt(2pi)/(|x|/sqrt(n)*sqrt(1+1/x2n))
    //		       = M_1_SQRT_2PI * sqrt(n)/ (|x|*sqrt(1+1/x2n))
    if (giveLog) return t - u - (M_LN_SQRT_2PI + l_x2n);

    // else :  if(lrg_x2n) : sqrt(1 + 1/x2n) ='= sqrt(1) = 1
    const I_sqrt_ = lrg_x2n ? Math.sqrt(n) / ax : Math.exp(-l_x2n);
    return Math.exp(t - u) * M_1_SQRT_2PI * I_sqrt_;
}
