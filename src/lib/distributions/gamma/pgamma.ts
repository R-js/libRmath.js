import createNs from '@mangos/debug-frontend';
import { ME, mapErrV2 } from '@common/logger';

import { R_D__0, R_D__1, R_D_exp, R_DT_0, R_DT_1, R_P_bounds_01, DBL_MAX_EXP, M_LN2, DBL_MIN } from '@lib/r-func';

import { R_Log1_Exp } from '@dist/exp/expm1';
import { dnorm4 as dnorm } from '@dist/normal/dnorm';
import { pnorm5 as pnorm } from '@dist/normal/pnorm';
import { dpois_raw } from '@dist/poisson/dpois';
import { lgammafn_sign as lgammafn } from '@special/gamma/lgammafn_sign';

const scalefactor = 4294967296.0 ** 8;

/* If |x| > |k| * M_cutoff,  then  log[ exp(-x) * k^x ]	 =~=  -x */
const M_cutoff = (M_LN2 * DBL_MAX_EXP) / Number.EPSILON; /*=3.196577e18*/

/* Continued fraction for calculation of
 *    1/i + x/(i+d) + x^2/(i+2*d) + x^3/(i+3*d) + ... = sum_{k=0}^Inf x^k/(i+k*d)
 *
 * auxilary in log1pmx() and lgamma1p()
 */
function logcf(x: number, i: number, d: number, eps: number /* ~ relative tolerance */) {
    let c1 = 2 * d;
    let c2 = i + d;
    let c4 = c2 + d;
    let a1 = c2;
    let b1 = i * (c2 - i * x);
    let b2 = d * d * x;
    let a2 = c4 * c2 - b2;
    /*
  #if 0
      assert (i > 0);
      assert (d >= 0);
  #endif
  */
    b2 = c4 * b1 - i * b2;

    while (Math.abs(a2 * b1 - a1 * b2) > Math.abs(eps * b1 * b2)) {
        let c3 = c2 * c2 * x;
        c2 += d;
        c4 += d;
        a1 = c4 * a2 - c3 * a1;
        b1 = c4 * b2 - c3 * b1;

        c3 = c1 * c1 * x;
        c1 += d;
        c4 += d;
        a2 = c4 * a1 - c3 * a2;
        b2 = c4 * b1 - c3 * b2;

        if (Math.abs(b2) > scalefactor) {
            a1 /= scalefactor;
            b1 /= scalefactor;
            a2 /= scalefactor;
            b2 /= scalefactor;
        } else if (Math.abs(b2) < 1 / scalefactor) {
            a1 *= scalefactor;
            b1 *= scalefactor;
            a2 *= scalefactor;
            b2 *= scalefactor;
        }
    }

    return a2 / b2;
}

/* Accurate calculation of log(1+x)-x, particularly for small x.  */
function log1pmx(x: number) {
    const minLog1Value = -0.79149064;

    if (x > 1 || x < minLog1Value) return Math.log1p(x) - x;
    else {
        /* -.791 <=  x <= 1  -- expand in  [x/(2+x)]^2 =: y :
         * log(1+x) - x =  x/(2+x) * [ 2 * y * S(y) - x],  with
         * ---------------------------------------------
         * S(y) = 1/3 + y/5 + y^2/7 + ... = \sum_{k=0}^\infty  y^k / (2k + 3)
         */
        const r = x / (2 + x);
        const y = r * r;
        if (Math.abs(x) < 1e-2) {
            const two = 2;
            return r * (((((two / 9) * y + two / 7) * y + two / 5) * y + two / 3) * y - x);
        } else {
            const tol_logcf = 1e-14;
            return r * (2 * y * logcf(y, 3, 2, tol_logcf) - x);
        }
    }
}

const coeffs = new Float64Array([
    0.3224670334241132182362075833230126 /* = (zeta(2)-1)/2 */,
    0.6735230105319809513324605383715e-1 /* = (zeta(3)-1)/3 */, 0.2058080842778454787900092413529198e-1,
    0.7385551028673985266273097291406834e-2, 0.2890510330741523285752988298486755e-2,
    0.1192753911703260977113935692828109e-2, 0.5096695247430424223356548135815582e-3,
    0.2231547584535793797614188036013401e-3, 0.994575127818085337145958900319017e-4,
    0.4492623673813314170020750240635786e-4, 0.2050721277567069155316650397830591e-4,
    0.9439488275268395903987425104415055e-5, 0.4374866789907487804181793223952411e-5,
    0.2039215753801366236781900709670839e-5, 0.9551412130407419832857179772951265e-6,
    0.4492469198764566043294290331193655e-6, 0.2120718480555466586923135901077628e-6,
    0.1004322482396809960872083050053344e-6, 0.476981016936398056576019341724673e-7,
    0.2271109460894316491031998116062124e-7, 0.1083865921489695409107491757968159e-7,
    0.5183475041970046655121248647057669e-8, 0.2483674543802478317185008663991718e-8,
    0.119214014058609120744254820277464e-8, 0.5731367241678862013330194857961011e-9,
    0.2759522885124233145178149692816341e-9, 0.1330476437424448948149715720858008e-9,
    0.6422964563838100022082448087644648e-10, 0.3104424774732227276239215783404066e-10,
    0.1502138408075414217093301048780668e-10, 0.7275974480239079662504549924814047e-11,
    0.3527742476575915083615072228655483e-11, 0.1711991790559617908601084114443031e-11,
    0.8315385841420284819798357793954418e-12, 0.4042200525289440065536008957032895e-12,
    0.1966475631096616490411045679010286e-12, 0.9573630387838555763782200936508615e-13,
    0.4664076026428374224576492565974577e-13, 0.2273736960065972320633279596737272e-13,
    0.1109139947083452201658320007192334e-13 /* = (zeta(40+1)-1)/(40+1) */
]);

/* Compute  log(gamma(a+1))  accurately also for small a (0 < a < 0.5). */
export function lgamma1p(a: number): number {
    const eulers_const = 0.5772156649015328606065120900824024;

    /* coeffs[i] holds (zeta(i+2)-1)/(i+2) , i = 0:(N-1), N = 40 : */
    const N = 40;

    const c = 0.2273736845824652515226821577978691e-12; /* zeta(N+2)-1 */
    const tol_logcf = 1e-14;
    let lgam;
    let i;

    if (Math.abs(a) >= 0.5) return lgammafn(a + 1);

    /* Abramowitz & Stegun 6.1.33 : for |x| < 2,
     * <==> Math.log(gamma(1+x)) = -(log(1+x) - x) - gamma*x + x^2 * \sum_{n=0}^\infty c_n (-x)^n
     * where c_n := (Zeta(n+2) - 1)/(n+2)  = coeffs[n]
     *
     * Here, another convergence acceleration trick is used to compute
     * lgam(x) :=  sum_{n=0..Inf} c_n (-x)^n
     */
    lgam = c * logcf(-a / 2, N + 2, 1, tol_logcf);
    for (i = N - 1; i >= 0; i--) lgam = coeffs[i] - a * lgam;

    return (a * lgam - eulers_const) * a - log1pmx(a);
} /* lgamma1p */

/*
 * Compute the; log of a sum from logs of terms, i.e.,
 *
 *     log (sum_i  exp (logx[i]) ) =
 *     log (e ^M * sum_i  e ^ (logx[i] - M) ) =
 *     M + Math.log( sum_i  e ^ (logx[i] - M)
 *
 * without causing overflows or throwing much accuracy.
 * /

function logspace_sum(logx: number[], n: number): number {
  if (n === 0) return ML_NEGINF; // = log( sum(<empty>) )
  if (n === 1) return logx[0];
  if (n === 2) return logspace_add(logx[0], logx[1]);
  // else (n >= 3) :
  let i;
  // Mx := max_i Math.log(x_i)
  let Mx = logx[0];
  for (i = 1; i < n; i++) if (Mx < logx[i]) Mx = logx[i];
  let s = 0;
  for (i = 0; i < n; i++) s += exp(logx[i] - Mx);
  return Mx + Math.log(s);
};

// Math.log(1 - exp(x))  in more stable form than Math.log1p(- R_D_qIv(x)) :
/*export function R_Log1_Exp(x: number): number {
  return (
    x > -LN2 ? Math.log(-Math.expm1(x)) : Math.log1p(-exp(x)));
}*/
/* dpois_wrap (x__1, lambda) := dpois(x__1 - 1, lambda);  where
 * dpois(k, L) := exp(-L) L^k / gamma(k+1)  {the usual Poisson probabilities}
 *
 * and  dpois*(.., give_log = TRUE) :=  Math.log( dpois*(..) )
 */
const pr_dpois_wrap = createNs('dpois_wrap');

function dpois_wrap(x_plus_1: number, lambda: number, give_log: boolean): number {
    pr_dpois_wrap('dpois_wrap(x+1=%d, lambda=%d, log=%s)', x_plus_1, lambda, give_log);

    if (!isFinite(lambda)) {
        return R_D__0(give_log);
    }
    if (x_plus_1 > 1) return dpois_raw(x_plus_1 - 1, lambda, give_log);
    if (lambda > Math.abs(x_plus_1 - 1) * M_cutoff) return R_D_exp(give_log, -lambda - lgammafn(x_plus_1));
    else {
        const d = dpois_raw(x_plus_1, lambda, give_log);
        pr_dpois_wrap('  -> d=dpois_raw(..)=%d', d);
        return give_log ? d + Math.log(x_plus_1 / lambda) : d * (x_plus_1 / lambda);
    }
}

/*
 * Abramowitz and Stegun 6.5.29 [right]
 */
const pr_pgamma_smallx = createNs('pgamma_smallx');

function pgamma_smallx(x: number, alph: number, lowerTail: boolean, logP: boolean): number {
    let sum = 0;
    let c = alph;
    let n = 0;
    let term;

    pr_pgamma_smallx(' pg_smallx(x=%d, alph=%d): ', x, alph);

    /*
     * Relative to 6.5.29 all terms have been multiplied by alph
     * and the first, thus being 1, is omitted.
     */

    do {
        n++;
        c *= -x / n;
        term = c / (alph + n);
        sum += term;
    } while (Math.abs(term) > Number.EPSILON * Math.abs(sum));

    pr_pgamma_smallx('%d terms --> conv.sum=%d;', n, sum);
    if (lowerTail) {
        const f1 = logP ? Math.log1p(sum) : 1 + sum;
        let f2;
        if (alph > 1) {
            f2 = dpois_raw(alph, x, logP);
            f2 = logP ? f2 + x : f2 * Math.exp(x);
        } else if (logP) {
            f2 = alph * Math.log(x) - lgamma1p(alph);
        } else {
            f2 = Math.pow(x, alph) / Math.exp(lgamma1p(alph));
        }
        pr_pgamma_smallx(' (f1,f2)= (%d,%d)', f1, f2);
        return logP ? f1 + f2 : f1 * f2;
    } else {
        const lf2 = alph * Math.log(x) - lgamma1p(alph);
        pr_pgamma_smallx(' 1:%d  2:%d', alph * Math.log(x), lgamma1p(alph));
        pr_pgamma_smallx(' sum=%d  log(1+sum)=%d	 lf2=%d', sum, Math.log1p(sum), lf2);

        if (logP) return R_Log1_Exp(Math.log1p(sum) + lf2);
        else {
            const f1m1 = sum;
            const f2m1 = Math.expm1(lf2);
            return -(f1m1 + f2m1 + f1m1 * f2m1);
        }
    }
} /* pgamma_smallx() */

function pd_upper_series(x: number, y: number, logP: boolean): number {
    let term = x / y;
    let sum = term;

    do {
        y++;
        term *= x / y;
        sum += term;
    } while (term > sum * Number.EPSILON);

    /* sum =  \sum_{n=1}^ oo  x^n     / (y*(y+1)*...*(y+n-1))
     *	   =  \sum_{n=0}^ oo  x^(n+1) / (y*(y+1)*...*(y+n))
     *	   =  x/y * (1 + \sum_{n=1}^oo	x^n / ((y+1)*...*(y+n)))
     *	   ~  x/y +  o(x/y)   {which happens when alph -> Inf}
     */
    return logP ? Math.log(sum) : sum;
}

/* Continued fraction for calculation of
 *    scaled upper-tail F_{gamma}
 *  ~=  (y / d) * [1 +  (1-y)/d +  O( ((1-y)/d)^2 ) ]
 */
const pr_pd_lower_cf = createNs('pd_lower_cf');

function pd_lower_cf(y: number, d: number): number {
    let f = 0.0; /* -Wall */
    let of;
    let f0;
    let i;
    let c2;
    let c3;
    let c4;
    let a1;
    let b1;
    let a2;
    let b2;

    const max_it = 200000;

    pr_pd_lower_cf('pd_lower_cf(y=%d, d=%d)', y, d);

    if (y === 0) return 0;

    f0 = y / d;
    /* Needed, e.g. for  pgamma(10^c(100,295), shape= 1.1, log=TRUE): */
    if (Math.abs(y - 1) < Math.abs(d) * Number.EPSILON) {
        /* includes y < d = Inf */
        pr_pd_lower_cf(' very small "y" -> returning (y/d)');
        return f0;
    }

    if (f0 > 1) f0 = 1;
    c2 = y;
    c4 = d; /* original (y,d), *not* potentially scaled ones!*/

    a1 = 0;
    b1 = 1;
    a2 = y;
    b2 = d;

    while (b2 > scalefactor) {
        a1 /= scalefactor;
        b1 /= scalefactor;
        a2 /= scalefactor;
        b2 /= scalefactor;
    }

    i = 0;
    of = -1; /* far away */
    while (i < max_it) {
        i++;
        c2--;
        c3 = i * c2;
        c4 += 2;
        /* c2 = y - i,  c3 = i(y - i),  c4 = d + 2i,  for i odd */
        a1 = c4 * a2 + c3 * a1;
        b1 = c4 * b2 + c3 * b1;

        i++;
        c2--;
        c3 = i * c2;
        c4 += 2;
        /* c2 = y - i,  c3 = i(y - i),  c4 = d + 2i,  for i even */
        a2 = c4 * a1 + c3 * a2;
        b2 = c4 * b1 + c3 * b2;

        if (b2 !== 0) {
            f = a2 / b2;
            /* convergence check: relative; "absolute" for very small f : */
            if (Math.abs(f - of) <= Number.EPSILON * Math.max(f0, Math.abs(f))) {
                pr_pd_lower_cf(' %d iter.\n', i);
                return f;
            }
            of = f;
        }
    }

    pr_pd_lower_cf(" ** NON-convergence in pgamma()'s pd_lower_cf() f= %d.", f);
    return f; /* should not happen ... */
} /* pd_lower_cf() */

const pr_pd_lower_series = createNs('pd_lower_series');

function pd_lower_series(lambda: number, y: number): number {
    let term = 1;
    let sum = 0;

    pr_pd_lower_series('pd_lower_series(lam=%d, y=%d) ...', lambda, y);

    while (y >= 1 && term > sum * Number.EPSILON) {
        term *= y / lambda;
        sum += term;
        y--;
    }
    /* sum =  \sum_{n=0}^ oo  y*(y-1)*...*(y - n) / lambda^(n+1)
     *	   =  y/lambda * (1 + \sum_{n=1}^Inf  (y-1)*...*(y-n) / lambda^n)
     *	   ~  y/lambda + o(y/lambda)
     */

    pr_pd_lower_series(' done: term=%d, sum=%d, y= %d', term, sum, y);

    if (y !== Math.floor(y)) {
        /*
         * The series does not converge as the terms start getting
         * bigger (besides flipping sign) for y < -lambda.
         */

        pr_pd_lower_series(' y not int: add another term ');

        /* FIXME: in quite few cases, adding  term*f  has no effect (f too small)
         *	  and is unnecessary e.g. for pgamma(4e12, 121.1) */
        const f = pd_lower_cf(y, lambda + 1 - y);
        pr_pd_lower_series('  (= %d) * term = %d to sum %d', f, term * f, sum);

        sum += term * f;
    }

    return sum;
} /* pd_lower_series() */

/*
 * Compute the following ratio with higher accuracy that would be had
 * from doing it directly.
 *
 *		 dnorm (x, 0, 1, FALSE)
 *	   ----------------------------------
 *	   pnorm (x, 0, 1, lowerTail, FALSE)
 *
 * Abramowitz & Stegun 26.2.12
 */
function dpnorm(x: number, lowerTail: boolean, lp: number): number {
    //
    // So as not to repeat a pnorm call, we expect
    //
    //	 lp == pnorm (x, 0, 1, lowerTail, TRUE)
    //
    // but use it only in the non-critical case where either x is small
    // or p==exp(lp) is close to 1.

    if (x < 0) {
        x = -x;
        lowerTail = !lowerTail;
    }

    if (x > 10 && !lowerTail) {
        let term = 1 / x;
        let sum = term;
        const x2 = x * x;
        let i = 1;
        do {
            term *= -i / x2;
            sum += term;
            i += 2;
        } while (Math.abs(term) > Number.EPSILON * sum);

        return 1 / sum;
    } else {
        const d = dnorm(x, 0, 1, false);
        return d / Math.exp(lp);
    }
}

/*
 * Asymptotic expansion to calculate the probability that Poisson variate
 * has value <= x.
 * Various assertions about this are made (without proof) at
 * http://members.aol.com/iandjmsmith/PoissonApprox.htm
 */

const pr_ppois_asymp = createNs('ppois_asymp');
const coefs_a = new Float64Array([
    -1e99, // placeholder used for 1-indexing
    2 / 3,
    -4 / 135,
    8 / 2835,
    16 / 8505,
    -8992 / 12629925,
    -334144 / 492567075,
    698752 / 1477701225
]);

const coefs_b = new Float64Array([
    -1e99, // placeholder
    1 / 12,
    1 / 288,
    -139 / 51840,
    -571 / 2488320,
    163879 / 209018880,
    5246819 / 75246796800,
    -534703531 / 902961561600
]);

function ppois_asymp(x: number, lambda: number, lowerTail: boolean, logP: boolean): number {
    let elfb: number;
    let elfb_term: number;
    let res12: number;
    let res1_term: number;
    let res1_ig: number;
    let res2_term: number;
    let res2_ig: number;
    let s2pt: number;
    let i: number;

    const dfm = lambda - x;
    // If lambda is large, the distribution is highly concentrated
    // about lambda.  So representation error in x or lambda can lead
    // to arbitrarily large values of pt_ and hence divergence of the
    // coefficients of this approximation.

    const pt_ = -log1pmx(dfm / x);
    s2pt = Math.sqrt(2 * x * pt_);
    if (dfm < 0) s2pt = -s2pt;

    res12 = 0;
    res1_ig = res1_term = Math.sqrt(x);
    res2_ig = res2_term = s2pt;
    for (i = 1; i < 8; i++) {
        res12 += res1_ig * coefs_a[i];
        res12 += res2_ig * coefs_b[i];
        res1_term *= pt_ / i;
        res2_term *= (2 * pt_) / (2 * i + 1);
        res1_ig = res1_ig / x + res1_term;
        res2_ig = res2_ig / x + res2_term;
    }

    elfb = x;
    elfb_term = 1;
    for (i = 1; i < 8; i++) {
        elfb += elfb_term * coefs_b[i];
        elfb_term /= x;
    }
    if (!lowerTail) elfb = -elfb;

    pr_ppois_asymp('res12 = %d   elfb=%d', elfb, res12);

    const f = res12 / elfb;

    const np = pnorm(s2pt, 0.0, 1.0, !lowerTail, logP);

    if (logP) {
        const n_d_over_p = dpnorm(s2pt, !lowerTail, np);
        pr_ppois_asymp('pp*_asymp(): f=%d	 np=e^%d  nd/np=%d  f*nd/np=%d', f, np, n_d_over_p, f * n_d_over_p);
        return np + Math.log1p(f * n_d_over_p);
    } else {
        const nd = dnorm(s2pt, 0, 1, logP);

        pr_ppois_asymp('pp*_asymp(): f=%d	 np=%d  nd=%d  f*nd=%d', f, np, nd, f * nd);
        return np + f * nd;
    }
}
/* ppois_asymp() */

const pr_pgamma_raw = createNs('pgamma_raw');

export function pgamma_raw(x: number, alph: number, lowerTail: boolean, logP: boolean): number {
    /* Here, assume that  (x,alph) are not NA  &  alph > 0 . */

    let res;

    pr_pgamma_raw('pgamma_raw(x=%d, alph=%d, low=%s, log=%s)', x, alph, lowerTail, logP);

    const rc = R_P_bounds_01(lowerTail, logP, x, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }

    if (x < 1) {
        res = pgamma_smallx(x, alph, lowerTail, logP);
    } else if (x <= alph - 1 && x < 0.8 * (alph + 50)) {
        /* incl. large alph compared to x */
        const sum = pd_upper_series(x, alph, logP); /* = x/alph + o(x/alph) */
        const d = dpois_wrap(alph, x, logP);
        pr_pgamma_raw(' alph "large": sum=pd_upper*()= %d, d=dpois_w(*)= %d', sum, d);
        if (!lowerTail) {
            res = logP ? R_Log1_Exp(d + sum) : 1 - d * sum;
        } else {
            res = logP ? sum + d : sum * d;
        }
    } else if (alph - 1 < x && alph < 0.8 * (x + 50)) {
        /* incl. large x compared to alph */
        let sum;
        const d = dpois_wrap(alph, x, logP);
        pr_pgamma_raw('  x "large": d=dpois_w(*)= %d ', d);

        if (alph < 1) {
            if (x * Number.EPSILON > 1 - alph) sum = R_D__1(logP);
            else {
                const f = (pd_lower_cf(alph, x - (alph - 1)) * x) / alph;
                /* = [alph/(x - alph+1) + o(alph/(x-alph+1))] * x/alph = 1 + o(1) */
                sum = logP ? Math.log(f) : f;
            }
        } else {
            sum = pd_lower_series(x, alph - 1); /* = (alph-1)/x + o((alph-1)/x) */
            sum = logP ? Math.log1p(sum) : 1 + sum;
        }

        pr_pgamma_raw(', sum= %d', sum);
        if (!lowerTail) res = logP ? sum + d : sum * d;
        else res = logP ? R_Log1_Exp(d + sum) : 1 - d * sum;
    } else {
        /* x >= 1 and x fairly near alph. */

        pr_pgamma_raw(' using ppois_asymp()');
        //throw new Error(`internal error trying to call ppois-asymp x=${x} alph=${alph}, lower=${lowerTail}, logP=${logP}`);
        res = ppois_asymp(alph - 1, x, !lowerTail, logP);
    }

    /*
     * We lose a fair amount of accuracy to underflow in the cases
     * where the final result is very close to DBL_MIN.	 In those
     * cases, simply redo via log space.
     */
    if (!logP && res < DBL_MIN / Number.EPSILON) {
        /* with(.Machine, double.xmin / double.eps) #|-> 1.002084e-292 */

        pr_pgamma_raw(' very small res=%.14g; -> recompute via log\n', res);
        return Math.exp(pgamma_raw(x, alph, lowerTail, true));
    } else return res;
}

const printer_pgamma = createNs('pgamma');
export function pgamma(x: number, shape: number, scale: number, lowerTail: boolean, logP: boolean): number {
    if (isNaN(x) || isNaN(shape) || isNaN(scale)) {
        return NaN;
    }
    if (shape < 0 || scale <= 0) {
        printer_pgamma(mapErrV2[ME.ME_DOMAIN], printer_pgamma.namespace);
        return NaN;
    }
    x /= scale;

    if (shape === 0)
        /* limit case; useful e.g. in pnchisq() */
        return x <= 0 ? R_DT_0(lowerTail, logP) : R_DT_1(lowerTail, logP); /* <= assert  pgamma(0,0) ==> 0 */
    return pgamma_raw(x, shape, lowerTail, logP);
}
/* From: terra@gnome.org (Morten Welinder)
 * To: R-bugs@biostat.ku.dk
 * Cc: maechler@stat.math.ethz.ch
 * Subject: Re: [Rd] pgamma discontinuity (PR#7307)
 * Date: Tue, 11 Jan 2005 13:57:26 -0500 (EST)

 * this version of pgamma appears to be quite good and certainly a vast
 * improvement over current R code.  (I last looked at 2.0.1)  Apart from
 * type naming, this is what I have been using for Gnumeric 1.4.1.

 * This could be included into R as-is, but you might want to benefit from
 * making logcf, log1pmx, lgamma1p, and possibly logspace_add/logspace_sub
 * available to other parts of R.

 * MM: I've not (yet?) taken  logcf(), but the other four
 */
