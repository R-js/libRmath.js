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
import { rbinomOne } from '@dist/binomial/rbinom';
import { ML_ERR_return_NAN } from '@common/logger';
import { INT_MAX, imax2, imin2, M_LN_SQRT_2PI } from '$constants';
import type { IRNG } from '@rng/irng';
import { qhyper } from './qhyper';
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


const _r2_d = new Float64Array(4);
const d_scale = 0;
const d_con = 1;
const d_deltal = 2;
const d_deltau = 3;

_r2_d[d_scale] = 1e25;
_r2_d[d_con] = 57.5646273248511421;
_r2_d[d_deltal] = 0.0078;
_r2_d[d_deltau] = 0.0034;


const rd = new Float64Array(23);
// section 1
const d_e = 0;
const d_g = 1;
const d_r = 2;
const d_t = 3;
const d_y = 4;
// section 2
const d_de = 5;
const d_dg = 6;
const d_dr = 7;
const d_ds = 8;
const d_dt = 9;
const d_gl = 10;
const d_gu = 11;
const d_nk = 12;
const d_nm = 13;
const d_ub = 14;
// section 3
const d_xk = 15;
const d_xm = 16;
const d_xn = 17;
const d_y1 = 18;
const d_ym = 19;
const d_yn = 20;
const d_yk = 21;
const d_alv = 22;

// afc(i) :=  ln( i! )	[logarithm of the factorial i]
// js is singlethreaded so can put the i outside
const afc_i = new Int32Array(1);

function afc(_i: number): number {
    // If (i > 7), use Stirling's approximation, otherwise use table lookup.
    afc_i[0] = _i;
    if (afc_i[0] < 0) {
        printer_afc('rhyper.c: afc(i), i=%d < 0 -- SHOULD NOT HAPPEN!', afc_i[0]);
        return -1; // unreached
    }
    if (afc_i[0] <= 7) {
        return al[afc_i[0]];
    }
    // else i >= 8 :
    const di = afc_i[0];
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

function L_finis(i_kk: number, d_N: number, i_nn1: number, i_nn2: number): number {
    /* return appropriate variate */

    if (r_i[i_kk] + r_i[i_kk] >= r_d[d_N]) {
        if (r_i[i_nn1] > r_i[i_nn2]) {
            r_i[i_ix] = r_i[i_kk] - r_i[i_nn2] + r_i[i_ix];
        } else {
            r_i[i_ix] = r_i[i_nn1] - r_i[i_ix];
        }
    } else {
        if (r_i[i_nn1] > r_i[i_nn2]) r_i[i_ix] = r_i[i_kk] - r_i[i_ix];
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

    if (nn1in < 0 || nn2in < 0 || kkin < 0 || kkin > nn1in + nn2in) return ML_ERR_return_NAN(printer_rhyper);
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
    } else if (r_i[i_kk] !== r_i[i_ks]) {
        setup1 = false;
        setup2 = true;
    } else {
        setup1 = false;
        setup2 = false;
    }

    if (setup1) {
        r_i[i_n1s] = r_i[i_nn1];
        r_i[i_n2s] = r_i[i_nn2];
        r_d[d_N] = r_i[i_nn1]; // avoid overflow add in pieces
        r_d[d_N] += r_i[i_nn2] // avoid overflow add in pieces
        if (r_i[i_nn1] <= r_i[i_nn1]) {
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
        r_i[i_m] = ((r_i[i_k] + 1) * (r_i[i_n1] + 1) / (r_d[d_N] + 2)); // m := floor(adjusted mean E[.])
        r_i[i_minjx] = Math.min(0, r_i[i_k] - r_i[i_n2]);
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
        return L_finis(i_kk, d_N, i_nn1, i_nn2);
    }
    else if (r_i[i_m] - r_i[i_minjx] < 10) {
        //_r2_d[i_scale];
        //_r2_d[i_con]

        if (setup1 || setup2) {
            let lw; // log(w);  w = exp(lw) * scale = exp(lw + log(scale)) = exp(lw + con)
            if (r_i[i_k] < r_i[i_n2]) {
                lw = afc(r_i[i_n2]) + afc(r_i[i_n1] + r_i[i_n2] - r_i[i_k]) - afc(r_i[i_n2] - r_i[i_k]) - afc(r_i[i_n1] + r_i[i_n2]);
            }
            else {
                lw = afc(r_i[i_n1]) + afc(r_i[i_k]) - afc(r_i[i_k] - r_i[i_n2]) - afc(r_i[i_n1] + r_i[i_n2]);
            }
            r_d[d_w] = Math.exp(lw + _r2_d[d_con]);
        }
        let p: number;
        let u: number;
        printer_rhyper('rhyper(), branch II; w = %d > 0', r_d[d_w]);

        L10:
        for (; ;) {
            p = r_d[d_w];
            r_i[i_ix] = r_i[i_minjx];
            u = rng.random() * _r2_d[d_scale];

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
            return L_finis(i_kk, d_N, i_nn1, i_nn2);
        }//for to fake the goto L10
    }
    else {
        /* III : H2PE Algorithm --------------------------------------- */
        // never used??
        let u = 0;
        let v = 0;

        if (setup1 || setup2) {

            const val = (r_d[d_N] - r_i[i_k]) * r_i[i_k] * r_i[i_n1] * r_i[i_n2] / (r_d[d_N] - 1) / r_d[d_N] / r_d[d_N];
            r_d[d_s] = Math.sqrt(val);

            /* remark: d is defined in reference without int. */
            /* the truncation centers the cell boundaries at 0.5 */

            r_d[d_d] = Math.trunc(1.5 * r_d[d_s]) + 0.5;
            r_d[d_xl] = r_i[i_m] - r_d[d_s] + 0.5;
            r_d[d_xr] = r_i[i_m] + r_d[d_s] + 0.5;

            r_d[d_a] = afc(r_i[i_m]) + afc(r_i[i_n1] - r_i[i_m]) + afc(r_i[i_k] - r_i[i_m]) + afc(r_i[i_n2] - r_i[i_k] + r_i[i_m]);

            r_d[d_kl] = Math.exp(r_d[d_a] - afc(r_d[d_xl]) - afc(r_i[i_n1] - r_d[d_xl]) - afc(r_i[i_k] - r_d[d_xl]) - afc(r_i[i_n2] - r_i[i_k] + r_d[d_xl]));
            r_d[d_kr] = Math.exp(r_d[d_a] - afc(r_d[d_xl] - 1) - afc(r_i[i_n1] - r_d[d_xr] + 1) - afc(r_i[i_k] - r_d[d_xr] + 1) - afc(r_i[i_n2] - r_i[i_k] + r_d[d_xr] - 1));

            const val2 = (r_d[d_xl] * (r_i[i_n2] - r_i[i_k] + r_d[d_xl]))
                /
                (r_i[i_n1] - r_d[d_xl] + 1)
                /
                (r_i[i_k] - r_d[d_xl] + 1);
            r_d[d_lamdl] = -Math.log(val2);

            const val3 = (r_i[i_n1] - r_d[d_xr] + 1) * (r_i[i_k] - r_d[d_xr] + 1) / r_d[d_xr] / (r_i[i_n2] - r_i[i_k] + r_d[d_xr]);
            r_d[d_lamdr] = -Math.log(val3);

            // this is from 70's 80's when fmul opcode didnt exist + was cheaper then *2
            r_d[d_p1] = r_d[d_d] + r_d[d_d]; //
            r_d[d_p2] = r_d[d_p1] + r_d[d_kl] / r_d[d_lamdl];
            r_d[d_p3] = r_d[d_p2] + r_d[d_kr] / r_d[d_lamdr];

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

                // here

                if (u < r_d[d_p1]) {
                    /* rectangular region */
                    r_i[i_ix] = r_d[d_xl] + u;
                } else if (u <= r_d[d_p2]) {
                    /* left tail */
                    r_i[i_ix] = r_d[d_xl] + Math.log(v) / r_d[d_lamdl];
                    if (r_i[i_ix] < r_i[i_minjx]) {
                        continue L30;
                        //goto L30;
                    }
                    v = v * (u - r_d[d_p1]) * r_d[d_lamdl];
                } else {
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
                    let i;
                    let f = 1.0;
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
                    rd.fill(0); // clear everything

                    printer_rhyper(" ... accept/reject 'large' case v=%d", v);

                    /* squeeze using upper and lower bounds */
                    rd[d_y] = r_i[i_ix];
                    rd[d_y1] = rd[d_y] + 1;
                    rd[d_ym] = rd[d_y] - r_i[i_m];
                    rd[d_yn] = r_i[i_n1] - rd[d_y] + 1;
                    rd[d_yk] = r_i[i_k] - rd[d_y] + 1;
                    rd[d_nk] = r_i[i_n2] - r_i[i_k] + rd[d_y1];
                    rd[d_r] = -rd[d_ym] / rd[d_y1];
                    rd[d_s] = rd[d_ym] / rd[d_yn];
                    rd[d_t] = rd[d_ym] / rd[d_yk];
                    rd[d_e] = -rd[d_ym] / rd[d_nk];
                    rd[d_g] = (rd[d_yn] * rd[d_yk]) / (rd[d_y1] * rd[d_nk]) - 1;
                    rd[d_dg] = 1;
                    if (rd[d_g] < 0) 
                    {
                        rd[d_dg] = 1 + rd[d_g];
                    }
                    rd[d_gu] = rd[d_g] * (1 + rd[d_g] * (-0.5 + rd[d_g] / 3.0));
                    rd[d_gl] = rd[d_gu] - (0.25 * (rd[d_g] * rd[d_g] * rd[d_g] * rd[d_g])) / rd[d_dg];
                    rd[d_xm] = r_i[i_m] + 0.5;
                    rd[d_xn] = r_i[i_n1] - r_i[i_m] + 0.5;
                    rd[d_xk] = r_i[i_k] - r_i[i_m] + 0.5;
                    rd[d_nm] = r_i[i_n2] - r_i[i_k] + rd[d_xm];
                    rd[d_ub] = 
                        rd[d_y] * rd[d_gu]
                        - r_i[i_m] * rd[d_gl]
                        + rd[d_deltau]
                        + rd[d_xm] * rd[d_r] * (1 + rd[d_r] * (-0.5 + rd[d_r] / 3.0))
                        + rd[d_xn] * rd[d_s] * (1 + rd[d_s] * (-0.5 + rd[d_s] / 3.0))
                        + rd[d_xk] * rd[d_t] * (1 + rd[d_t] * (-0.5 + rd[d_t] / 3.0))
                        + rd[d_nm] * rd[d_e] * (1 + rd[d_e] * (-0.5 + rd[d_e] / 3.0));
                    /* test against upper bound */
                    rd[d_alv] = Math.log(v);
                    if (rd[d_alv] > rd[d_ub) {
                        reject = true;
                    } else {
                        /* test against lower bound */
                        dr = xm * (r * r * r * r);
                        if (r < 0.0) dr /= 1.0 + r;
                        ds = xn * (s * s * s * s);
                        if (s < 0.0) ds /= 1.0 + s;
                        dt = xk * (t * t * t * t);
                        if (t < 0.0) dt /= 1.0 + t;
                        de = nm * (e * e * e * e);
                        if (e < 0.0) de /= 1.0 + e;
                        if (alv < ub - 0.25 * (dr + ds + dt + de) + (y + r_i[_m]) * (gl - gu) - deltal) {
                            reject = false;
                        } else {
                            /** Stirling's formula to machine accuracy
                             */
                            if (
                                alv
                                <=
                                (
                                    a - afc(r_i[_ix]) - afc(r_i[_n1] - r_i[_ix])
                                    - afc(r_i[_k] - r_i[_ix]) - afc(r_i[_n2]
                                        - r_i[_k] + r_i[_ix])
                                )
                            ) {
                                reject = false;
                            } else {
                                reject = true;
                            }
                        }
                    }
                } // else
                if (reject) {
                    //goto_L30 = true;
                    continue;
                }
                break;
            } // for the goto_L30
        }
        return L_finis()
    }
