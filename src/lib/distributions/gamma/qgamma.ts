import createNs from '@mangos/debug-frontend';
import { ME, mapErrV2, R_Q_P01_boundaries, R_Q_P01_check } from '@common/logger';
import { M_LN2, R_D__0, DBL_MIN } from '@lib/r-func';
import { R_DT_Clog, R_DT_log, R_DT_qIv } from '@dist/exp/expm1';
import { dgamma } from './dgamma';
import { lgammafn_sign as lgammafn } from '@special/gamma/lgammafn_sign';
import { pgamma, pgamma_raw, lgamma1p } from './pgamma';
import { qnorm } from '@dist/normal/qnorm';

const debug_qchisq_appr = createNs('qchisq_appr');

function qchisq_appr(
    p: number,
    nu: number,
    g: number /* = log Gamma(nu/2) */,
    lower_tail: boolean,
    log_p: boolean,
    tol: number /* EPS1 */
): number {
    const C7 = 4.67;
    const C8 = 6.66;
    const C9 = 6.73;
    const C10 = 13.32;

    let a;
    let ch: number;
    let p1;
    let p2;
    let q;
    let t;
    let x;

    /* test arguments and initialise */

    if (isNaN(p) || isNaN(nu)) return NaN;

    const rc = R_Q_P01_check(log_p, p);
    if (rc !== undefined) {
        return rc;
    }
    if (nu <= 0) {
        debug_qchisq_appr(mapErrV2[ME.ME_DOMAIN], debug_qchisq_appr.namespace);
        return NaN;
    }

    const alpha = 0.5 * nu; /* = [pq]gamma() shape */
    const c = alpha - 1;

    if (nu < -1.24 * (p1 = R_DT_log(lower_tail, log_p, p))) {
        /* for small chi-squared */
        /* Math.log(alpha) + g = Math.log(alpha) + Math.log(gamma(alpha)) =
         *        = Math.log(alpha*gamma(alpha)) = lgamma(alpha+1) suffers from
         *  catastrophic cancellation when alpha << 1
         */
        const lgam1pa = alpha < 0.5 ? lgamma1p(alpha) : Math.log(alpha) + g;
        ch = Math.exp((lgam1pa + p1) / alpha + M_LN2);

        debug_qchisq_appr(' small chi-sq., ch0 = %d', ch);
    } else if (nu > 0.32) {
        /*  using Wilson and Hilferty estimate */

        x = qnorm(p, 0, 1, lower_tail, log_p);
        p1 = 2 / (9 * nu);
        ch = nu * Math.pow(x * Math.sqrt(p1) + 1 - p1, 3);

        debug_qchisq_appr(' nu > .32: Wilson-Hilferty; x = %d', x);

        /* approximation for p tending to 1: */
        if (ch > 2.2 * nu + 6) ch = -2 * (R_DT_Clog(lower_tail, log_p, p) - c * Math.log(0.5 * ch) + g);
    } else {
        /* "small nu" : 1.24*(-log(p)) <= nu <= 0.32 */

        ch = 0.4;
        a = R_DT_Clog(lower_tail, log_p, p) + g + c * M_LN2;

        debug_qchisq_appr(' nu <= .32: a = %d', a);

        do {
            q = ch;
            p1 = 1 / (1 + ch * (C7 + ch));
            p2 = ch * (C9 + ch * (C8 + ch));
            t = -0.5 + (C7 + 2 * ch) * p1 - (C9 + ch * (C10 + 3 * ch)) / p2;
            ch -= (1 - Math.exp(a + 0.5 * ch) * p2 * p1) / t;
        } while (Math.abs(q - ch) > tol * Math.abs(ch));
    }

    return ch;
}

const debug_qgamma = createNs('qgamma');

/*			shape = alpha */
const EPS1 = 1e-2;
const EPS2 = 5e-7; /* final precision of AS 91 */
const EPS_N = 1e-15; /* precision of Newton step / iterations */

// LN_EPS unused
//const LN_EPS = -36.043653389117156; /* = log(.Machine$double.eps) iff IEEE_754 */

const MAXIT = 1000; /* was 20 */

const pMIN = 1e-100; /* was 0.000002 = 2e-6 */
const pMAX = 1 - 1e-14; /* was (1-1e-12) and 0.999998 = 1 - 2e-6 */

const i420 = 1 / 420;
const i2520 = 1 / 2520;
const i5040 = 1 / 5040;

export function qgamma(p: number, alpha: number, scale: number, lower_tail: boolean, log_p: boolean): number {
    let p_;
    let a;
    let b;
    //let c;
    let g;
    let ch: number;
    //let ch0;
    let p1;
    let p2;
    let s1;
    let s2;
    let s3;
    let s4;
    let s5;
    //let s6;
    let t;
    let x;
    let i;
    let max_it_Newton = 1;

    let q = 0;

    /* test arguments and initialise */

    if (isNaN(p) || isNaN(alpha) || isNaN(scale)) return NaN;

    const rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }
    if (alpha < 0 || scale <= 0) {
        debug_qgamma(mapErrV2[ME.ME_DOMAIN], debug_qgamma.namespace);
        return NaN;
    }

    if (alpha === 0) /* all mass at 0 : */ return 0;

    const fn_end = () => {
        //END:
        /* PR# 2214 :	 From: Morten Welinder <terra@diku.dk>, Fri, 25 Oct 2002 16:50
           --------	 To: R-bugs@biostat.ku.dk     Subject: qgamma precision
        
           * With a final Newton step, double accuracy, e.g. for (p= 7e-4; nu= 0.9)
           *
           * Improved (MM): - only if rel.Err > EPS_N (= 1e-15);
           *		    - also for lower_tail = FALSE	 or log_p = TRUE
           *		    - optionally *iterate* Newton
           */
        x = 0.5 * scale * ch;
        if (max_it_Newton) {
            /* always use log scale */
            if (!log_p) {
                p = Math.log(p);
                log_p = true;
            }
            if (x === 0) {
                const _1_p = 1 + 1e-7;
                const _1_m = 1 - 1e-7;
                x = DBL_MIN;
                p_ = pgamma(x, alpha, scale, lower_tail, log_p);
                if ((lower_tail && p_ > p * _1_p) || (!lower_tail && p_ < p * _1_m)) return 0;
                /* else:  continue, using x = MIN_VALUE instead of  0  */
            } else p_ = pgamma(x, alpha, scale, lower_tail, log_p);
            if (p_ === -Infinity) return 0; /* PR#14710 */
            for (i = 1; i <= max_it_Newton; i++) {
                p1 = p_ - p;

                if (i === 1) debug_qgamma(' it=%d: p=%d, x = %d, p.=%d; p1=d{p}=%d', i, p, x, p_, p1);
                if (i >= 2) debug_qgamma('          x{it= %d} = %d, p.=%d, p1=d{p}=%d', i, x, p_, p1);

                if (Math.abs(p1) < Math.abs(EPS_N * p)) break;
                /* else */
                g = dgamma(x, alpha, scale, log_p);
                if (g === R_D__0(log_p)) {
                    if (i === 1) debug_qgamma('no final Newton step because dgamma(*)== 0!');
                    break;
                }
                /* else :
                 * delta x = f(x)/f'(x);
                 * if(log_p) f(x) := log P(x) - p; f'(x) = d/dx log P(x) = P' / P
                 * ==> f(x)/f'(x) = f*P / P' = f*Math.exp(p_) / P' (since p_ = log P(x))
                 */
                t = log_p ? p1 * Math.exp(p_ - g) : p1 / g; /* = "delta x" */
                t = lower_tail ? x - t : x + t;
                p_ = pgamma(t, alpha, scale, lower_tail, log_p);
                if (
                    Math.abs(p_ - p) > Math.abs(p1) ||
                    (i > 1 && Math.abs(p_ - p) === Math.abs(p1)) /* <- against flip-flop */
                ) {
                    /* no improvement */

                    if (i === 1 && max_it_Newton > 1) debug_qgamma('no Newton step done since delta{p} >= last delta');

                    break;
                } /* else : */

                /* control step length: this could have started at
                   the initial approximation */
                if (t > 1.1 * x) t = 1.1 * x;
                else if (t < 0.9 * x) t = 0.9 * x;

                x = t;
            }
        }
        return x;
    };

    if (alpha < 1e-10) {
        /* Warning seems unnecessary now: */

        debug_qgamma('value of shape (%d) is extremely small: results may be unreliable', alpha);

        max_it_Newton = 7; /* may still be increased below */
    }

    p_ = R_DT_qIv(lower_tail, log_p, p); /* lower_tail prob (in any case) */

    debug_qgamma('qgamma(p=%d, alpha=%d, scale=%d, l.t.=%s, log_p=%s): ', p, alpha, scale, lower_tail, log_p);

    g = lgammafn(alpha); /* log Gamma(v/2) */

    /*----- Phase I : Starting Approximation */
    ch = qchisq_appr(p, /* nu= 'df' =  */ 2 * alpha, /* lgamma(nu/2)= */ g, lower_tail, log_p, /* tol= */ EPS1);
    if (!isFinite(ch)) {
        /* forget about all iterations! */
        max_it_Newton = 0;
        // goto End;
        return fn_end();
    }

    if (ch < EPS2) {
        /* Corrected according to AS 91; MM, May 25, 1999 */
        max_it_Newton = 20;
        return fn_end();
        // goto END;/* and do Newton steps */
    }

    /* FIXME: This (cutoff to {0, +Inf}) is far from optimal
     * -----  when log_p or !lower_tail, but NOT doing it can be even worse */

    if (p_ > pMAX || p_ < pMIN) {
        /* did return ML_POSINF or 0.;	much better: */
        max_it_Newton = 20;
        return fn_end();
        //goto END;/* and do Newton steps */
    }

    debug_qgamma('\t==> ch = %d:', ch);

    /*----- Phase II: Iteration
     *	Call pgamma() [AS 239]	and calculate seven term taylor series
     */
    const c = alpha - 1;
    const s6 = (120 + c * (346 + 127 * c)) * i5040; /* used below, is "const" */

    const ch0 = ch; /* save initial approx. */
    for (i = 1; i <= MAXIT; i++) {
        q = ch;
        p1 = 0.5 * ch;
        p2 = p_ - pgamma_raw(p1, alpha, /*lower_tail*/ true, /*log_p*/ false);

        if (i === 1) debug_qgamma(' Ph.II iter; ch=%d, p2=%d', ch, p2);
        if (i >= 2) debug_qgamma('     it=%d,  ch=%d, p2=%d', i, ch, p2);

        if (!isFinite(p2) || ch <= 0) {
            ch = ch0;
            max_it_Newton = 27;
            //goto END;
            return fn_end();
        } /*was  return ML_NAN;*/

        t = p2 * Math.exp(alpha * M_LN2 + g + p1 - c * Math.log(ch));
        b = t / ch;
        a = 0.5 * t - b * c;
        s1 = (210 + a * (140 + a * (105 + a * (84 + a * (70 + 60 * a))))) * i420;
        s2 = (420 + a * (735 + a * (966 + a * (1141 + 1278 * a)))) * i2520;
        s3 = (210 + a * (462 + a * (707 + 932 * a))) * i2520;
        s4 = (252 + a * (672 + 1182 * a) + c * (294 + a * (889 + 1740 * a))) * i5040;
        s5 = (84 + 2264 * a + c * (1175 + 606 * a)) * i2520;

        ch += t * (1 + 0.5 * t * s1 - b * c * (s1 - b * (s2 - b * (s3 - b * (s4 - b * (s5 - b * s6))))));
        if (Math.abs(q - ch) < EPS2 * ch) {
            return fn_end();
            //   goto END;
        }
        if (Math.abs(q - ch) > 0.1 * ch) {
            /* diverging? -- also forces ch > 0 */
            if (ch < q) ch = 0.9 * q;
            else ch = 1.1 * q;
        }
    }
    /* no convergence in MAXIT iterations -- but we add Newton now... */

    debug_qgamma('qgamma(%d) not converged in %d iterations; rel.ch=%d', p, MAXIT, ch / Math.abs(q - ch));

    /* was
     *    ML_ERROR2(ME_PRECISION, "qgamma");
     * does nothing in R !*/

    return fn_end();
}
