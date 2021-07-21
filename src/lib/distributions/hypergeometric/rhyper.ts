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

const scale = 1e25;
const con = 57.5646273248511421;

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

const r_i = new Int32Array(10);
const _nn1 = 0;
const _nn2 = 1;
const _kk = 2;
const _ix = 3;
const _n1 = 4;
const _n2 = 5;
const _k = 6;
const _m = 7;
const _minjx = 8;
const _maxjx = 9;

export function rhyperOne(nn1in: number, nn2in: number, kkin: number, rng: IRNG): number {
    /* extern double afc(int); */

    //let nn1 = 0; this is now r_i[_nn1]
    //let nn2 = 0;
    //let kk = 0;
    //let ix = 0; // return value (coerced to double at the very end)
    //let setup1 = false;
    //let setup2 = false;

    /* These should become 'thread_local globals' : */
    /* let ks = -1;
     let n1s = -1;
     let n2s = -1;*/
    //let m = 0;
    //let minjx = 0;
    //let maxjx = 0;
    //let k = 0;
    //let n1 = 0;
    //let n2 = 0; // <- not allowing larger integer par
    let tn = 0;

    // II :
    let w = 0;
    // III:
    let a = 0;
    let d = 0;
    let s = 0;
    let xl = 0;
    let xr = 0;
    let kl = 0;
    let kr = 0;
    let lamdl = 0;
    let lamdr = 0;
    let p1 = 0;
    let p2 = 0;
    let p3 = 0;

    /* check parameter validity */

    if (!isFinite(nn1in) || !isFinite(nn2in) || !isFinite(kkin)) return ML_ERR_return_NAN(printer_rhyper);

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
            return rbinomOne(kkin, nn1in / (nn1in + nn2in), rng);
        }
        // Slow, but safe: return  F^{-1}(U)  where F(.) = phyper(.) and  U ~ U[0,1]
        // This will take crazy long time even in C native code, I throw an error
        //if (kkin > 1E6) {
        //    throw new TypeError(`Blocked, these input parameters takes (even in R) 2 min to run k=${kkin},nr=${nn1in},nb=${nn2in}`);
        //}
        return qhyper(rng.random(), nn1in, nn2in, kkin, false, false);
    }
    //nn1 = nn1in;
    r_i[_nn1] = nn1in;
    r_i[_nn2] = nn2in;
    r_i[_kk] = kkin;
    //console.log(r_i);

    /* if new parameter values, initialize */
    // if (nn1 !== n1s || nn2 !== n2s) {
    // setup1 = true;
    // setup2 = true;
    /* } else if (kk !== ks) {
         setup1 = false;
         setup2 = true;
     } else {
         setup1 = false;
         setup2 = false;
     }*/

    //if (setup1) {
    //    n1s = nn1;
    //    n2s = nn2;
    tn = r_i[_nn1] + r_i[_nn2];
    if (r_i[_nn1] <= r_i[_nn2]) {
        r_i[_n1] = r_i[_nn1];
        r_i[_n2] = r_i[_nn2];
    } else {
        r_i[_n1] = r_i[_nn2];
        r_i[_n2] = r_i[_nn1];
    }
    //}
    //if (setup2) {
    //  ks = kk;
    if (r_i[_kk] + r_i[_kk] >= tn) {
        r_i[_k] = tn - r_i[_kk];
    } else {
        r_i[_k] = r_i[_kk];
    }
    //}
    //if (setup1 || setup2) {
    r_i[_m] = (r_i[_k] + 1) * (r_i[_n1] + 1) / (tn + 2);
    r_i[_minjx] = imax2(0, r_i[_k] - r_i[_n2]);
    r_i[_maxjx] = imin2(r_i[_n1], r_i[_k]);

    printer_rhyper(
        'rhyper(nn1=%d, nn2=%d, kk=%d), setup: floor(mean)= m=%d, jx in (%d..%d)',
        r_i[_nn1],
        r_i[_nn2],
        r_i[_kk],
        r_i[_m],
        r_i[_minjx],
        r_i[_maxjx],
    );
    //}

    const L_finis = () => {
        /* return appropriate variate */

        if (r_i[_kk] + r_i[_kk] >= tn) {
            if (r_i[_nn1] > r_i[_nn2]) {
                r_i[_ix] = r_i[_kk] - r_i[_nn2] + r_i[_ix];
            } else {
                r_i[_ix] = r_i[_nn1] - r_i[_ix];
            }
        } else {
            if (r_i[_nn1] > r_i[_nn2]) r_i[_ix] = r_i[_kk] - r_i[_ix];
        }
        return r_i[_ix];
    }

    /* generate random variate --- Three basic cases */

    //let goto_L_finis = false;
    if (r_i[_minjx] === r_i[_maxjx]) {
        /* I: degenerate distribution ---------------- */

        printer_rhyper('rhyper(), branch I (degenerate)');

        r_i[_ix] = r_i[_maxjx];
        return L_finis(); // return appropriate variate
    } else if (r_i[_m] - r_i[_minjx] < 10) {
        // II: (Scaled) algorithm HIN (inverse transformation) ----
        //const scale = 1e25; // scaling factor against (early) underflow
        //const con = 57.5646273248511421;
        // 25*log(10) = log(scale) { <==> exp(con) == scale }
        //if (setup1 || setup2) {
        let lw; // log(w);  w = exp(lw) * scale = exp(lw + log(scale)) = exp(lw + con)
        if (r_i[_k] < r_i[_n2]) {
            lw = afc(r_i[_n2]) + afc(r_i[_n1] + r_i[_n2] - r_i[_k]) - afc(r_i[_n2] - r_i[_k]) - afc(r_i[_n1] + r_i[_n2]);
        } else {
            lw = afc(r_i[_n1]) + afc(r_i[_k]) - afc(r_i[_k] - r_i[_n2]) - afc(r_i[_n1] + r_i[_n2]);
        }
        w = Math.exp(lw + con);
        //}
        let p: number;
        let u: number;
        printer_rhyper('rhyper(), branch II; w = %d > 0', w);

        L10:
        for (; ;) {
            p = w;
            r_i[_ix] = r_i[_minjx];
            u = rng.random() * scale;

            printer_rhyper('  _new_ u = %d', u);

            while (u > p) {
                u -= p;
                p *= (r_i[_n1] - r_i[_ix]) * (r_i[_k] - r_i[_ix]);
                r_i[_ix]++;
                p = p / r_i[_ix] / (r_i[_n2] - r_i[_k] + r_i[_ix]);
                printer_rhyper('       ix=%d, u=%d, p=%d (u-p=%d)\n', r_i[_ix], u, p, u - p);
                if (r_i[_ix] > r_i[_maxjx]) {
                    continue L10;//goto L10;
                    // FIXME  if(p == 0.)  we also "have lost"  => goto L10
                }
            }
            break;
        }
    } else {
        /* III : H2PE Algorithm --------------------------------------- */
        // never used??
        //let u = 0;
        //let v = 0;

        //if (setup1 || setup2) {
        s = Math.sqrt(((tn - r_i[_k]) * r_i[_k] * r_i[_n1] * r_i[_n2]) / (tn - 1) / tn / tn);

        /* remark: d is defined in reference without int. */
        /* the truncation centers the cell boundaries at 0.5 */

        d = Math.trunc(1.5 * s) + 0.5;
        xl =r_i[_m] - d + 0.5;
        xr = r_i[_m] + d + 0.5;
        a = afc(r_i[_m]) + afc(r_i[_n1] - r_i[_m]) + afc(r_i[_k] -r_i[_m]) + afc(r_i[_n2] - r_i[_k] +r_i[_m]);
        kl = Math.exp(a - afc(xl) - afc(r_i[_n1] - xl) - afc(r_i[_k] - xl) - afc(r_i[_n2] - r_i[_k] + xl));
        kr = Math.exp(a - afc(xr - 1) - afc(r_i[_n1] - xr + 1) - afc(r_i[_k] - xr + 1) - afc(r_i[_n2] - r_i[_k] + xr - 1));
        lamdl = -Math.log((xl * (r_i[_n2] - r_i[_k] + xl)) / (r_i[_n1] - xl + 1) / (r_i[_k] - xl + 1));
        lamdr = -Math.log(((r_i[_n1] - xr + 1) * (r_i[_k] - xr + 1)) / xr / (r_i[_n2] - r_i[_k] + xr));
        p1 = d + d;
        p2 = p1 + kl / lamdl;
        p3 = p2 + kr / lamdr;
        //}

        printer_rhyper(
            'rhyper(), branch III {accept/reject}: (xl,xr)= (%d,%d); (lamdl,lamdr)= (%d,%d)\n',
            xl,
            xr,
            lamdl,
            lamdr,
        );
        printer_rhyper('-------- p123= c(%d,%d,%d)\n', p1, p2, p3);

        let n_uv = 0;
        //L30:
        //let goto_L30 = false;
        for (; ;) {
            const u = rng.random() * p3;
            let v = rng.random();
            n_uv++;
            if (n_uv >= 10000) {
                printer_rhyper('rhyper() branch III: giving up after %d rejections', n_uv);
                return ML_ERR_return_NAN(printer_rhyper);
            }

            printer_rhyper(' ... L30: new (u=%d, v ~ U[0,1])[%d]\n', u, n_uv);

            if (u < p1) {
                /* rectangular region */
                r_i[_ix] = xl + u;
            } else if (u <= p2) {
                /* left tail */
                r_i[_ix] = xl + Math.log(v) / lamdl;
                if (r_i[_ix] < r_i[_minjx]) {
                    continue;
                    //goto L30;
                }
                v = v * (u - p1) * lamdl;
            } else {
                /* right tail */
                r_i[_ix] = xr - Math.log(v) / lamdr;
                if (r_i[_ix] > r_i[_maxjx]) {
                    continue;
                    //goto L30;
                }
                v = v * (u - p2) * lamdr;
            }

            /* acceptance/rejection test */
            let reject = true;

            if (r_i[_m] < 100 || r_i[_ix] <= 50) {
                /* explicit evaluation */
                /* The original algorithm (and TOMS 668) have
                   f = f * i * (n2 - k + i) / (n1 - i) / (k - i);
                   in the (m > ix) case, but the definition of the
                   recurrence relation on p134 shows that the +1 is
                   needed. */
                let i;
                let f = 1.0;
                if (r_i[_m] < r_i[_ix]) {
                    for (i = r_i[_m] + 1; i <= r_i[_ix]; i++) f = (f * (r_i[_n1] - i + 1) * (r_i[_k] - i + 1)) / (r_i[_n2] - r_i[_k] + i) / i;
                } else if (r_i[_m] > r_i[_ix]) {
                    for (i = r_i[_ix] + 1; i <= r_i[_m]; i++) f = (f * i * (r_i[_n2] - r_i[_k] + i)) / (r_i[_n1] - i + 1) / (r_i[_k] - i + 1);
                }
                if (v <= f) {
                    reject = false;
                }
            } else {
                const deltal = 0.0078;
                const deltau = 0.0034;

                let de;
                let dg;
                let dr;
                let ds;
                let dt;

                printer_rhyper(" ... accept/reject 'large' case v=%d", v);

                /* squeeze using upper and lower bounds */
                const y = r_i[_ix];
                const y1 = y + 1.0;
                const ym = y -r_i[_m];
                const yn = r_i[_n1] - y + 1.0;
                const yk = r_i[_k] - y + 1.0;
                const nk = r_i[_n2] - r_i[_k] + y1;
                const r = -ym / y1;
                const s = ym / yn;
                const t = ym / yk;
                const e = -ym / nk;
                const g = (yn * yk) / (y1 * nk) - 1.0;
                dg = 1.0;
                if (g < 0.0) dg = 1.0 + g;
                const gu = g * (1.0 + g * (-0.5 + g / 3.0));
                const gl = gu - (0.25 * (g * g * g * g)) / dg;
                const xm = r_i[_m]+ 0.5;
                const xn = r_i[_n1] - r_i[_m] + 0.5;
                const xk = r_i[_k] - r_i[_m] + 0.5;
                const nm = r_i[_n2] - r_i[_k] + xm;
                const ub =
                    y * gu -
                    r_i[_m] * gl +
                    deltau +
                    xm * r * (1 + r * (-0.5 + r / 3.0)) +
                    xn * s * (1 + s * (-0.5 + s / 3.0)) +
                    xk * t * (1 + t * (-0.5 + t / 3.0)) +
                    nm * e * (1 + e * (-0.5 + e / 3.0));
                /* test against upper bound */
                const alv = Math.log(v);
                if (alv > ub) {
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
