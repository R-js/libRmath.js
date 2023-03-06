'use strict';

import {
    M_1_SQRT_2PI, 
    M_LN_SQRT_2PI,
    abs,
    log1p,
    log,
    sqrt,
    exp,
    DBL_EPSILON,
} from '@lib/r-func';

import { bd0 } from '@lib/deviance';
import { dnorm } from '@dist/normal';
import { stirlerr } from '@lib/stirling';


export function _dt(x: number, n: number, giveLog = false): number {
    
    if (!isFinite(n)) {
        return dnorm(x, 0, 1, giveLog);
    }

    let u: number;
    const t = -bd0(n / 2, (n + 1) / 2) + stirlerr((n + 1) / 2) - stirlerr(n / 2);
    const x2n = (x * x) / n;
    // in  [0, Inf]
    let ax = 0; // <- -Wpedantic
    let l_x2n; // := log(sqrt(1 + x2n)) = log(1 + x2n)/2
    
    const lrg_x2n = x2n > 1 / DBL_EPSILON;
    
    if (lrg_x2n) {
        // large x^2/n :
        ax = abs(x);
        l_x2n = log(ax) - log(n) / 2; // = log(x2n)/2 = 1/2 * log(x^2 / n)
        u = n * l_x2n; //  log(1 + x2n) * n/2 =  n * log(1 + x2n)/2 =
    } else if (x2n > 0.2) {
        l_x2n = log(1 + x2n) / 2;
        u = n * l_x2n;
    } else {
        l_x2n = log1p(x2n) / 2;
        u = -bd0(n / 2, (n + x * x) / 2) + (x * x) / 2;
    }

    //old: return  R_D_fexp(M_2PI*(1+x2n), t-u);

    // R_D_fexp(f,x) :=  (give_log ? -0.5*log(f)+(x) : exp(x)/sqrt(f))
    // f = 2pi*(1+x2n)
    //  ==> 0.5*log(f) = log(2pi)/2 + log(1+x2n)/2 = log(2pi)/2 + l_x2n
    //	     1/sqrt(f) = 1/sqrt(2pi * (1+ x^2 / n))
    //		       = 1/sqrt(2pi)/(|x|/sqrt(n)*sqrt(1+1/x2n))
    //		       = M_1_SQRT_2PI * sqrt(n)/ (|x|*sqrt(1+1/x2n))
    if (giveLog) return t - u - (M_LN_SQRT_2PI + l_x2n);

    // else :  if(lrg_x2n) : sqrt(1 + 1/x2n) ='= sqrt(1) = 1
    const I_sqrt_ = lrg_x2n ? sqrt(n) / ax : exp(-l_x2n);
    return exp(t - u) * M_1_SQRT_2PI * I_sqrt_;
}
