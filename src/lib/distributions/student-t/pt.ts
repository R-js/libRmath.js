'use strict';

import lbeta from '@special/beta/lbeta';
import { pbeta } from '@dist/beta/pbeta';
import { M_LN2, R_D_Cval, log, log1p, exp, abs } from '@lib/r-func';
import { pnorm5 as pnorm } from '@dist/normal/pnorm';


export function pt(x: number, n: number, lower_tail: boolean, log_p: boolean): number {
    /* return  P[ T <= x ]	where
     * T ~ t_{n}  (t distrib. with n degrees of freedom).
    
     *	--> ./pnt.c for NON-central
     */
    let val;
    //let nx;

    if (!isFinite(n)) {
        return pnorm(x, 0.0, 1.0, lower_tail, log_p);
    }

/*
Note: fidelity is higher if we omit the #ifdef condition below (look in the unit test for df > 4e5)

#ifdef R_version_le_260
     if (n > 4e5) {
        //-- Fixme(?): test should depend on `n' AND `x' ! 
        // Approx. from	 Abramowitz & Stegun 26.7.8 (p.949) 
        val = 1 / (4 * n);
        return pnorm((x * (1 - val)) / sqrt(1 + x * x * 2 * val), 0.0, 1.0, lower_tail, log_p);
    }
#endif 
*/   
/*
example
 1+(x/df)*x > 1e100
 x/df*x > 1e100 -1
 x*x/df > 1e100
 x*x > 1e100*df

 -sqrt(1e100)*df  >  x > sqrt(1e100*df)

 choose df = 15
 then |x| > 3.873E+50
*/

    const nx = 1 + (x / n) * x;
    /* FIXME: This test is probably losing rather than gaining precision,
     * now that pbeta(*, log_p = TRUE) is much better.
     * Note however that a version of this test *is* needed for x*x > D_MAX */
    if (nx > 1e100) {
        /* <==>  x*x > 1e100 * n  */
        /* Danger of underflow. So use Abramowitz & Stegun 26.5.4
           pbeta(z, a, b) ~ z^a(1-z)^b / aB(a,b) ~ z^a / aB(a,b),
           with z = 1/nx,  a = n/2,  b= 1/2 :
        */
        //let lval;
        const lb = lbeta(0.5 * n, 0.5)
        const l05n = log(0.5* n);
        const labsx = log(abs(x));
        const logn = log(n);

        const lval = -0.5 * n * (2 * labsx - logn) - lb - l05n;
        val = log_p ? lval : exp(lval);
    } else {
        val =
            (n > x * x)
                ? pbeta(x * x / (n + x * x), 0.5, n / 2, /*lower_tail*/ false, log_p)
                : pbeta(1 / nx, n / 2, 0.5, /*lower_tail*/ true, log_p);
    }

    /* Use "1 - v"  if	lower_tail  and	 x > 0 (but not both):*/
    if (x <= 0) {
        lower_tail = !lower_tail;
    }

    if (log_p) {
        if (lower_tail) {
            return log1p(-0.5 * exp(val));
        } else {
            return val - M_LN2; /* = log(.5* pbeta(....)) */
        }
    } else {
        val /= 2;
        return R_D_Cval(lower_tail, val);
    }
}
