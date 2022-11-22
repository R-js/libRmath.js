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
//
import { rbinomOne } from '@dist/binomial/rbinom.js';
import { ML_ERR_return_NAN } from '@common/logger.js';
import { INT_MAX, M_LN_SQRT_2PI } from '@lib/r-func.js';
import type { IRNG } from '@rng/irng.js';
import { qhyper } from './qhyper.js';
//
const printer_afc = debug('afc');

const al = new Float64Array([
    0.0 /*ln(0!)=ln(1)*/,
    0.0 /*ln(1!)=ln(1)*/,
    0.69314718055994530941723212145817 /*ln(2) */,
    1.7917594692280550008124773583807 /*ln(6) */,
    3.17805383034794561964694160129705 /*ln(24)*/,
    4.78749174278204599424770093452324,
    6.57925121201010099506017829290394,
    8.52516136106541430016553103634712,
    /* 10.60460290274525022841722740072165, approx. value below =
       10.6046028788027; rel.error = 2.26 10^{-9}

      FIXME: Use constants and if(n > ..) decisions from ./stirlerr.c
      -----  will be even *faster* for n > 500 (or so)
    */
]);


const scale = 1e25;
const con = 57.5646273248511421;
const deltal = 0.0078;
const deltau = 0.0034;


// afc(i) :=  ln( i! )	[logarithm of the factorial i]
// js is singlethreaded so can put the i outside


function afc(i: number): number {
    // If (i > 7), use Stirling's approximation, otherwise use table lookup.
    i = Math.trunc(i);
    if (i < 0) {
        printer_afc('rhyper.c: afc(i), i=%d < 0 -- SHOULD NOT HAPPEN!', i);
        return -1; // unreached
    }
    if (i <= 7) {
        return al[i];
    }
    // else i >= 8 :
    const di = i;
    const i2 = di * di;
    return (di + 0.5) * Math.log(di) - di + M_LN_SQRT_2PI + (0.0833333333333333 - 0.00277777777777778 / i2) / di;
}

//     rhyper(NR, NB, n) -- NR 'red', NB 'blue', n drawn, how many are 'red'
const printer_rhyper = debug('rhyper');

const r_d = new Float64Array(14);
const d_N = 0;
// II:
const d_w = 1;
// III:
const d_a = 2;
const d_d = 3;
const d_s = 4;
const d_xl = 5;
const d_xr = 6;
const d_kl = 7;
const d_kr = 8;
const d_lamdl = 9;
const d_lamdr = 10;
const d_p1 = 11;
const d_p2 = 12;
const d_p3 = 13;


const r_i = new Int32Array(13);
// local
const i_nn1 = 0;
const i_nn2 = 1;
const i_kk = 2;
const i_ix = 3;

const i_ks = 4;
const i_n1s = 5;
const i_n2s = 6;

const i_m = 7;
const i_minjx = 8;
const i_maxjx = 9;

const i_k = 10;
const i_n1 = 11;
const i_n2 = 12;

r_i[i_ks] = -1;
r_i[i_n1s] = -1;
r_i[i_n2s] = -1;

function L_finis(): number {
    /* return appropriate variate */

    if (r_i[i_kk] + r_i[i_kk] >= r_d[d_N]) {
        if (r_i[i_nn1] > r_i[i_nn2]) {
            r_i[i_ix] = r_i[i_kk] - r_i[i_nn2] + r_i[i_ix];
        }
        else {
            r_i[i_ix] = r_i[i_nn1] - r_i[i_ix];
        }
    }
    else if (r_i[i_nn1] > r_i[i_nn2]) {
        r_i[i_ix] = r_i[i_kk] - r_i[i_ix];
    }
    return r_i[i_ix];
}


export function rhyperOne(nn1in: number, nn2in: number, kkin: number, rng: IRNG): number {

    if (!isFinite(nn1in) || !isFinite(nn2in) || !isFinite(kkin)) {
        return ML_ERR_return_NAN(printer_rhyper);
    }

    nn1in = Math.round(nn1in);
    nn2in = Math.round(nn2in);
    kkin = Math.round(kkin);

    if (nn1in < 0 || nn2in < 0 || kkin < 0 || kkin > nn1in + nn2in) {
        return ML_ERR_return_NAN(printer_rhyper);
    }
    if (nn1in >= INT_MAX || nn2in >= INT_MAX || kkin >= INT_MAX) {
        /* large n -- evade integer overflow (and inappropriate algorithms)
           -------- */
        // FIXME: Much faster to give rbinom() approx when appropriate; -> see Kuensch(1989)
        // Johnson, Kotz,.. p.258 (top) mention the *four* different binomial approximations
        if (kkin === 1) {
            // Bernoulli
            const rinv = 1 + nn2in / nn1in;
            const r = 1 / rinv;
            return rbinomOne(kkin, r, rng);
        }
        // Slow, but safe: return  F^{-1}(U)  where F(.) = phyper(.) and  U ~ U[0,1]
        // This will take crazy long time even in C native code, I throw an error
        //if (kkin > 1E6) {
        //    throw new TypeError(`Blocked, these input parameters takes (even in R) 2 min to run k=${kkin},nr=${nn1in},nb=${nn2in}`);
        //}
        return qhyper(rng.random(), nn1in, nn2in, kkin, false, false);
    }

    r_i[i_nn1] = nn1in;
    r_i[i_nn2] = nn2in;
    r_i[i_kk] = kkin;

    let setup1: boolean;
    let setup2: boolean;

    /*if new parameter values, initialize */
    if (r_i[i_nn1] !== r_i[i_n1s] || r_i[i_nn2] !== r_i[i_n2s]) {
        setup1 = true;
        setup2 = true;
    }
    else if (r_i[i_kk] !== r_i[i_ks]) {
        setup1 = false;
        setup2 = true;
    }
    else {
        setup1 = false;
        setup2 = false;
    }

    if (setup1) {
        r_i[i_n1s] = r_i[i_nn1];
        r_i[i_n2s] = r_i[i_nn2];
        r_d[d_N] = r_i[i_nn1]; // avoid overflow add in pieces
        r_d[d_N] += r_i[i_nn2] // avoid overflow add in pieces
        if (r_i[i_nn1] <= r_i[i_nn2]) {
            r_i[i_n1] = r_i[i_nn1];
            r_i[i_n2] = r_i[i_nn2];
        }
        else {
            r_i[i_n1] = r_i[i_nn2];
            r_i[i_n2] = r_i[i_nn1];
        }
    }
    if (setup2) {

        r_i[i_ks] = r_i[i_kk];

        if ((r_i[i_kk] + r_i[i_kk]) >= r_d[d_N]) {
            r_i[i_k] = (r_d[d_N] - r_i[i_kk]);
        }
        else {
            r_i[i_k] = r_i[i_kk];
        }
    }
    if (setup1 || setup2) {
        r_i[i_m] =
            (
                (r_i[i_k] + 1)
                * (r_i[i_n1] + 1)
                / (r_d[d_N] + 2)
            ); // m := floor(adjusted mean E[.])
        r_i[i_minjx] = Math.max(0, r_i[i_k] - r_i[i_n2]);
        r_i[i_maxjx] = Math.min(r_i[i_n1], r_i[i_k]);
        printer_rhyper('rhyper(n1=%d, n2=%d, k=%d), setup: floor(a.mean)=: m = %d, [min,maxjx]= [%d,%d]\n',
            r_i[i_nn1],
            r_i[i_nn2],
            r_i[i_kk],
            r_i[i_m],
            r_i[i_minjx],
            r_i[i_maxjx]
        );
    }

    /* generate random variate --- Three basic cases */

    if (r_i[i_minjx] === r_i[i_maxjx]) {
        /* I: degenerate distribution ---------------- */
        printer_rhyper("rhyper(), branch I (degenerate): ix := maxjx = %d\n", r_i[i_maxjx]);

        r_i[i_ix] = r_i[i_maxjx];

        return L_finis();
    }
    else if (r_i[i_m] - r_i[i_minjx] < 10) {
        //const static double scale = 1e25; // scaling factor against (early) underflow
        //const static double con = 57.5646273248511421;
        // II: (Scaled) algorithm HIN (inverse transformation) ----
        if (setup1 || setup2) {
            let lw = 0; // log(w);  w = exp(lw) * scale = exp(lw + log(scale)) = exp(lw + con)
            if (r_i[i_k] < r_i[i_n2]) {
                lw = afc(r_i[i_n2])
                    + afc(r_i[i_n1] + r_i[i_n2] - r_i[i_k])
                    - afc(r_i[i_n2] - r_i[i_k])
                    - afc(r_i[i_n1] + r_i[i_n2]);
            }
            else {
                lw = afc(r_i[i_n1])
                    + afc(r_i[i_k])
                    - afc(r_i[i_k] - r_i[i_n2])
                    - afc(r_i[i_n1] + r_i[i_n2]);
            }
            r_d[d_w] = Math.exp(lw + con);
        }
        printer_rhyper('rhyper(), branch II; w = %d > 0', r_d[d_w]);

        L10:
        for (; ;) { // forever + break replaces "goto"
            let p = r_d[d_w];
            r_i[i_ix] = r_i[i_minjx];
            let u = rng.random() * scale;

            printer_rhyper('  _new_ u = %d', u);

            while (u > p) {
                u -= p;
                p *= (r_i[i_n1] - r_i[i_ix]) * (r_i[i_k] - r_i[i_ix]);
                r_i[i_ix]++;
                p = p / r_i[i_ix] / (r_i[i_n2] - r_i[i_k] + r_i[i_ix]);

                printer_rhyper('       ix=%d, u=%d, p=%d (u-p=%d)\n', r_i[i_ix], u, p, u - p);

                if (r_i[i_ix] > r_i[i_maxjx]) {
                    continue L10;//goto L10;
                    // FIXME  if(p == 0.)  we also "have lost"  => goto L10
                }
            }
            return L_finis();
        }//for
    }
    else {
        /* III : H2PE Algorithm --------------------------------------- */

        let u = 0;
        let v = 0;

        if (setup1 || setup2) {
            const val =
                (r_d[d_N] - r_i[i_k])
                * r_i[i_k]
                * r_i[i_n1]
                * r_i[i_n2]
                / (r_d[d_N] - 1)
                / r_d[d_N]
                / r_d[d_N];

            r_d[d_s] = Math.sqrt(val);

            /* remark: d is defined in reference without int. */
            /* the truncation centers the cell boundaries at 0.5 */

            r_d[d_d] = Math.trunc(1.5 * r_d[d_s]) + 0.5;
            r_d[d_xl] = r_i[i_m] - r_d[d_d] + 0.5;
            r_d[d_xr] = r_i[i_m] + r_d[d_d] + 0.5;

            r_d[d_a] = afc(r_i[i_m]) + afc(r_i[i_n1] - r_i[i_m]) + afc(r_i[i_k] - r_i[i_m]) + afc(r_i[i_n2] - r_i[i_k] + r_i[i_m]);

            r_d[d_kl] = Math.exp(
                r_d[d_a]
                - afc(r_d[d_xl])
                - afc(r_i[i_n1] - r_d[d_xl])
                - afc(r_i[i_k] - r_d[d_xl])
                - afc(r_i[i_n2] - r_i[i_k] + r_d[d_xl])
            );
            r_d[d_kr] = Math.exp(
                r_d[d_a]
                - afc(r_d[d_xr] - 1)
                - afc(r_i[i_n1] - r_d[d_xr] + 1)
                - afc(r_i[i_k] - r_d[d_xr] + 1)
                - afc(r_i[i_n2] - r_i[i_k] + r_d[d_xr] - 1)
            );

            r_d[d_lamdl] = -Math.log(
                r_d[d_xl]
                * (r_i[i_n2] - r_i[i_k] + r_d[d_xl])
                /
                (r_i[i_n1] - r_d[d_xl] + 1)
                /
                (r_i[i_k] - r_d[d_xl] + 1)
            );

            r_d[d_lamdr] = -Math.log(
                (r_i[i_n1] - r_d[d_xr] + 1)
                * (r_i[i_k] - r_d[d_xr] + 1)
                / r_d[d_xr]
                / (r_i[i_n2] - r_i[i_k] + r_d[d_xr])
            );

            r_d[d_p1] = r_d[d_d] + r_d[d_d]; //
            r_d[d_p2] = r_d[d_p1] + r_d[d_kl] / r_d[d_lamdl];
            r_d[d_p3] = r_d[d_p2] + r_d[d_kr] / r_d[d_lamdr];
        }
        printer_rhyper(
            'rhyper(), branch III {accept/reject}: (xl,xr)= (%d,%d); (lamdl,lamdr)= (%d,%d)\n',
            r_d[d_xl],
            r_d[d_xr],
            r_d[d_lamdl],
            r_d[d_lamdr],
        );
        printer_rhyper('-------- p123= c(%d,%d,%d)\n', r_d[d_p1], r_d[d_p2], r_d[d_p3]);

        let n_uv = 0;
        L30:
        //let goto_L30 = false;
        for (; ;) {
            u = rng.random() * r_d[d_p3];
            v = rng.random();
            n_uv++;
            if (n_uv >= 10000) {
                printer_rhyper('rhyper() branch III: giving up after %d rejections',
                    r_i[i_nn1],
                    r_i[i_nn2],
                    r_i[i_kk],
                    n_uv
                );
                return ML_ERR_return_NAN(printer_rhyper);
            }

            printer_rhyper(' ... L30: new (u=%d, v ~ U[0,1])[%d]\n',
                n_uv, u, v);

            if (u < r_d[d_p1]) {
                /* rectangular region */
                r_i[i_ix] = (r_d[d_xl] + u);
            }
            else if (u <= r_d[d_p2]) {
                /* left tail */
                r_i[i_ix] = r_d[d_xl] + Math.log(v) / r_d[d_lamdl];
                if (r_i[i_ix] < r_i[i_minjx]) {
                    continue L30;
                    //goto L30;
                }
                v = v * (u - r_d[d_p1]) * r_d[d_lamdl];
            }
            else {
                /* right tail */
                r_i[i_ix] = r_d[d_xr] - Math.log(v) / r_d[d_lamdr];
                if (r_i[i_ix] > r_i[i_maxjx]) {
                    continue L30;
                    //goto L30;
                }
                v = v * (u - r_d[d_p2]) * r_d[d_lamdr];
            }

            /* acceptance/rejection test */
            let reject = true;

            if (r_i[i_m] < 100 || r_i[i_ix] <= 50) {
                /* explicit evaluation */
                /* The original algorithm (and TOMS 668) have
                   f = f * i * (n2 - k + i) / (n1 - i) / (k - i);
                   in the (m > ix) case, but the definition of the
                   recurrence relation on p134 shows that the +1 is
                   needed. */
                let i = 0;
                let f = 1;
                if (r_i[i_m] < r_i[i_ix]) {
                    for (i = r_i[i_m] + 1; i <= r_i[i_ix]; i++) {
                        f = f
                            * (r_i[i_n1] - i + 1)
                            * (r_i[i_k] - i + 1)
                            / (r_i[i_n2] - r_i[i_k] + i)
                            / i;
                    }
                }
                else if (r_i[i_m] > r_i[i_ix]) {
                    for (i = r_i[i_ix] + 1; i <= r_i[i_m]; i++) {
                        f = f
                            * i
                            * (r_i[i_n2] - r_i[i_k] + i)
                            / (r_i[i_n1] - i + 1)
                            / (r_i[i_k] - i + 1);
                    }
                }
                if (v <= f) {
                    reject = false;
                }
            }
            else {

                // 11: e,dg,dr,ds,dt,dt,gl,gu,nk,nm,ub
                // 8 :xk, xm, xn, y1, ym, yn, yk, alv
                // 5+11+8=24
                let e = 0, g = 0, r = 0, t = 0, y = 0;
                let de = 0, dg = 0, dr = 0, ds = 0, dt = 0, gl = 0, gu = 0, nk = 0, nm = 0, ub = 0;
                let xk = 0, xm = 0, xn = 0, y1 = 0, ym = 0, yn = 0, yk = 0, alv = 0;

                printer_rhyper(" ... accept/reject 'large' case v=%d", v);

                /* squeeze using upper and lower bounds */
                y = r_i[i_ix];
                y1 = y + 1.0;
                ym = y - r_i[i_m];
                yn = r_i[i_n1] - y + 1.0;
                yk = r_i[i_k] - y + 1.0;
                nk = r_i[i_n2] - r_i[i_k] + y1;
                r = -ym / y1;
                r_d[d_s] = ym / yn;
                t = ym / yk;
                e = -ym / nk;
                g = yn * yk / (y1 * nk) - 1.0;
                dg = 1.0;
                if (g < 0) {
                    dg = 1 + g;
                }
                gu = g * (1 + g * (-0.5 + g / 3.0));

                gl = gu
                    - (0.25 * (g * g * g * g)) / dg;
                xm = r_i[i_m] + 0.5;
                xn = r_i[i_n1] - r_i[i_m] + 0.5;
                xk = r_i[i_k] - r_i[i_m] + 0.5;
                nm = r_i[i_n2] - r_i[i_k] + xm;

                ub =
                    y * gu
                    - r_i[i_m] * gl
                    + deltau
                    + xm * r * (1. + r * (-0.5 + r / 3.0))
                    + xn * r_d[d_s] * (1. + r_d[d_s] * (-0.5 + r_d[d_s] / 3.0))
                    + xk * t * (1. + t * (-0.5 + t / 3.0))
                    + nm * e * (1. + e * (-0.5 + e / 3.0));
                /* test against upper bound */
                alv = Math.log(v);
                if (alv > ub) {
                    reject = true;
                }
                else
                {
                    /* test against lower bound */
                    dr = xm * (r * r * r * r);
                    if (r < 0.0) {
                        dr /= (1.0 + r);
                    }
                    ds = xn * (r_d[d_s]* r_d[d_s]* r_d[d_s]* r_d[d_s]);
                    if (r_d[d_s]< 0.0) {
                        ds /= (1.0 + r_d[d_s]);
                    }
                    dt = xk * (t * t * t * t);
                    if (t < 0.0) {
                        dt /= (1.0 + t);
                    }
                    de = nm * (e * e * e * e);
                    if (e < 0.0) {
                        de /= (1.0 + e);
                    }
                    if (alv <
                        ub
                        - 0.25 * (dr + ds + dt + de)
                        + (y + r_i[i_m]) * (gl - gu)
                        - deltal
                        )
                    {
                        reject = false;
                    }
                    else 
                    {
                        /** Stirling's formula to machine accuracy
                         */
                         if (
                            alv
                            <=
                            (
                                r_d[d_a]
                                - afc(r_i[i_ix])
                                - afc(r_i[i_n1] - r_i[i_ix])
                                - afc(r_i[i_k] - r_i[i_ix])
                                - afc(r_i[i_n2] - r_i[i_k] + r_i[i_ix])
                                )
                            )
                        {
                            reject = false;
                        }
                        else
                        {
                            reject = true;
                        }
                    }
                }
            } // else
            if (reject) {
                continue L30;
            }
            break;
        }//for
    }
    return L_finis();
}
