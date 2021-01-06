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
import { debug  } from 'debug';

import {
    DBL_MANT_DIG,
    DBL_MIN_EXP,
    M_LN2,
    ME,
    ML_ERR_return_NAN,
    ML_ERROR,
    R_D_half,
    R_DT_0,
    R_DT_1,
    R_pow_di,
} from '../common/_general';

import { R_DT_CIv, R_DT_Clog, R_DT_log, R_DT_qIv, R_Log1_Exp } from '../exp/expm1';

import { lbeta } from '../beta/lbeta';
import { pbeta_raw } from '../beta/pbeta';

const { expm1, log1p, sqrt, min: fmin2, exp, abs: fabs, log, pow, max: fmax2 } = Math;

const {
    isNaN: ISNAN,
    MIN_VALUE: DBL_MIN,
    EPSILON: DBL_EPSILON,
    POSITIVE_INFINITY: ML_POSINF,
    NEGATIVE_INFINITY: ML_NEGINF,
    isFinite: R_FINITE,
    NaN: ML_NAN,
} = Number;

const USE_LOG_X_CUTOFF = -5;
//                       --- based on some testing; had = -10

const n_NEWTON_FREE = 4;
//                   --- based on some testing; had = 10

const MLOGICAL_NA = -1;
// an "NA_LOGICAL" substitute for Mathlib {only used here, for now}

//attribute_hidden
/*export function qbeta_raw(alpha: number, double p, double q, int lower_tail, int log_p,
        int swap_01, double log_q_cut, int n_N, double * qb): number { return 0 };
*/

const printer_qbeta = debug('qbeta');
export function qbeta<T>(pp: T, shape1: number, shape2: number, lower_tail: boolean, log_p: boolean): T {
    /* test for admissibility of parameters */

    const fa: number[] = Array.isArray(pp) ? pp : ([pp] as any);

    const result = fa.map((p) => {
        if (ISNAN(shape1) || ISNAN(shape2) || ISNAN(p)) return shape1 + shape2 + p;

        if (shape1 < 0 || shape2 < 0) {
            return ML_ERR_return_NAN(printer_qbeta);
        }
        // allowing p==0 and q==0  <==> treat as one- or two-point mass

        const qbet = [0, 0]; // = { qbeta(), 1 - qbeta() }

        qbeta_raw(p, shape1, shape2, lower_tail, log_p, MLOGICAL_NA, USE_LOG_X_CUTOFF, n_NEWTON_FREE, qbet);
        return qbet[0];
    });
    return result.length === 1 ? result[0] : (result as any);
}

// CARE: assumes subnormal numbers, i.e., no underflow at DBL_MIN:
const DBL_very_MIN = DBL_MIN / 4;
const DBL_log_v_MIN = M_LN2 * (DBL_MIN_EXP - 2);
// Too extreme: inaccuracy in pbeta(); e.g for  qbeta(0.95, 1e-9, 20):
// -> in pbeta() --> bgrat(..... b*z === 0 underflow, hence inaccurate pbeta()
/* DBL_very_MIN  = 0x0.0000001p-1022, // = 2^-1050 = 2^(-1022 - 28) */
/* DBL_log_v_MIN = -1050. * M_LN2, // = log(DBL_very_MIN) */
// the most extreme -- not ok, as pbeta() then behaves strangely,
// e.g., for  qbeta(0.95, 1e-8, 20):
/* DBL_very_MIN  = 0x0.0000000000001p-1022, // = 2^-1074 = 2^(-1022 -52) */
/* DBL_log_v_MIN = -1074. * M_LN2, // = log(DBL_very_MIN) */

const DBL_1__eps = 1 - DBL_EPSILON; // or rather (1 - DBL_EPSILON/2) (??)

/* set the exponent of acu to -2r-2 for r digits of accuracy */
/*---- NEW ---- -- still fails for p = 1e11, q=.5*/

const fpu = 3e-308;
/* acu_min:  Minimal value for accuracy 'acu' which will depend on (a,p);
         acu_min >= fpu ! */
const acu_min = 1e-300;
const p_lo = fpu;
const p_hi = 1 - 2.22e-16;

const const1 = 2.30753;
const const2 = 0.27061;
const const3 = 0.99229;
const const4 = 0.04481;

function return_q_0(give_log_q: boolean, qb: number[]): void {
    if (give_log_q) {
        qb[0] = ML_NEGINF;
        qb[1] = 0;
    } else {
        qb[0] = 0;
        qb[1] = 1;
    }
    return;
}

function return_q_1(give_log_q: boolean, qb: number[]): void {
    if (give_log_q) {
        qb[0] = 0;
        qb[1] = ML_NEGINF;
    } else {
        qb[0] = 1;
        qb[1] = 0;
    }
    return;
}

function return_q_half(give_log_q: boolean, qb: number[]): void {
    if (give_log_q) {
        qb[0] = qb[1] = -M_LN2;
    } else {
        qb[0] = qb[1] = 0.5;
    }
    return;
}

const printer_qbeta_raw = debug('qbeta_raw');
const R_ifDEBUG_printf = printer_qbeta_raw;
// Returns both qbeta() and its "mirror" 1-qbeta(). Useful notably when qbeta() ~= 1
export function qbeta_raw(
    alpha: number,
    p: number,
    q: number,
    lower_tail: boolean,
    log_p: boolean,
    swap_01: number, // {TRUE, NA, FALSE}: if NA, algorithm decides swap_tail
    log_q_cut: number /* if === Inf: return log(qbeta(..));
                   otherwise, if finite: the bound for
                   switching to log(x)-scale; see use_log_x */,
    n_N: number, // number of "unconstrained" Newton steps before switching to constrained
    qb: number[], // = qb[0:1] = { qbeta(), 1 - qbeta() }
): void {
    const swap_choose = swap_01 === MLOGICAL_NA;
    let swap_tail;
    let log_;
    const give_log_q = log_q_cut === ML_POSINF;
    let use_log_x = give_log_q; // or u < log_q_cut  below
    let warned = false;
    let add_N_step = true;
    let i_pb;
    let i_inn;
    let a;
    let la;
    let logbeta;
    let g;
    let h;
    let pp;
    let p_;
    let qq;
    let r;
    let s;
    let t;
    let w;
    let y = -1;
    let u = 0;
    let xinbta = 0;
    let u_n = 0;

    // Assuming p >= 0, q >= 0  here ...

    // Deal with boundary cases here:
    if (alpha === R_DT_0(lower_tail, log_p)) {
        return return_q_0(give_log_q, qb);
    }
    if (alpha === R_DT_1(lower_tail, log_p)) {
        return return_q_1(give_log_q, qb);
    }

    // check alpha {*before* transformation which may all accuracy}:
    if ((log_p && alpha > 0) || (!log_p && (alpha < 0 || alpha > 1))) {
        // alpha is outside
        printer_qbeta_raw(
            'qbeta(alpha=%d, %d, %d, .., log_p=%d): %s%s',
            alpha,
            p,
            q,
            log_p,
            'alpha not in ',
            log_p ? '[-Inf, 0]' : '[0,1]',
        );
        // ML_ERR_return_NAN :
        ML_ERROR(ME.ME_DOMAIN, '', printer_qbeta_raw);
        qb[0] = qb[1] = ML_NAN;
        return;
    }

    //  p==0, q==0, p = Inf, q = Inf  <==> treat as one- or two-point mass
    if (p === 0 || q === 0 || !R_FINITE(p) || !R_FINITE(q)) {
        // We know 0 < T(alpha) < 1 : pbeta() is constant and trivial in {0, 1/2, 1}
        printer_qbeta_raw(
            'qbeta(%d, %d, %d, lower_t=%d, log_p=%d): (p,q)-boundary: trivial',
            alpha,
            p,
            q,
            lower_tail,
            log_p,
        );
        if (p === 0 && q === 0) {
            // point mass 1/2 at each of {0,1} :
            if (alpha < R_D_half(log_p)) {
                return_q_0(give_log_q, qb);
            }
            if (alpha > R_D_half(log_p)) {
                return_q_1(give_log_q, qb);
            }
            // else:  alpha === "1/2"
            return_q_half(give_log_q, qb);
        } else if (p === 0 || p / q === 0) {
            // point mass 1 at 0 - "flipped around"
            return_q_0;
        } else if (q === 0 || q / p === 0) {
            // point mass 1 at 0 - "flipped around"
            return_q_1;
        }
        // else:  p = q = Inf : point mass 1 at 1/2
        return_q_half;
    }

    /* initialize */
    p_ = R_DT_qIv(lower_tail, log_p, alpha); /* lower_tail prob (in any case) */
    // Conceptually,  0 < p_ < 1  (but can be 0 or 1 because of cancellation!)
    logbeta = lbeta(p, q);

    swap_tail = swap_choose ? p_ > 0.5 : swap_01;
    // change tail; default (swap_01 = NA): afterwards 0 < a <= 1/2
    if (swap_tail) {
        /* change tail, swap  p <-> q :*/
        a = R_DT_CIv(lower_tail, log_p, alpha); // = 1 - p_ < 1/2
        /* la := log(a), but without numerical cancellation: */
        la = R_DT_Clog(lower_tail, log_p, alpha);
        pp = q;
        qq = p;
    } else {
        a = p_;
        la = R_DT_log(lower_tail, log_p, alpha);
        pp = p;
        qq = q;
    }

    /* calculate the initial approximation */

    /* Desired accuracy for Newton iterations (below) should depend on  (a,p)
     * This is from Remark .. on AS 109, adapted.
     * However, it's not clear if this is "optimal" for IEEE double prec.

     * acu = fmax2(acu_min, pow(10., -25. - 5./(pp * pp) - 1./(a * a)));

     * NEW: 'acu' accuracy NOT for squared adjustment, but simple;
     * ---- i.e.,  "new acu" = sqrt(old acu)
    */
    const acu = fmax2(acu_min, pow(10, -13 - 2.5 / (pp * pp) - 0.5 / (a * a)));
    // try to catch  "extreme left tail" early
    let tx = 0;
    const u0 = (la + log(pp) + logbeta) / pp; // = log(x_0)
    const log_eps_c = M_LN2 * (1 - DBL_MANT_DIG); // = log(DBL_EPSILON) = -36.04..
    r = (pp * (1 - qq)) / (pp + 1);

    t = 0.2;
    // FIXME: Factor 0.2 is a bit arbitrary;  '1' is clearly much too much.

    printer_qbeta_raw(
        'qbeta(%d, %d, %d, lower_t=%d, log_p=%d):%s   swap_tail=%d, la=%d, u0=%d (bnd: %d (%d)) ',
        alpha,
        p,
        q,
        lower_tail,
        log_p,
        log_p && (p_ === 0 || p_ === 1) ? (p_ === 0 ? ' p_=0' : ' p_=1') : '',
        swap_tail,
        la,
        u0,
        (t * log_eps_c - log(fabs((pp * (1 - qq) * (2 - qq)) / (2 * (pp + 2))))) / 2,
        t * log_eps_c - log(fabs(r)),
    );

    let goto_L_Newton = false;
    let goto_L_return = false;
    let goto_L_converged = false;

    if (
        M_LN2 * DBL_MIN_EXP < u0 && // cannot allow exp(u0) = 0 ==> exp(u1) = exp(u0) = 0
        u0 < -0.01 && // (must: u0 < 0, but too close to 0 <==> x = exp(u0) = 0.99..)
        // qq <= 2 && // <--- "arbitrary"
        // u0 <  t*log_eps_c - log(fabs(r)) &&
        u0 < (t * log_eps_c - log(fabs((pp * (1 - qq) * (2 - qq)) / (2 * (pp + 2))))) / 2
    ) {
        // TODO: maybe jump here from below, when initial u "fails" ?
        // L_tail_u:
        // MM's one-step correction (cheaper than 1 Newton!)
        r = r * exp(u0); // = r*x0
        if (r > -1) {
            u = u0 - log1p(r) / pp;
            printer_qbeta_raw('u1-u0=%d --> choosing u = u1', u - u0);
        } else {
            u = u0;
            printer_qbeta_raw('cannot cheaply improve u0');
        }
        tx = xinbta = exp(u);
        use_log_x = true; // or (u < log_q_cut)  ??
        //goto L_Newton;
        goto_L_Newton = true;
    }

    if (!goto_L_Newton) {
        // y := y_\alpha in AS 64 := Hastings(1955) approximation of qnorm(1 - a) :
        r = sqrt(-2 * la);
        y = r - (const1 + const2 * r) / (1 + (const3 + const4 * r) * r);

        if (pp > 1 && qq > 1) {
            // use  Carter(1947), see AS 109, remark '5.'
            r = (y * y - 3) / 6;
            s = 1 / (pp + pp - 1);
            t = 1 / (qq + qq - 1);
            h = 2 / (s + t);
            w = (y * sqrt(h + r)) / h - (t - s) * (r + 5.0 / 6.0 - 2.0 / (3 * h));
            printer_qbeta_raw('p,q > 1 => w=%d', w);
            if (w > 300) {
                // exp(w+w) is huge or overflows
                t = w + w + log(qq) - log(pp); // = argument of log1pexp(.)
                u = t <= 18 ? -log1p(exp(t)) : -t - exp(-t); // log(xinbta) = - log1p(qq/pp * exp(w+w)) = -log(1 + exp(t))
                xinbta = exp(u);
            } else {
                xinbta = pp / (pp + qq * exp(w + w));
                u = -log1p((qq / pp) * exp(w + w)); // log(xinbta)
            }
        } else {
            // use the original AS 64 proposal, Scheffé-Tukey (1944) and Wilson-Hilferty
            r = qq + qq;
            /* A slightly more stable version of  t := \chi^2_{alpha} of AS 64
             * t = 1. / (9. * qq); t = r * R_pow_di(1. - t + y * sqrt(t), 3);  */
            t = 1 / (3 * sqrt(qq));
            t = r * R_pow_di(1 + t * (-t + y), 3); // = \chi^2_{alpha} of AS 64
            s = 4 * pp + r - 2; // 4p + 2q - 2 = numerator of new t = (...) / chi^2
            R_ifDEBUG_printf('min(p,q) <= 1: t=%g', t);
            if (t === 0 || (t < 0 && s >= t)) {
                // cannot use chisq approx
                // x0 = 1 - { (1-a)*q*B(p,q) } ^{1/q}    {AS 65}
                // xinbta = 1. - exp((log(1-a)+ log(qq) + logbeta) / qq);
                let l1ma;
                /* := log(1-a), directly from alpha (as 'la' above):
                 * FIXME: not worth it? log1p(-a) always the same ?? */
                if (swap_tail) l1ma = R_DT_log(lower_tail, log_p, alpha);
                else l1ma = R_DT_Clog(lower_tail, log_p, alpha);
                R_ifDEBUG_printf(' t <= 0 : log1p(-a)=%.15g, better l1ma=%.15g\n', log1p(-a), l1ma);
                const xx = (l1ma + log(qq) + logbeta) / qq;
                if (xx <= 0) {
                    xinbta = -expm1(xx);
                    u = R_Log1_Exp(xx); // =  log(xinbta) = log(1 - exp(...A...))
                } else {
                    // xx > 0 ==> 1 - e^xx < 0 .. is nonsense
                    R_ifDEBUG_printf(' xx=%g > 0: xinbta:= 1-e^xx < 0\n', xx);
                    xinbta = 0;
                    u = ML_NEGINF; /// FIXME can do better?
                }
            } else {
                t = s / t;
                R_ifDEBUG_printf(' t > 0 or s < t < 0:  new t = %g ( > 1 ?)\n', t);
                if (t <= 1) {
                    // cannot use chisq, either
                    u = (la + log(pp) + logbeta) / pp;
                    xinbta = exp(u);
                } else {
                    // (1+x0)/(1-x0) = t,  solved for x0 :
                    xinbta = 1 - 2 / (t + 1);
                    u = log1p(-2 / (t + 1));
                }
            }
        }

        // Problem: If initial u is completely wrong, we make a wrong decision here
        if (
            swap_choose &&
            ((swap_tail && u >= -exp(log_q_cut)) || // ==> "swap back"
                (!swap_tail && u >= -exp(4 * log_q_cut) && pp / qq < 1000))
        ) {
            // ==> "swap now" (much less easily)
            // "revert swap" -- and use_log_x
            swap_tail = !swap_tail;
            R_ifDEBUG_printf(' u = %g (e^u = xinbta = %.16g) ==> ', u, xinbta);
            if (swap_tail) {
                a = R_DT_CIv(lower_tail, log_p, alpha); // needed ?
                la = R_DT_Clog(lower_tail, log_p, alpha);
                pp = q;
                qq = p;
            } else {
                a = p_;
                la = R_DT_log(lower_tail, log_p, alpha);
                pp = p;
                qq = q;
            }
            R_ifDEBUG_printf('"%s\'; la = %g\n', swap_tail ? 'swap now' : 'swap back', la);
            // we could redo computations above, but this should be stable
            u = R_Log1_Exp(u);
            xinbta = exp(u);

            /* Careful: "swap now"  should not fail if
               1) the above initial xinbta is "completely wrong"
               2) The correction step can go outside (u_n > 0 ==>  e^u > 1 is illegal)
               e.g., for
                qbeta(0.2066, 0.143891, 0.05)
            */
        }

        if (!use_log_x) use_log_x = u < log_q_cut; //(per default) <==> xinbta = e^u < 4.54e-5
        const bad_u = !R_FINITE(u);
        const bad_init = bad_u || xinbta > p_hi;

        R_ifDEBUG_printf(
            ' -> u = %g, e^u = xinbta = %.16g, (Newton acu=%g%s)\n',
            u,
            xinbta,
            acu,
            bad_u ? ', ** bad u **' : use_log_x ? ', on u = log(x) scale' : '',
        );

        u_n = 1; // -Wall
        tx = xinbta; // keeping "original initial x" (for now)

        if (bad_u || u < log_q_cut) {
            /* e.g.
            qbeta(0.21, .001, 0.05)
            try "left border" quickly, i.e.,
            try at smallest positive number: */
            w = pbeta_raw(DBL_very_MIN, pp, qq, true, log_p);
            if (w > (log_p ? la : a)) {
                R_ifDEBUG_printf(' quantile is left of smallest positive number; "convergence"\n');
                if (log_p || fabs(w - a) < fabs(0 - a)) {
                    // DBL_very_MIN is better than 0
                    tx = DBL_very_MIN;
                    u_n = DBL_log_v_MIN; // = log(DBL_very_MIN)
                } else {
                    tx = 0;
                    u_n = ML_NEGINF;
                }
                use_log_x = log_p;
                add_N_step = false;
                goto_L_return = true;
                //goto L_return;
            } else {
                R_ifDEBUG_printf(' pbeta(smallest pos.) = %g <= %g  --> continuing\n', w, log_p ? la : a);
                if (u < DBL_log_v_MIN) {
                    u = DBL_log_v_MIN; // = log(DBL_very_MIN)
                    xinbta = DBL_very_MIN;
                }
            }
        }

        /* Sometimes the approximation is negative (and === 0 is also not "ok") */
        if (bad_init && !(use_log_x && tx > 0)) {
            if (u === ML_NEGINF) {
                R_ifDEBUG_printf('  u = -Inf;');
                u = M_LN2 * DBL_MIN_EXP;
                xinbta = DBL_MIN;
            } else {
                R_ifDEBUG_printf(' bad_init: u=%g, xinbta=%g;', u, xinbta);
                xinbta =
                    xinbta > 1.1 // i.e. "way off"
                        ? 0.5 // otherwise, keep the respective boundary:
                        : xinbta < p_lo
                        ? exp(u)
                        : p_hi;
                if (bad_u) u = log(xinbta);
                // otherwise: not changing "potentially better" u than the above
            }
            R_ifDEBUG_printf(' -> (partly)new u=%g, xinbta=%g\n', u, xinbta);
        }
    }
    //L_Newton:
    /* --------------------------------------------------------------------

     * Solve for x by a modified Newton-Raphson method, using pbeta_raw()
     */
    if (!goto_L_return) {
        r = 1 - pp;
        t = 1 - qq;
        let wprev = 0;
        let prev = 1;
        let adj = 1; // -Wall

        if (use_log_x) {
            // find  log(xinbta) -- work in  u := log(x) scale
            // if(bad_init && tx > 0) xinbta = tx;// may have been better

            for (i_pb = 0; i_pb < 1000; i_pb++) {
                // using log_p === TRUE  unconditionally here
                // FIXME: if exp(u) = xinbta underflows to 0, like different formula pbeta_log(u, *)
                y = pbeta_raw(xinbta, pp, qq, /*lower_tail = */ true, true);

                /* w := Newton step size for   L(u) = log F(e^u)  =!= 0;   u := log(x)
                 *   =  (L(.) - la) / L'(.);  L'(u)= (F'(e^u) * e^u ) / F(e^u)
                 *   =  (L(.) - la)*F(.) / {F'(e^u) * e^u } =
                 *   =  (L(.) - la) * e^L(.) * e^{-log F'(e^u) - u}
                 *   =  ( y   - la) * e^{ y - u -log F'(e^u)}
                and  -log F'(x)= -log f(x) =  + logbeta + (1-p) log(x) + (1-q) log(1-x)
                           = logbeta + (1-p) u + (1-q) log(1-e^u)
                 */
                w =
                    y === ML_NEGINF // y = -Inf  well possible: we are on log scale!
                        ? 0
                        : (y - la) * exp(y - u + logbeta + r * u + t * R_Log1_Exp(u));
                if (!R_FINITE(w)) break;
                if (i_pb >= n_N && w * wprev <= 0) prev = fmax2(fabs(adj), fpu);
                R_ifDEBUG_printf(
                    'N(i=%2d): u=%#20.16g, pb(e^u)=%#12.6g, w=%#15.9g, %s prev=%11g,',
                    i_pb,
                    u,
                    y,
                    w,
                    w * wprev <= 0 ? 'new' : 'old',
                    prev,
                );
                g = 1;
                for (i_inn = 0; i_inn < 1000; i_inn++) {
                    adj = g * w;
                    // take full Newton steps at the beginning; only then safe guard:
                    if (i_pb < n_N || fabs(adj) < prev) {
                        u_n = u - adj; // u_{n+1} = u_n - g*w
                        if (u_n <= 0) {
                            // <==> 0 <  xinbta := e^u  <= 1
                            if (prev <= acu || fabs(w) <= acu) {
                                /* R_ifDEBUG_printf(" -adj=%g, %s <= acu  ==> convergence\n", */
                                /*	 -adj, (prev <= acu) ? "prev" : "|w|"); */
                                R_ifDEBUG_printf(
                                    ' it{in}=%d, -adj=%g, %s <= acu  ==> convergence\n',
                                    i_inn,
                                    -adj,
                                    prev <= acu ? 'prev' : '|w|',
                                );
                                goto_L_converged = true;
                                break;
                                //goto L_converged;
                            }
                            // if (u_n != ML_NEGINF && u_n != 1)
                            break;
                        }
                    }
                    g /= 3;
                } //for(i_inn)
                if (goto_L_converged) {
                    break;
                }
                // (cancellation in (u_n -u) => may differ from adj:
                const D = fmin2(fabs(adj), fabs(u_n - u));
                /* R_ifDEBUG_printf(" delta(u)=%g\n", u_n - u); */
                R_ifDEBUG_printf(' it{in}=%d, delta(u)=%9.3g, D/|.|=%.3g\n', i_inn, u_n - u, D / fabs(u_n + u));
                if (D <= 4e-16 * fabs(u_n + u)) {
                    goto_L_converged = true;
                    break;
                }
                u = u_n;
                xinbta = exp(u);
                wprev = w;
            } // for(i )
        } else {
            for (i_pb = 0; i_pb < 1000; i_pb++) {
                y = pbeta_raw(xinbta, pp, qq, /*lower_tail = */ true, log_p);
                // delta{y} :   d_y = y - (log_p ? la : a);

                if (!R_FINITE(y) && !(log_p && y === ML_NEGINF)) {
                    // y = -Inf  is ok if(log_p)
                    // ML_ERR_return_NAN :
                    ML_ERROR(ME.ME_DOMAIN, '', printer_qbeta_raw);
                    qb[0] = qb[1] = ML_NAN;
                    return;
                }

                /* w := Newton step size  (F(.) - a) / F'(.)  or,
                 * --   log: (lF - la) / (F' / F) = exp(lF) * (lF - la) / F'
                 */
                w = log_p
                    ? (y - la) * exp(y + logbeta + r * log(xinbta) + t * log1p(-xinbta))
                    : (y - a) * exp(logbeta + r * log(xinbta) + t * log1p(-xinbta));
                if (i_pb >= n_N && w * wprev <= 0) prev = fmax2(fabs(adj), fpu);
                R_ifDEBUG_printf(
                    'N(i=%2d): x0=%d, pb(x0)=%d, w=%d, %s prev=%d,',
                    i_pb,
                    xinbta,
                    y,
                    w,
                    w * wprev <= 0 ? 'new' : 'old',
                    prev,
                );
                g = 1;
                for (i_inn = 0; i_inn < 1000; i_inn++) {
                    adj = g * w;
                    // take full Newton steps at the beginning; only then safe guard:
                    if (i_pb < n_N || fabs(adj) < prev) {
                        tx = xinbta - adj; // x_{n+1} = x_n - g*w
                        if (0 <= tx && tx <= 1) {
                            if (prev <= acu || fabs(w) <= acu) {
                                R_ifDEBUG_printf(
                                    ' it{in}=%d, delta(x)=%g, %s <= acu  ==> convergence\n',
                                    i_inn,
                                    -adj,
                                    prev <= acu ? 'prev' : '|w|',
                                );
                                goto_L_converged = true;
                                break;
                            }
                            if (tx !== 0 && tx !== 1) break;
                        }
                    }
                    g /= 3;
                } //for(i_inn)
                if (goto_L_converged) {
                    break;
                }
                R_ifDEBUG_printf(' it{in}=%d, delta(x)=%g\n', i_inn, tx - xinbta);
                if (fabs(tx - xinbta) <= 4e-16 * (tx + xinbta)) {
                    // "<=" : (.) === 0
                    goto_L_converged = true;
                    break;
                }
                xinbta = tx;
                if (tx === 0)
                    // "we have lost"
                    break;
                wprev = w;
            } //for
        } //if

        /*-- NOT converged: Iteration count --*/
        if (!goto_L_converged) {
            warned = true;
            ML_ERROR(ME.ME_PRECISION, 'qbeta', printer_qbeta_raw);
        }

        //L_converged:
        log_ = log_p || use_log_x; // only for printing
        R_ifDEBUG_printf(
            ' %s: Final delta(y) = %g%s\n',
            warned ? '_NO_ convergence' : 'converged',
            y - (log_ ? la : a),
            log_ ? ' (log_)' : '',
        );
        if ((log_ && y === ML_NEGINF) || (!log_ && y === 0)) {
            // stuck at left, try if smallest positive number is "better"
            w = pbeta_raw(DBL_very_MIN, pp, qq, true, log_);
            if (log_ || fabs(w - a) <= fabs(y - a)) {
                tx = DBL_very_MIN;
                u_n = DBL_log_v_MIN; // = log(DBL_very_MIN)
            }
            add_N_step = false; // not trying to do better anymore
        } else if (!warned && (log_ ? fabs(y - la) > 3 : fabs(y - a) > 1e-4)) {
            if (
                !(
                    log_ &&
                    y === ML_NEGINF &&
                    // e.g. qbeta(-1e-10, .2, .03, log=TRUE) cannot get accurate ==> do NOT warn
                    pbeta_raw(
                        DBL_1__eps, // = 1 - eps
                        pp,
                        qq,
                        true,
                        true,
                    ) >
                        la + 2
                )
            )
                printer_qbeta_raw(
                    // low accuracy for more platform independent output:
                    'qbeta(a, *) =: x0 with |pbeta(x0,* %s) - alpha| = %d is not accurate',
                    log_ ? ', log_' : '',
                    fabs(y - (log_ ? la : a)),
                );
        }
    }
    //L_return:
    if (give_log_q) {
        // ==> use_log_x , too
        if (!use_log_x)
            // (see if claim above is true)
            printer_qbeta_raw('qbeta() L_return, u_n=%d;  give_log_q=TRUE but use_log_x=FALSE -- please report!', u_n);
        const r = R_Log1_Exp(u_n);
        if (swap_tail) {
            qb[0] = r;
            qb[1] = u_n;
        } else {
            qb[0] = u_n;
            qb[1] = r;
        }
    } else {
        if (use_log_x) {
            if (add_N_step) {
                /* add one last Newton step on original x scale, e.g., for
                   qbeta(2^-98, 0.125, 2^-96) */
                xinbta = exp(u_n);
                y = pbeta_raw(xinbta, pp, qq, /*lower_tail = */ true, log_p);
                w = log_p
                    ? (y - la) * exp(y + logbeta + r * log(xinbta) + t * log1p(-xinbta))
                    : (y - a) * exp(logbeta + r * log(xinbta) + t * log1p(-xinbta));
                tx = xinbta - w;
                R_ifDEBUG_printf(
                    'Final Newton correction(non-log scale): xinbta=%.16g, y=%g, w=%g. => new tx=%.16g\n',
                    xinbta,
                    y,
                    w,
                    tx,
                );
            } else {
                if (swap_tail) {
                    qb[0] = -expm1(u_n);
                    qb[1] = exp(u_n);
                } else {
                    qb[0] = exp(u_n);
                    qb[1] = -expm1(u_n);
                }
                return;
            }
        }
        if (swap_tail) {
            qb[0] = 1 - tx;
            qb[1] = tx;
        } else {
            qb[0] = tx;
            qb[1] = 1 - tx;
        }
    }
    return;
}
