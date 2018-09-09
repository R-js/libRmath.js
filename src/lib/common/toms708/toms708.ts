/* This is a conversion from BLAS to Typescript/Javascript
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
import * as debug from 'debug';
import { NumberW } from './NumberW';

const { trunc, log, abs, min, pow } = Math;
const printer_bratio = debug('Toms708.bratio');
/**
 * Computes the incomplete beta function
 * <p>
 * This translation was made with the aid of the Fortran-to-Java (f2j) system,
 * developed at the University of Tennessee.
 *<p>
 * @author Armido Didonato, Alfred Morris (F77 version)
 * @author John V. Burkhardt
 * @author James Curran (j.curran@auckland.ac.nz) (Java version)
 * @author Jacob Bogers (jkfbogers@gmai.com) Javascript version
 *
 */

export class Toms708 {
  /**
   * Computes the incomplete beta function
   * <p>
   * This translation was made with the aid of the Fortran-to-Java (f2j) system,
   * developed at the University of Tennessee.
   *<p>
   * @author Armido Didonato, Alfred Morris (F77 version)
   * @author John V. Burkhardt
   * @author James Curran (j.curran@auckland.ac.nz) (Java version)
   * @author Jacob Bogers (jkfbogers@gmail.com) Javascript version
   *
   */

  public static alnrel(a: number) {
    //
    // c*********************************************************************72
    // c
    // cc ALNREL evaluates the function LN(1 + A).
    // c
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //
    const p3 = -0.178874546012214e-1;
    const p2 = 0.405303492862024;
    const p1 = -0.129418923021993e1;
    const q3 = -0.845104217945565e-1;
    const q2 = 0.747811014037616;
    const q1 = -0.162752256355323e1;
    //

    let t = 0.0;
    let w = 0.0;
    let x = 0.0;
    let t2 = 0.0;
    if (Math.abs(a) > 0.375) {
      x = 1 + a;
      return log(x);
    }
    t = a / (a + 2.0);
    t2 = t * t;
    w =
      (((p3 * t2 + p2) * t2 + p1) * t2 + 1.0) /
      (((q3 * t2 + q2) * t2 + q1) * t2 + 1.0);
    return 2.0 * t * w;
    //
  }

  public static algdiv(a: number, b: number) {
    //
    // c*********************************************************************72
    // C
    // cc ALGDIV computes LN(GAMMA(B)/GAMMA(A+B)) when 8 <= B.
    // C
    // C
    // C     IN THIS ALGORITHM, DEL(X) IS THE FUNCTION DEFINED BY
    // C     LN(GAMMA(X))  = (X - 0.5)*LN(X) - X + 0.5*LN(2*PI) + DEL(X).
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //
    const c5 = -0.165322962780713e-2;
    const c4 = 0.837308034031215e-3;
    const c3 = -0.59520293135187e-3;
    const c2 = 0.79365066682539e-3;
    const c1 = -0.277777777760991e-2;
    const c0 = 0.833333333333333e-1;
    //

    let s11 = 0.0;
    let c = 0.0;
    let d = 0.0;
    let h = 0.0;
    let t = 0.0;
    let u = 0.0;
    let v = 0.0;
    let w = 0.0;
    let x = 0.0;
    let s3 = 0.0;
    let s5 = 0.0;
    let s7 = 0.0;
    let x2 = 0.0;
    let s9 = 0.0;

    if (a <= b) {
      h = a / b;
      c = h / (1.0 + h);
      x = 1.0 / (1.0 + h);
      d = b + (a - 0.5);
    } else {
      h = b / a;
      c = 1.0 / (1.0 + h);
      x = h / (1.0 + h);
      d = a + (b - 0.5);
    }

    // C
    // C  SET SN  = (1 - X**N)/(1 - X)
    // C
    x2 = x * x;
    s3 = 1.0 + x + x2;
    s5 = 1.0 + x + x2 * s3;
    s7 = 1.0 + x + x2 * s5;
    s9 = 1.0 + x + x2 * s7;
    s11 = 1.0 + x + x2 * s9;
    // C
    // C  SET W  = DEL(B) - DEL(A + B)
    // C
    t = Math.pow(1.0 / b, 2);
    w =
      ((((c5 * s11 * t + c4 * s9) * t + c3 * s7) * t + c2 * s5) * t + c1 * s3) *
      t +
      c0;
    w *= c / b;
    // C
    // C  Combine the results
    // c
    u = d * Toms708.alnrel(a / b);
    v = a * (log(b) - 1.0);

    if (u <= v) return w - u - v;

    return w - v - u;
  }

  public static apser(a: number, b: number, x: number, eps: number): number {
    //
    // c*********************************************************************72
    // c
    // cc APSER evaluates I(1-X)(B,A) for A very small.
    // c
    // C     APSER YIELDS THE INCOMPLETE BETA RATIO I(SUB(1-X))(B,A) FOR
    // C     A <= MIN(EPS,EPS*B), B*X <= 1, AND X <= 0.5. USED WHEN
    // C     A IS VERY SMALL. USE ONLY IF ABOVE INEQUALITIES ARE SATISFIED.
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //
    const g = 0.577215664901533;
    //

    let j = 0.0;
    let bx = 0.0;
    let c = 0.0;
    let s = 0.0;
    let t = 0.0;
    let tol = 0.0;
    let aj = 0.0;
    bx = b * x;
    t = x - bx;

    if (b * eps > 2e-2) {
      c = log(bx) + g + t;
    } else {
      c = log(x) + Toms708.psi(b) + g + t;
    }

    tol = 5.0 * eps * Math.abs(c);
    j = 1.0;
    s = 0.0;

    do {
      j++;
      t *= x - bx / j;
      aj = t / j;
      s += aj;
    } while (Math.abs(aj) > tol);
    //
    return -(a * (c + s));
  }

  public static basym(
    a: number,
    b: number,
    lambda: number,
    eps: number
  ): number {
    /*c*********************************************************************72
    c
    cc BASYM performs an asymptotic expansion for IX(A,B) for large A and B.
    c
    C     LAMBDA  = (A + B)*Y - B  AND EPS IS THE TOLERANCE USED.
    C     IT IS ASSUMED THAT LAMBDA IS NONNEGATIVE AND THAT
    C     A AND B ARE GREATER THAN OR EQUAL TO 15.
    C
    c  Reference:
    c
    c    Armido Didonato, Alfred Morris,
    c    Algorithm 708: 
    c    Significant Digit Computation of the Incomplete Beta Function Ratios,
    c    ACM Transactions on Mathematical Software,
    c    Volume 18, Number 3, 1992, pages 360-373.
    c*/
    //double J0, J1, LAMBDA;

    let a0 = new Array<number>(21).fill(0);
    let b0 = new Array<number>(21).fill(0);
    let c = new Array<number>(21).fill(0);
    let d = new Array<number>(21).fill(0);

    // C
    // C  NUM IS THE MAXIMUM VALUE THAT N CAN TAKE IN THE DO LOOP
    // C  ENDING AT ST<<<<ATEMENT 50. IT IS REQUIRED THAT NUM BE EVEN.
    // C  THE ARRAYS A0, B0, C, D HAVE DIMENSION NUM + 1.
    // C
    let num = 20;
    // C
    // C  E0  = 2/SQRT(PI)
    // C  E1  = 2**(-3/2)
    // C
    const e0 = 1.12837916709551;
    const e1 = 0.353553390593274;

    let h;
    let r0;
    let r1;
    let w0;

    if (a <= b) {
      h = a / b;
      r0 = 1.0 / (1.0 + h);
      r1 = (b - a) / b;
      w0 = 1.0 / Math.sqrt(a * (1.0 + h));
    } else {
      h = b / a;
      r0 = 1.0 / (1.0 + h);
      r1 = (b - a) / a;
      w0 = 1.0 / Math.sqrt(b * (1.0 + h));
    }

    let f = a * Toms708.rlog1(-lambda / a) + b * Toms708.rlog1(lambda / b);
    let t = Math.exp(-f);
    if (t === 0.0) return 0;

    let z0 = Math.sqrt(f);
    let z = 0.5 * (z0 / e1);
    let z2 = f + f;

    a0[0] = 2.0 / 3.0 * r1;
    c[0] = -0.5 * a0[0];
    d[0] = -c[0];
    let j0 = 0.5 / e0 * Toms708.erfc1(1, z0);
    let j1 = e1;
    let sum = j0 + d[0] * w0 * j1;

    let s = 1.0;
    let h2 = h * h;
    let hn = 1.0;
    let w = w0;
    let znm1 = z;
    let zn = z2;

    for (let n = 2; n <= num; n += 2) {
      hn = h2 * hn;
      a0[n] = 2.0 * r0 * (1.0 + h * hn) / (n + 2.0);
      let np1 = n + 1;
      s = s + hn;
      a0[np1] = 2.0 * r1 * s / (n + 3.0);

      for (let i = n; i <= np1; i++) {
        let r = -0.5 * (i + 1.0);
        b0[1] = r * a0[1];

        for (let m = 2; m <= i; m++) {
          let bsum = 0.0;
          let mm1 = m - 1;

          for (let j = 1; j <= mm1; j++) {
            let mmj = m - j;
            bsum = bsum + (j * r - mmj) * a0[j] * b0[mmj];
          }

          b0[m] = r * a0[m] + bsum / m;
        }

        c[i] = b0[i] / (i + 1.0);

        let dsum = 0.0;
        let im1 = i - 1;

        for (let j = 1; j <= im1; j++) {
          let imj = i - j;
          dsum = dsum + d[imj] * c[j];
        }

        d[i] = -(dsum + c[i]);
      }

      j0 = e1 * znm1 + (n - 1.0) * j0;
      j1 = e1 * zn + n * j1;
      znm1 = z2 * znm1;
      zn = z2 * zn;
      w = w0 * w;
      let t0 = d[n] * w * j0;
      w = w0 * w;
      let t1 = d[np1] * w * j1;
      sum = sum + (t0 + t1);
      if (Math.abs(t0) + Math.abs(t1) <= eps * sum) break;
    }

    let u = Math.exp(-Toms708.bcorr(a, b));
    return e0 * t * u * sum;
  }

  public static bcorr(a0: number, b0: number): number {
    //
    // c*********************************************************************72
    // C
    // cc BCORR evaluates a correction term for LN(GAMMA(A)).
    // c
    // C     EVALUATION OF  DEL(A0) + DEL(B0) - DEL(A0 + B0)  WHERE
    // C     LN(GAMMA(A)) = (A - 0.5)*LN(A) - A + 0.5*LN(2*PI) + DEL(A).
    // C     IT IS ASSUMED THAT A0 .GE. 8 AND B0 .GE. 8.
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //
    const c5 = -0.165322962780713e-2;
    const c4 = 0.837308034031215e-3;
    const c3 = -0.59520293135187e-3;
    const c2 = 0.79365066682539e-3;
    const c1 = -0.277777777760991e-2;
    const c0 = 0.833333333333333e-1;
    //

    let s11 = 0.0;
    let a = 0.0;
    let b = 0.0;
    let c = 0.0;
    let h = 0.0;
    let t = 0.0;
    let w = 0.0;
    let x = 0.0;
    let s3 = 0.0;
    let s5 = 0.0;
    let s7 = 0.0;
    let x2 = 0.0;
    let s9 = 0.0;

    a = Math.min(a0, b0);
    b = Math.max(a0, b0);

    //
    h = a / b;
    c = h / (1.0 + h);
    x = 1.0 / (1.0 + h);
    x2 = x * x;

    // C
    // C  SET SN = (1 - X**N)/(1 - X)
    // C
    s3 = 1.0 + (x + x2);
    s5 = 1.0 + (x + x2 * s3);
    s7 = 1.0 + (x + x2 * s5);
    s9 = 1.0 + (x + x2 * s7);
    s11 = 1.0 + (x + x2 * s9);

    // C
    // C  SET W = DEL(B) - DEL(A + B)
    // C
    t = Math.pow(1.0 / b, 2);
    w =
      ((((c5 * s11 * t + c4 * s9) * t + c3 * s7) * t + c2 * s5) * t + c1 * s3) *
      t +
      c0;
    w = w * (c / b);

    // C
    // C  COMPUTE  DEL(A) + W
    // C
    t = Math.pow(1.0 / a, 2);
    return (((((c5 * t + c4) * t + c3) * t + c2) * t + c1) * t + c0) / a + w;
    //
  }

  public static beta_cdf_values(
    nData: NumberW,
    a: NumberW,
    b: NumberW,
    x: NumberW,
    fx: NumberW
  ): void {
    // C*********************************************************************72
    // C
    // Cc BETA_CDF_VALUES returns some values of the Beta  // CDF.
    // C
    // C  Discussion:
    // C
    // C    The incomplete Beta function may be written
    // C
    // C      BETA_INC(A,B,X) = Integral (0 to X) T**(A-1) * (1-T)**(B-1) dT
    // C                      / Integral (0 to 1) T**(A-1) * (1-T)**(B-1) dT
    // C
    // C    Thus,
    // C
    // C      BETA_INC(A,B,0.0) = 0.0
    // C      BETA_INC(A,B,1.0) = 1.0
    // C
    // C    The incomplete Beta function is also sometimes  // Called the
    // C    "modified" Beta function, or the "normalized" Beta function
    // C    or the Beta  // CDF (cumulative density function.
    // C
    // C    In Mathematica, the function  // Can be evaluated by:
    // C
    // C      BETA[X,A,B] / BETA[A,B]
    // C
    // C    The function  // Can also be evaluated by using the Statistics package:
    // C
    // C      Needs["Statistics`ContinuousDistributions`"]
    // C      dist = BetaDistribution [ a, b ]
    // C       // CDF [ dist, x ]
    // C
    // C  Modified:
    // C
    // C    04 January 2006
    // C
    // C  Author:
    // C
    // C    John Burkardt
    // C
    // C  Reference:
    // C
    // C    Milton Abramowitz and Irene Stegun,
    // C    Handbook of Mathematical Functions,
    // C    US Department of  // Commerce, 1964.
    // C
    // C    Karl Pearson,
    // C    Tables of the Incomplete Beta Function,
    // C     // Cambridge University Press, 1968.
    // C
    // C    Stephen Wolfram,
    // C    The Mathematica Book,
    // C    Fourth Edition,
    // C    Wolfram Media /  // Cambridge University Press, 1999.
    // C
    // C  Parameters:
    // C
    // C    Input/output, integer N_DATA.  The user sets N_DATA to 0 before the
    // C    first  // Call.  On each  // Call, the routine increments N_DATA by 1, and
    // C    returns the  // Corresponding data; when there is no more data, the
    // C    output value of N_DATA will be 0 again.
    // C
    // C    Output, real A, B, the parameters of the function.
    // C
    // C    Output, real X, the argument of the function.
    // C
    // C    Output, real FX, the value of the function.
    // C
    // C      implicit none

    const nMax = 42;

    const aVec = [
      0.5,
      0.5,
      0.5,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      2.0,
      2.0,
      2.0,
      2.0,
      2.0,
      2.0,
      2.0,
      2.0,
      2.0,
      5.5,
      10.0,
      10.0,
      10.0,
      10.0,
      20.0,
      20.0,
      20.0,
      20.0,
      20.0,
      30.0,
      30.0,
      40.0,
      0.1e1,
      0.1e1,
      0.1e1,
      0.1e1,
      0.1e1,
      0.1e1,
      0.1e1,
      0.1e1,
      0.2e1,
      0.3e1,
      0.4e1,
      0.5e1
    ];

    const bVec = [
      0.5,
      0.5,
      0.5,
      0.5,
      0.5,
      0.5,
      0.5,
      1.0,
      2.0,
      2.0,
      2.0,
      2.0,
      2.0,
      2.0,
      2.0,
      2.0,
      2.0,
      5.0,
      0.5,
      5.0,
      5.0,
      10.0,
      5.0,
      10.0,
      10.0,
      20.0,
      20.0,
      10.0,
      10.0,
      20.0,
      0.5,
      0.5,
      0.5,
      0.5,
      0.2e1,
      0.3e1,
      0.4e1,
      0.5e1,
      0.2e1,
      0.2e1,
      0.2e1,
      0.2e1
    ];

    const fxVec = [
      0.6376856085851985e-1,
      0.2048327646991335,
      0.1e1,
      0.0,
      0.5012562893380045e-2,
      0.513167019494862e-1,
      0.2928932188134525,
      0.5,
      0.28e-1,
      0.104,
      0.216,
      0.352,
      0.5,
      0.648,
      0.784,
      0.896,
      0.972,
      0.4361908850559777,
      0.1516409096347099,
      0.8978271484375e-1,
      0.1e1,
      0.5,
      0.4598773297575791,
      0.2146816102371739,
      0.9507364826957875,
      0.5,
      0.8979413687105918,
      0.2241297491808366,
      0.7586405487192086,
      0.7001783247477069,
      0.513167019494862e-1,
      0.1055728090000841,
      0.1633399734659245,
      0.2254033307585166,
      0.36,
      0.488,
      0.5904,
      0.67232,
      0.216,
      0.837e-1,
      0.3078e-1,
      0.10935e-1
    ];

    const xVec = [
      0.01,
      0.1,
      1.0,
      0.0,
      0.01,
      0.1,
      0.5,
      0.5,
      0.1,
      0.2,
      0.3,
      0.4,
      0.5,
      0.6,
      0.7,
      0.8,
      0.9,
      0.5,
      0.9,
      0.5,
      1.0,
      0.5,
      0.8,
      0.6,
      0.8,
      0.5,
      0.6,
      0.7,
      0.8,
      0.7,
      0.1,
      0.2,
      0.3,
      0.4,
      0.2,
      0.2,
      0.2,
      0.2,
      0.3,
      0.3,
      0.3,
      0.3
    ];

    if (nData.val < 0) nData.val = 0;

    nData.val++;

    if (nData.val > nMax) {
      nData.val = 0;

      a.val = b.val = x.val = fx.val = 0.0;
    } else {
      a.val = aVec[nData.val - 1];
      b.val = bVec[nData.val - 1];
      x.val = xVec[nData.val - 1];
      fx.val = fxVec[nData.val - 1];
    }
  }

  public static betaln(a0: number, b0: number): number {
    //
    // c*********************************************************************72
    // c
    // cc BETALN evaluates the logarithm of the Beta function.
    // C
    // C     E = 0.5*LN(2*PI)
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //
    const e = 0.918938533204673;

    let a = 0.0;
    let b = 0.0;
    let c = 0.0;
    let h = 0.0;
    let i = 0;
    let n = 0;
    let u = 0.0;
    let v = 0.0;
    let w = 0.0;
    let z = 0.0;

    a = Math.min(a0, b0);
    b = Math.max(a0, b0);

    if (a < 1) {
      // C
      // C  PROCEDURE WHEN A .LT. 1
      // C
      if (b < 8.0) return Toms708.gamln(a) + Toms708.algdiv(a, b);
      else return Toms708.gamln(a) + Toms708.gamln(b) - Toms708.gamln(a + b);
    } else if (a >= 1 && a < 8) {
      // C
      // C  PROCEDURE WHEN 1 <= A .LT. 8
      // C
      if (a < 2 && b < 2) {
        return Toms708.gamln(a) + Toms708.gamln(b) - Toms708.gsumln(a, b);
      } else if (b > 2) {
        w = 0.0;
        if (b < 8.0) {
          // C
          // C  REDUCTION OF B WHEN B .LT. 8
          // C
          n = trunc(b - 1.0);
          z = 1.0;

          for (i = 1; i <= n; i++) {
            b--;
            z *= b / (a + b);
          }

          return (
            w +
            log(z) +
            (Toms708.gamln(a) + Toms708.gamln(b) - Toms708.gsumln(a, b))
          );
        } else return Toms708.gamln(a) + Toms708.algdiv(a, b);
      } else if (a > 2) {
        if (b > 1000.0) {
          // C
          // C  REDUCTION OF A WHEN B .GT. 1000
          // C
          n = trunc(a - 1.0);
          w = 1.0;

          for (i = 1; i <= n; i++) {
            a--;
            w = w * (a / (1.0 + a / b));
          }

          return (
            log(w) - n * log(b) + (Toms708.gamln(a) + Toms708.algdiv(a, b))
          );
        }

        // C
        // C  REDUCTION OF A WHEN B <= 1000
        // C

        n = trunc(a - 1.0);
        w = 1.0;

        for (i = 1; i <= n; i++) {
          a--;
          h = a / b;
          w *= h / (1.0 + h);
        }

        w = log(w);
        if (b < 8.0) {
          // C
          // C  REDUCTION OF B WHEN B .LT. 8
          // C
          n = trunc(b - 1.0);
          z = 1.0;

          for (i = 1; i <= n; i++) {
            b--;
            z *= b / (a + b);
          }

          return (
            w +
            log(z) +
            (Toms708.gamln(a) + Toms708.gamln(b) - Toms708.gsumln(a, b))
          );
        } else return w + Toms708.gamln(a) + Toms708.algdiv(a, b);
      }
    } //else
    // C
    // C  PROCEDURE WHEN A .GE. 8
    // C
    w = Toms708.bcorr(a, b);
    h = a / b;
    c = h / (1.0 + h);
    u = -((a - 0.5) * log(c));
    v = b * Toms708.alnrel(h);

    if (u > v) return -0.5 * log(b) + e + w - u - v;
    else return -0.5 * log(b) + e + w - v - u;
  }

  public static bfrac(
    a: number,
    b: number,
    x: number,
    y: number,
    lambda: number,
    eps: number
  ) {
    //
    // c*********************************************************************72
    // c
    // cc BFRAC: continued fraction expansion for IX(A,B) when A and B are grea
    // c
    // C     IT IS ASSUMED THAT  LAMBDA = (A + B)*Y - B.
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //

    let n = 0.0;
    let yp1 = 0.0;
    let alpha = 0.0;
    let c = 0.0;
    let e = 0.0;
    let p = 0.0;
    let r = 0.0;
    let s = 0.0;
    let t = 0.0;
    let w = 0.0;
    let c0 = 0.0;
    let c1 = 0.0;
    let anp1 = 0.0;
    let bnp1 = 0.0;
    let r0 = 0.0;
    let beta = 0.0;
    let an = 0.0;
    let bn = 0.0;

    let dResult = Toms708.brcomp(a, b, x, y);

    if (dResult === 0.0) return 0;
    //
    c = 1.0 + lambda;
    c0 = b / a;
    c1 = 1.0 + 1.0 / a;
    yp1 = y + 1.0;
    //
    n = 0.0;
    p = 1.0;
    s = a + 1.0;
    an = 0.0;
    bn = 1.0;
    anp1 = 1.0;
    bnp1 = c / c1;
    r = c1 / c;

    // C
    // C  CONTINUED FRACTION CALCULATION
    // C

    while (true) {
      n++;
      t = n / a;
      w = n * (b - n) * x;
      e = a / s;
      alpha = p * (p + c0) * e * e * (w * x);
      e = (1.0 + t) / (c1 + t + t);
      beta = n + w / s + e * (c + n * yp1);
      p = 1.0 + t;
      s = s + 2.0;
      // C
      // C  UPDATE AN, BN, ANP1, AND BNP1
      // C
      t = alpha * an + beta * anp1;
      an = anp1;
      anp1 = t;
      t = alpha * bn + beta * bnp1;
      bn = bnp1;
      bnp1 = t;
      //
      r0 = r;
      r = anp1 / bnp1;
      if (Math.abs(r - r0) <= eps * r) break;

      // C
      // C  RESCALE AN, BN, ANP1, AND BNP1
      // C
      an = an / bnp1;
      bn = bn / bnp1;
      anp1 = r;
      bnp1 = 1.0;
    }
    // C
    // C  Termination
    // c
    dResult *= r;

    return dResult;
  }

  public static bgrat(
    a: number,
    b: number,
    x: number,
    y: number,
    w: NumberW,
    eps: number,
    ierr: NumberW
  ) {
    //
    // c*********************************************************************72
    // c
    // cc BGRAT uses asymptotic expansion for IX(A,B) when B < A.
    // c
    // C     ASYMPTOTIC EXPANSION FOR IX(A,B) WHEN A IS LARGER THAN B.
    // C     THE RESULT OF THE EXPANSION IS ADDED TO W. IT IS ASSUMED
    // C     THAT A .GE. 15 AND B <= 1.  EPS IS THE TOLERANCE USED.
    // C     IERR IS A VARIABLE THAT REPORTS THE STATUS OF THE RESULTS.
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //

    let j = 0.0;
    let l = 0.0;
    let lnx = 0.0;
    let nu = 0.0;
    let n2 = 0.0;
    let c = new Array<number>(30);
    let d = new Array<number>(30);
    let bm1 = 0.0;
    let nm1 = 0;
    let i = 0;
    let n = 0;
    //double p = 0.0;
    let q = 0.0;
    let r = 0.0;
    let s = 0.0;
    let t = 0.0;
    let u = 0.0;
    let v = 0.0;
    let z = 0.0;
    let sum = 0.0;
    let bp2n = 0.0;
    let t2 = 0.0;
    let coef = 0.0;
    let dj = 0.0;
    let cn = 0.0;

    bm1 = b - 0.5 - 0.5;
    nu = a + 0.5 * bm1;

    if (y <= 0.375) {
      lnx = Toms708.alnrel(-y);
    } else {
      lnx = log(x);
    }

    z = -(nu * lnx);

    if (b * z !== 0.0) {
      // C
      // C  COMPUTATION OF THE EXPANSION
      // C  SET R = EXP(-Z)*Z**B/GAMMA(B)
      // C
      r = b * (1.0 + Toms708.gam1(b)) * Math.exp(b * log(z));
      r *= Math.exp(a * lnx) * Math.exp(0.5 * bm1 * lnx);
      u = Toms708.algdiv(b, a) + b * log(nu);
      u = r * Math.exp(-u);

      if (u === 0.0) {
        ierr.val = 1;
        return;
      }

      let p1 = new NumberW(0);
      let q1 = new NumberW(0);
      Toms708.grat1(b, z, r, p1, q1, eps);

      // p = p1.val; // not necessary since p is never used
      q = q1.val;
      //
      v = 0.25 * Math.pow(1.0 / nu, 2);
      t2 = 0.25 * lnx * lnx;
      l = w.val / u;
      j = q / r;
      sum = j;
      t = 1.0;
      cn = 1.0;
      n2 = 0.0;

      for (n = 1; n <= 30; n++) {
        bp2n = b + n2;
        j = (bp2n * (bp2n + 1.0) * j + (z + bp2n + 1.0) * t) * v;
        n2 = n2 + 2.0;
        t *= t2;
        cn /= n2 * (n2 + 1.0);
        c[n - 1] = cn;
        s = 0.0;

        if (n !== 1) {
          nm1 = n - 1;
          coef = b - n;
          for (i = 1; i <= nm1; i++) {
            s += coef * c[i - 1] * d[n - i - 1];
            coef += b;
          }
        }

        d[n - 1] = bm1 * cn + s / n;
        dj = d[n - 1] * j;
        sum += dj;

        if (sum <= 0.0) {
          ierr.val = 1;
          return;
        }

        if (Math.abs(dj) <= eps * (sum + l)) {
          break;
        }
      }
      // C
      // C  ADD THE RESULTS TO W
      // C

      ierr.val = 0;
      w.val += u * sum;
      return;
    } else {
      // C
      // C  The expansion cannot be computed
      // c
      ierr.val = 1;
      return;
    }
  }

  public static brcomp(a: number, b: number, x: number, y: number) {
    // C*********************************************************************72
    // C
    // Cc BRCOMP evaluates X**A*Y**B/BETA(A,B).
    // C
    // C  Reference:
    // C
    // C    Armido Didonato, Alfred Morris,
    // C    Algorithm 708:
    // C    Significant Digit // Computation of the Incomplete Beta Function Ratios,
    // C    ACM Transactions on Mathematical Software,
    // C    Volume 18, Number 3, 1992, pages 360-373.
    // C
    // C
    // C  // CONST = 1/SQRT(2*PI)
    // C
    const Const = 0.398942280401433;

    if (x === 0.0 || y === 0.0) return 0;

    let b0;
    let a0 = Math.min(a, b);
    let lnx;
    let lny;
    let c;

    if (a0 < 8.0) {
      if (x <= 0.375) {
        lnx = log(x);
        lny = Toms708.alnrel(-x);
      } else {
        if (y <= 0.375) {
          lnx = Toms708.alnrel(-y);
          lny = log(y);
        } else {
          lnx = log(x);
          lny = log(y);
        }

        let z = a * lnx + b * lny;

        if (a0 >= 1.0) {
          z -= Toms708.betaln(a, b);
          return Math.exp(z);
        }
        // C;
        // C  procedure for a < 1 or b < 1
        // C
        b0 = Math.max(a, b);

        if (b0 < 8.0) {
          if (b0 <= 1.0) {
            // C
            // C  algorithm for b0 <= 1
            // C
            let dResult = Math.exp(z);
            if (dResult === 0.0) return 0;

            let apb = a + b;
            if (apb <= 1.0) {
              z = 1.0 + Toms708.gam1(apb);
            } else {
              let u = a + b - 1.0;
              z = (1.0 + Toms708.gam1(u)) / apb;
            }
            c = (1.0 + Toms708.gam1(a)) * (1.0 + Toms708.gam1(b)) / z;
            dResult *= a0 * c / (1.0 + a0 / b0);
            return dResult;
          }
        } else {
          let u = Toms708.gamln1(a0);
          let n = b0 - 1.0;
          if (n >= 1) {
            c = 1.0;
            for (let i = 1; i <= n; i++) {
              b0--;
              c *= b0 / (a0 + b0);
            }
            u = log(c) + u;
          }
          z -= u;
          b0--;
          let apb = a0 + b0;
          let t;

          if (apb <= 1.0) {
            t = 1.0 + Toms708.gam1(apb);
          } else {
            u = a0 + b0 - 1.0;
            t = (1.0 + Toms708.gam1(u)) / apb;
          }
          return a0 * Math.exp(z) * (1.0 + Toms708.gam1(b0)) / t;
        }
        // C
        // C  algorithm for b0 >= 8
        // C
        let u = Toms708.gamln1(a0) + Toms708.algdiv(a0, b0);
        return a0 * Math.exp(z - u);
      }
    }
    // C
    // C  procedure for a >= 8 and b >= 8
    // C
    let x0;
    let y0;
    let lambda;
    let e;
    let h;
    let u;
    let v;
    if (a <= b) {
      h = a / b;
      x0 = h / (1.0 + h);
      y0 = 1.0 / (1.0 + h);
      lambda = a - (a + b) * x;
    } else {
      h = b / a;
      x0 = 1.0 / (1.0 + h);
      y0 = h / (1.0 + h);
      lambda = (a + b) * y - b;
    }
    e = -lambda / a;
    if (Math.abs(e) <= 0.6) {
      u = Toms708.rlog1(e);
    } else {
      u = e - log(x / x0);
    }

    e = lambda / b;

    if (Math.abs(e) > 0.6) {
      v = Toms708.rlog1(e);
    } else {
      v = e - log(y / y0);
    }

    let z = Math.exp(-(a * u + b * v));
    return Const * Math.sqrt(b * x0) * z * Math.exp(-Toms708.bcorr(a, b));
  }

  public static brcmp1(mu: number, a: number, b: number, x: number, y: number) {
    // C*********************************************************************
    // C
    // C BRCMP1 evaluates EXP(MU) * (X**A*Y**B/BETA(A,B)).
    // C
    // C  Reference:
    // C
    // C    Armido Didonato, Alfred Morris,
    // C    Algorithm 708:
    // C    Significant Digit Computation of the Incomplete Beta Function Ratios,
    // C    ACM Transactions on Mathematical Software,
    // C    Volume 18, Number 3, 1992, pages 360-373.
    // C

    // C  const = 1/sqrt(2*pi)
    // C
    const invSqrtPi = 0.398942280401433;
    let c;
    let u;
    let apb;

    let a0 = Math.min(a, b);

    if (a0 < 8.0) {
      let lnx;
      let lny;

      if (x <= 0.375) {
        lnx = log(x);
        lny = Toms708.alnrel(-x);
      } else {
        if (y <= 0.375) {
          lnx = Toms708.alnrel(-y);
          lny = log(y);
        } else {
          lnx = log(x);
          lny = log(y);
        }
      }

      let z = a * lnx + b * lny;
      if (a0 <= 1.0) {
        z -= Toms708.betaln(a, b);
        return Toms708.esum(mu, z);
      }
      // C
      // C  procedure for a < 1 or b < 1
      // C
      let b0 = Math.max(a, b);
      if (b0 >= 8.0) {
        u = Toms708.gamln1(a0) + Toms708.algdiv(a0, b0);
        return a0 * Toms708.esum(mu, z - u);
      }

      if (b0 <= 1.0) {
        // C
        // C  algorithm for b0 <= 1
        // C
        let dResult = Toms708.esum(mu, z);

        if (dResult === 0.0) return 0;

        apb = a + b;

        if (apb <= 1.0) {
          z = 1.0 + Toms708.gam1(apb);
        } else {
          u = a + b - 1.0;
          z = (1.0 + Toms708.gam1(u)) / apb;
        }

        c = (1.0 + Toms708.gam1(a)) * (1.0 + Toms708.gam1(b)) / z;
        dResult *= a0 * c / (1.0 + a0 / b0);
        return dResult;
      }
      // C
      // C  algorithm for 1 < b0 < 8
      // C

      u = Toms708.gamln1(a0);
      let n = trunc(b0 - 1.0);

      if (n >= 1) {
        c = 1.0;
        for (let i = 1; i <= n; i++) {
          b0 -= 1.0;
          c = c * (b0 / (a0 + b0));
        }
        u = log(c) + u;
      }

      z -= u;
      b0 -= 1.0;
      apb = a0 + b0;
      let t;

      if (apb <= 1.0) {
        t = 1.0 + Toms708.gam1(apb);
      } else {
        u = a0 + b0 - 1.0;
        t = (1.0 + Toms708.gam1(u)) / apb;
      }
      return a0 * Toms708.esum(mu, z) * (1.0 + Toms708.gam1(b0)) / t;
    }
    // C
    // C  procedure for a= 8 and b >= 8
    // C

    let h;
    let x0;
    let y0;
    let lambda;

    if (a <= b) {
      h = a / b;
      x0 = h / (1.0 + h);
      y0 = 1.0 / (1.0 + h);
      lambda = a - (a + b) * x;
    } else {
      h = b / a;
      x0 = 1.0 / (1.0 + h);
      y0 = h / (1.0 + h);
      lambda = (a + b) * y - b;
    }

    let e = -lambda / a;

    if (Math.abs(e) <= 0.6) {
      u = Toms708.rlog1(e);
    } else {
      u = e - log(x / x0);
    }

    e = lambda / b;
    let v;

    if (Math.abs(e) <= 0.6) {
      v = Toms708.rlog1(e);
    } else {
      v = e - log(y / y0);
    }

    let z = Toms708.esum(mu, -(a * u + b * v));
    return invSqrtPi * Math.sqrt(b * x0) * z * Math.exp(-Toms708.bcorr(a, b));
  }

  public static bpser(a: number, b: number, x: number, eps: number) {
    //
    // c*********************************************************************72
    // c
    // cc BPSER evaluates IX(A,B) when B <= 1 or B*X <= 0.7.
    // c
    // C     POWER SERIES EXPANSION FOR EVALUATING IX(A,B) WHEN B <= 1
    // C     OR B*X <= 0.7.  EPS IS THE TOLERANCE USED.
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //

    let n = 0.0;
    let apb = 0.0;
    let c = 0.0;
    let i = 0;
    let m = 0;
    let t = 0.0;
    let u = 0.0;
    let w = 0.0;
    let z = 0.0;
    let tol = 0.0;
    let sum = 0.0;
    let a0 = 0.0;
    let b0 = 0.0;
    let dResult = 0;

    if (x === 0.0) {
      return 0;
    }
    // C
    // C  COMPUTE THE FACTOR X**A/(A*BETA(A,B))
    // C
    a0 = Math.min(a, b);
    if (a0 >= 1.0) {
      z = a * log(x) - Toms708.betaln(a, b);
      dResult = Math.exp(z) / a;
    } else {
      b0 = Math.max(a, b);
      if (b0 < 8.0) {
        if (b0 <= 1.0) {
          // C
          // C  PROCEDURE FOR A0 .LT. 1 AND B0 <= 1
          // C
          dResult = Math.pow(x, a);
          if (dResult === 0.0) {
            return 0;
          }
          //
          apb = a + b;
          if (apb <= 1.0) {
            z = 1.0 + Toms708.gam1(apb);
          } else {
            u = a + b - 1.0;
            z = (1.0 + Toms708.gam1(u)) / apb;
          } //
          c = (1.0 + Toms708.gam1(a)) * (1.0 + Toms708.gam1(b)) / z;
          dResult *= c * (b / apb);
        } else {
          // C
          // C  PROCEDURE FOR A0 .LT. 1 AND 1 .LT. B0 .LT. 8
          // C
          //label40:
          //	Dummy.label("Bpser",40);
          u = Toms708.gamln1(a0);
          m = trunc(b0 - 1.0);

          if (m >= 1) {
            c = 1.0;
            for (i = 1; i <= m; i++) {
              b0--;
              c *= b0 / (a0 + b0);
            }
            u = log(c) + u;
          }

          z = a * log(x) - u;
          b0--;
          apb = a0 + b0;

          if (apb <= 1.0) {
            t = 1.0 + Toms708.gam1(apb);
          } else {
            u = a0 + b0 - 1.0;
            t = (1.0 + Toms708.gam1(u)) / apb;
          }
          dResult = Math.exp(z) * (a0 / a) * (1.0 + Toms708.gam1(b0)) / t;
        }
      } else {
        // b0>8
        // C
        // C  PROCEDURE FOR A0 .LT. 1 AND B0 .GE. 8
        // C
        u = Toms708.gamln1(a0) + Toms708.algdiv(a0, b0);
        z = a * log(x) - u;
        dResult = a0 / a * Math.exp(z);
      }
    }
    if (dResult === 0.0 || a <= 0.1 * eps) {
      return dResult;
    }
    // C
    // C  Compute the series
    // c
    sum = 0.0;
    n = 0.0;
    c = 1.0;
    tol = eps / a;

    do {
      n++;
      c *= (0.5 + (0.5 - b / n)) * x;
      w = c / (a + n);
      sum += w;
    } while (Math.abs(w) > tol);

    dResult *= 1.0 + a * sum;
    return dResult;
  }



  public static bratio(
    a: number,
    b: number,
    x: number,
    y: number,
    w: NumberW,
    w1: NumberW,
    ierr: NumberW
  ) {
    //
    // c*********************************************************************72
    // C
    // cc BRATIO evaluates the incomplete Beta function IX(A,B).
    // c
    // c  Discussion:
    // c
    // C     IT IS ASSUMED THAT A AND B ARE NONNEGATIVE, AND THAT X <= 1
    // C     AND Y = 1 - X.  BRATIO ASSIGNS W AND W1 THE VALUES
    // C
    // C                      W  = IX(A,B)
    // C                      W1 = 1 - IX(A,B)
    // C
    // C     IERR IS A VARIABLE THAT REPORTS THE STATUS OF THE RESULTS.
    // C     IF NO INPUT ERRORS ARE DETECTED THEN IERR IS SET TO 0 AND
    // C     W AND W1 ARE COMPUTED. OTHERWISE, IF AN ERROR IS DETECTED,
    // C     THEN W AND W1 ARE ASSIGNED THE VALUE 0 AND IERR IS SET TO
    // C     ONE OF THE FOLLOWING VALUES ...
    // C
    // C        IERR = 1  IF A OR B IS NEGATIVE
    // C        IERR = 2  IF A = B = 0
    // C        IERR = 3  IF X .LT. 0 OR X .GT. 1
    // C        IERR = 4  IF Y .LT. 0 OR Y .GT. 1
    // C        IERR = 5  IF X + Y .NE. 1
    // C        IERR = 6  IF X = A = 0
    // C        IERR = 7  IF Y = B = 0
    // C
    // C     WRITTEN BY ALFRED H. MORRIS, JR.
    // C        NAVAL SURFACE WARFARE CENTER
    // C        DAHLGREN, VIRGINIA
    // C     REVISED ... NOV 1991
    // c
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    // c
    // C  EPS IS A MACHINE DEPENDENT CONSTANT. EPS IS THE SMALLEST
    // C  FLOATING POINT NUMBER FOR WHICH 1.0 + EPS .GT. 1.0
    // C

    let lambda = 0.0;
    let ind = 0;
    let n = 0;
    let t = 0.0;
    let eps = 0.0;
    let z = 0.0;
    let a0 = 0.0;
    let b0 = 0.0;
    let x0 = 0.0;
    let y0 = 0.0;
    eps = Toms708.spmpar(1);
    printer_bratio('eps is: %d', eps);
    w.val = 0.0;
    w1.val = 0.0;

    if (a < 0.0 || b < 0.0) {
      ierr.val = 1;
      return;
    }

    if (a === 0.0 && b === 0.0) {
      ierr.val = 2;
      return;
    }

    if (x < 0.0 || x > 1.0) {
      ierr.val = 3;
      return;
    }

    if (y < 0.0 || y > 1.0) {
      ierr.val = 4;
      return;
    }

    z = x + y - 0.5 - 0.5;
    if (abs(z) > 3.0 * eps) {
      ierr.val = 5;
      return;
    }

    //
    ierr.val = 0;
    if (x === 0.0) {
      if (a === 0.0) {
        ierr.val = 6;
        return;
      } else {
        w.val = 0.0;
        w1.val = 1.0;
        return;
      }
    }

    if (y === 0.0) {
      if (b === 0.0) {
        ierr.val = 7;
        return;
      } else {
        w.val = 1.0;
        w1.val = 0.0;
        return;
      }
    }

    if (a === 0.0) {
      w.val = 1.0;
      w1.val = 0.0;
      return;
    }

    if (b === 0.0) {
      w.val = 0.0;
      w1.val = 1.0;
      return;
    }

    //
    eps = Math.max(eps, 1e-15);
    if (Math.max(a, b) < 1.0e-3 * eps) {
      w.val = b / (a + b);
      w1.val = a / (a + b);
      return;
    }
    //
    ind = 0;
    a0 = a;
    b0 = b;
    x0 = x;
    y0 = y;

    if (min(a0, b0) <= 1.0) {
      // C
      // C  PROCEDURE FOR A0 <= 1 OR B0 <= 1
      // C
      if (x <= 0.5) {
        ind = 1;
        a0 = b;
        b0 = a;
        x0 = y;
        y0 = x;
      }
      //

      if (b0 < min(eps, eps * a0)) {
        w.val = Toms708.fpser(a0, b0, x0, eps);
        w1.val = 0.5 + (0.5 - w.val);

        if (ind === 0) {
          return;
        } else {
          t = w.val;
          w.val = w1.val;
          w1.val = t;
          return;
        }
      }
      if (a0 < min(eps, eps * b0) && b0 * x0 <= 1.0) {
        w1.val = Toms708.apser(a0, b0, x0, eps);
        w.val = 0.5 + (0.5 - w1.val);

        if (ind === 0) {
          return;
        } else {
          t = w.val;
          w.val = w1.val;
          w1.val = t;
          return;
        }
      }

      if (Math.max(a0, b0) <= 1.0) {
        if (a0 >= Math.min(0.2, b0) || Math.pow(x0, a0) <= 0.9) {
          w.val = Toms708.bpser(a0, b0, x0, eps);
          w1.val = 0.5 + (0.5 - w.val);

          if (ind === 0) {
            return;
          } else {
            t = w.val;
            w.val = w1.val;
            w1.val = t;
            return;
          }
        }

        if (x0 >= 0.3) {
          w1.val = Toms708.bpser(b0, a0, y0, eps);
          w.val = 0.5 + (0.5 - w1.val);

          if (ind === 0) {
            return;
          } else {
            t = w.val;
            w.val = w1.val;
            w1.val = t;
            return;
          }
        }

        n = 20;
        w1.val = Toms708.bup(b0, a0, y0, x0, n, eps);
        b0 += n;

        let ierr1 = new NumberW(0);

        Toms708.bgrat(b0, a0, y0, x0, w1, 15.0 * eps, ierr1);
        w.val = 0.5 + (0.5 - w1.val);

        if (ind === 0) {
          return;
        } else {
          t = w.val;
          w.val = w1.val;
          w1.val = t;
          return;
        }

        //
      }

      if (b0 <= 1.0) {
        w.val = Toms708.bpser(a0, b0, x0, eps);
        w1.val = 0.5 + (0.5 - w.val);

        if (ind === 0) {
          return;
        } else {
          t = w.val;
          w.val = w1.val;
          w1.val = t;
          return;
        }
      }

      if (x0 >= 0.3) {
        w1.val = Toms708.bpser(b0, a0, y0, eps);
        w.val = 0.5 + (0.5 - w1.val);

        if (ind === 0) {
          return;
        } else {
          t = w.val;
          w.val = w1.val;
          w1.val = t;
          return;
        }
      }

      if (x0 < 0.1) {
        if (pow(x0 * b0, a0) <= 0.7) {
          w.val = Toms708.bpser(a0, b0, x0, eps);
          w1.val = 0.5 + (0.5 - w.val);

          if (ind === 0) {
            return;
          } else {
            t = w.val;
            w.val = w1.val;
            w1.val = t;
            return;
          }
        }
      }

      if (b0 > 15.0) {
        let ierr1 = new NumberW(0);

        Toms708.bgrat(b0, a0, y0, x0, w1, 15.0 * eps, ierr1);
        w.val = 0.5 + (0.5 - w1.val);

        if (ind === 0) {
          return;
        } else {
          t = w.val;
          w.val = w1.val;
          w1.val = t;
          return;
        }
      }

      n = 20;
      w1.val = Toms708.bup(b0, a0, y0, x0, n, eps);
      b0 += n;

      let ierr1 = new NumberW(0);

      Toms708.bgrat(b0, a0, y0, x0, w1, 15.0 * eps, ierr1);
      w.val = 0.5 + (0.5 - w1.val);

      if (ind === 0) {
        return;
      } else {
        t = w.val;
        w.val = w1.val;
        w1.val = t;
        return;
      }
    }

    // C
    // C  PROCEDURE FOR A0 .GT. 1 AND B0 .GT. 1
    // C

    if (a <= b) {
      lambda = a - (a + b) * x;
    } else {
      lambda = (a + b) * y - b;
    }

    if (lambda < 0.0) {
      ind = 1;
      a0 = b;
      b0 = a;
      x0 = y;
      y0 = x;
      lambda = abs(lambda);
    }

    if (b0 < 40.0 && b0 * x0 <= 0.7) {
      w.val = Toms708.bpser(a0, b0, x0, eps);
      w1.val = 0.5 + (0.5 - w.val);

      if (ind === 0) {
        return;
      } else {
        t = w.val;
        w.val = w1.val;
        w1.val = t;
        return;
      }
    }

    if (b0 < 40.0) {
      n = Math.trunc(b0);
      b0 -= n;

      if (b0 === 0.0) {
        n--;
        b0 = 1.0;
      }

      w.val = Toms708.bup(b0, a0, y0, x0, n, eps);

      if (x0 <= 0.7) {
        w.val += Toms708.bpser(a0, b0, x0, eps);
        w1.val = 0.5 + (0.5 - w.val);

        if (ind === 0) {
          return;
        } else {
          t = w.val;
          w.val = w1.val;
          w1.val = t;
          return;
        }
      }
      if (a0 <= 15.0) {
        n = 20;
        w.val += Toms708.bup(a0, b0, x0, y0, n, eps);
        a0 += n;
      }

      let ierr1 = new NumberW(0);

      Toms708.bgrat(a0, b0, x0, y0, w, 15.0 * eps, ierr1);
      w1.val = 0.5 + (0.5 - w.val);

      if (ind === 0) {
        return;
      } else {
        t = w.val;
        w.val = w1.val;
        w1.val = t;
        return;
      }
    }

    if (a0 <= b0) {
      if (a0 <= 100.0) {
        w.val = Toms708.bfrac(a0, b0, x0, y0, lambda, 15.0 * eps);
        w1.val = 0.5 + (0.5 - w.val);

        if (ind === 0) {
          return;
        } else {
          t = w.val;
          w.val = w1.val;
          w1.val = t;
          return;
        }
      }

      if (lambda > 0.03 * a0) {
        w.val = Toms708.bfrac(a0, b0, x0, y0, lambda, 15.0 * eps);
        w1.val = 0.5 + (0.5 - w.val);

        if (ind === 0) {
          return;
        } else {
          t = w.val;
          w.val = w1.val;
          w1.val = t;
          return;
        }
      }

      w.val = Toms708.basym(a0, b0, lambda, 100.0 * eps);
      w1.val = 0.5 + (0.5 - w.val);

      if (ind === 0) {
        return;
      } else {
        t = w.val;
        w.val = w1.val;
        w1.val = t;
        return;
      }
    } else {
      if (b0 <= 100.0 || lambda > 0.03 * b0) {
        w.val = Toms708.bfrac(a0, b0, x0, y0, lambda, 15.0 * eps);
        w1.val = 0.5 + (0.5 - w.val);

        if (ind === 0) {
          return;
        } else {
          t = w.val;
          w.val = w1.val;
          w1.val = t;
          return;
        }
      }

      w.val = Toms708.basym(a0, b0, lambda, 100.0 * eps);
      w1.val = 0.5 + (0.5 - w.val);

      if (ind === 0) {
        return;
      } else {
        t = w.val;
        w.val = w1.val;
        w1.val = t;
        return;
      }
    }
  }

  static bup(
    a: number,
    b: number,
    x: number,
    y: number,
    n: number,
    eps: number
  ) {
    //
    // c*********************************************************************72
    // c
    // cc BUP evaluates IX(A,B) - IX(A + N,B), where N is a positive integer.
    // c
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360 - 373.
    // c
    // C     EPS IS THE TOLERANCE USED.
    // C
    // C
    // C  OBTAIN THE SCALING FACTOR EXP(-MU) AND EXP(MU)*(X**A*Y**B/BETA(A,B))/
    // C

    let dResult;

    let mu = 0;
    let d = 1.0;
    let t = 0;
    let r = 0;
    let w = 0;

    let k;
    let l;
    let apb = a + b;
    let ap1 = a + 1.0;

    if (n !== 1 && a > 1.0) {
      if (apb >= 1.1 * ap1) {
        mu = trunc(Math.abs(Toms708.exparg(1)));
        k = trunc(Toms708.exparg(0));

        if (k < mu) {
          mu = k;
        }

        t = mu;
        d = Math.exp(-t);
      }
    }

    dResult = Toms708.brcmp1(mu, a, b, x, y) / a;

    if (n === 1 || dResult === 0.0) {
      return dResult;
    }

    let nm1 = n - 1;
    w = d;

    // C
    // C  LET K BE THE INDEX OF THE MAXIMUM TERM
    // C

    k = 0;
    if (b <= 1.0) {
      let kp1 = k + 1;

      for (let i = kp1; i <= nm1; i++) {
        l = i - 1;
        d = (apb + l) / (ap1 + l) * x * d;
        w += d;

        if (d <= eps * w) break;
      }

      return dResult * w;
    }

    if (y > 1.0e-4) {
      r = (b - 1.0) * x / y - a;

      if (r < 1.0) {
        let kp1 = k + 1;

        for (let i = kp1; i <= nm1; i++) {
          l = i - 1;
          d = (apb + l) / (ap1 + l) * x * d;
          w += d;

          if (d <= eps * w) break;
        }

        return dResult * w;
      }
      k = nm1;
      t = nm1;

      if (r < t) {
        k = trunc(r);
      }
    } else {
      k = nm1;
    }

    // C
    // C  ADD THE INCREASING TERMS OF THE SERIES
    // C
    for (let i = 1; i <= k; i++) {
      l = i - 1;
      d = (apb + l) / (ap1 + l) * x * d;
      w += d;
    }

    if (k === nm1) {
      return dResult * w;
    }

    // C
    // C  ADD THE REMAINING TERMS OF THE SERIES
    // C

    let kp1 = k + 1;

    for (let i = kp1; i <= nm1; i++) {
      l = i - 1;
      d = (apb + l) / (ap1 + l) * x * d;
      w += d;

      if (d <= eps * w) break;
    }

    return dResult * w;
  }

  public static erf(x: number): number {
    //
    // c*********************************************************************72
    // c
    // cc ERF evaluates the error function.
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //
    //
    const c = 0.564189583547756;
    //
    const a = [
      0.77105849500132e-4,
      -0.133733772997339e-2,
      0.323076579225834e-1,
      0.479137145607681e-1,
      0.128379167095513
    ];

    const b = [0.301048631703895e-2, 0.538971687740286e-1, 0.375795757275549]; //

    const p = [
      -1.36864857382717e-7,
      5.64195517478974e-1,
      7.21175825088309,
      4.31622272220567e1,
      1.5298928504694e2,
      3.39320816734344e2,
      4.51918953711873e2,
      3.00459261020162e2
    ];

    const q = [
      1.0,
      1.27827273196294e1,
      7.70001529352295e1,
      2.77585444743988e2,
      6.38980264465631e2,
      9.3135409485061e2,
      7.90950925327898e2,
      3.00459260956983e2
    ]; //

    const r = [
      2.10144126479064,
      2.62370141675169e1,
      2.13688200555087e1,
      4.6580782871847,
      2.82094791773523e-1
    ];

    const s = [
      9.4153775055546e1,
      1.8711481179959e2,
      9.90191814623914e1,
      1.80124575948747e1
    ]; //

    let ax = 0.0;
    let bot = 0.0;
    let t = 0.0;
    let top = 0.0;
    let x2 = 0.0;

    ax = Math.abs(x);
    if (ax <= 0.5) {
      t = x * x;
      top = (((a[0] * t + a[1]) * t + a[2]) * t + a[3]) * t + a[4] + 1.0;
      bot = ((b[0] * t + b[1]) * t + b[2]) * t + 1.0;
      return x * (top / bot);
      //
    } else {
      if (ax <= 4.0) {
        top =
          ((((((p[0] * ax + p[1]) * ax + p[2]) * ax + p[3]) * ax + p[4]) * ax +
            p[5]) *
            ax +
            p[6]) *
          ax +
          p[7];
        bot =
          ((((((q[0] * ax + q[1]) * ax + q[2]) * ax + q[3]) * ax + q[4]) * ax +
            q[5]) *
            ax +
            q[6]) *
          ax +
          q[7];

        return x < 0
          ? -(0.5 + (0.5 - Math.exp(-x * x) * top / bot))
          : 0.5 + (0.5 - Math.exp(-x * x) * top / bot);
      } else {
        if (ax < 5.8) {
          x2 = x * x;
          t = 1.0 / x2;
          top = (((r[0] * t + r[1]) * t + r[2]) * t + r[3]) * t + r[4];
          bot = (((s[0] * t + s[2]) * t + s[3]) * t + s[3]) * t + 1.0;
          let dResult = (c - top / (x2 * bot)) / ax;
          dResult = 0.5 + (0.5 - Math.exp(-x2) * dResult);

          return x < 0 ? -dResult : dResult;
        } else {
          return Toms708.sign(1.0, x);
        }
      }
    }
  }

  public static erfc1(ind: number, x: number): number {
    //
    // c*********************************************************************72
    // c
    // cc ERFC1 evaluates the complementary error function.
    // C
    // C          ERFC1(IND,X) = ERFC(X)            IF IND = 0
    // C          ERFC1(IND,X) = EXP(X*X)*ERFC(X)   OTHERWISE
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //
    //
    const c = 0.564189583547756;
    //
    const a = [
      0.77105849500132e-4,
      -0.133733772997339e-2,
      0.323076579225834e-1,
      0.479137145607681e-1,
      0.128379167095513
    ];

    const b = [0.301048631703895e-2, 0.538971687740286e-1, 0.375795757275549];

    const p = [
      -1.36864857382717e-7,
      5.64195517478974e-1,
      7.21175825088309,
      4.31622272220567e1,
      1.5298928504694e2,
      3.39320816734344e2,
      4.51918953711873e2,
      3.00459261020162e2
    ];

    const q = [
      1.0,
      1.27827273196294e1,
      7.70001529352295e1,
      2.77585444743988e2,
      6.38980264465631e2,
      9.3135409485061e2,
      7.90950925327898e2,
      3.00459260956983e2
    ];
    //
    const r = [
      2.10144126479064,
      2.62370141675169e1,
      2.13688200555087e1,
      4.6580782871847,
      2.82094791773523e-1
    ];

    const s = [
      9.4153775055546e1,
      1.8711481179959e2,
      9.90191814623914e1,
      1.80124575948747e1
    ];

    // C
    // C  ABS(X) <= 0.5
    // C

    let dResult = 0.0;
    let w = 0.0;
    let ax = 0.0;
    let e = 0.0;
    let bot = 0.0;
    let t = 0.0;
    let top = 0.0;
    ax = Math.abs(x);

    if (ax < 0.5) {
      t = x * x;
      top = (((a[0] * t + a[1]) * t + a[2]) * t + a[3]) * t + a[4] + 1.0;
      bot = ((b[0] * t + b[1]) * t + b[2]) * t + 1.0;
      dResult = 0.5 + (0.5 - x * (top / bot));

      if (ind !== 0) dResult *= Math.exp(t);

      return dResult;
    } else if (ax <= 4 && ax >= 0.5) {
      // I don't think the and is necessary - being safe JMC
      // C
      // C  0.5 .LT. ABS(X) <= 4
      // C
      top =
        ((((((p[0] * ax + p[1]) * ax + p[2]) * ax + p[3]) * ax + p[4]) * ax +
          p[5]) *
          ax +
          p[6]) *
        ax +
        p[7];
      bot =
        ((((((q[0] * ax + q[2]) * ax + q[2]) * ax + q[3]) * ax + q[5]) * ax +
          q[5]) *
          ax +
          q[6]) *
        ax +
        q[7];
      dResult = top / bot;
    } else {
      // C
      // C  ABS(X) .GT. 4
      // C
      if (x <= -5.6) {
        // C
        // C  LIMIT VALUE FOR LARGE NEGATIVE X
        // C
        if (ind !== 0) return 2.0 * Math.exp(x * x);
        else return 2.0;
      }

      if (ind !== 0) {
        t = Math.pow(1.0 / x, 2);
        top = (((r[0] * t + r[1]) * t + r[2]) * t + r[3]) * t + r[4];
        bot = (((s[0] * t + s[2]) * t + s[3]) * t + s[3]) * t + 1.0;
        dResult = (c - t * top / bot) / ax;
      } else {
        if (x > 100.0 || x * x > -Toms708.exparg(1)) {
          // C
          // C  LIMIT VALUE FOR LARGE POSITIVE X WHEN IND = 0
          // C
          return 0;
        }
      }
    }

    // C
    // C  FINAL ASSEMBLY
    // C
    if (ind !== 0) {
      if (x < 0.0) dResult = 2.0 * Math.exp(x * x) - dResult;
      return dResult;
    }

    w = x * x;
    t = w;
    e = w - t;
    dResult *= (0.5 + (0.5 - e)) * Math.exp(-t);

    if (x < 0.0) dResult = 2.0 - dResult;

    return dResult;
  }

  public static esum(mu: number, x: number) {
    //
    // c*********************************************************************72
    // c
    // cc ESUM evaluates EXP(MU + X).
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360 - 373.
    // c
    //
    let w = 0.0;

    if (x <= 0.0) {
      if (mu < 0) {
        w = mu;
        return Math.exp(w) * Math.exp(x);
      }

      w = mu + x;

      if (w > 0.0) {
        w = mu;
        return Math.exp(w) * Math.exp(x);
      }
      return Math.exp(w);
    }

    if (mu > 0) {
      w = mu;
      return Math.exp(w) * Math.exp(x);
    }

    w = mu + x;
    if (w < 0.0) {
      w = mu;
      return Math.exp(w) * Math.exp(x);
    }

    return Math.exp(w);
  }

  public static erf_values(nData: NumberW, x: NumberW, fx: NumberW): void {
    // C*********************************************************************72
    // C
    // C ERF_VALUES returns some values of the ERF or "error" function for testing.
    // C
    // CModified:
    // C
    // C17 April 2001
    // C
    // CAuthor:
    // C
    // CJohn Burkardt
    // C
    // CParameters:
    // C
    // CInput/output, integer N_DATA.
    // COn input, if N_DATA is 0, the first test data is returned, and
    // CN_DATA is set to the index of the test data.  On each subsequent
    // Call, N_DATA is incremented and that test data is returned.  When
    // Cthere is no more test data, N_DATA is set to 0.
    // C
    // COutput, real X, the argument of the function.
    // C
    // COutput, real FX, the value of the function.
    // C
    //

    const nmax = 21;

    const bvec = [
      0.0,
      0.112462916,
      0.2227025892,
      0.3286267595,
      0.428392355,
      0.5204998778,
      0.6038560908,
      0.6778011938,
      0.7421009647,
      0.7969082124,
      0.8427007929,
      0.8802050696,
      0.9103139782,
      0.9340079449,
      0.9522851198,
      0.9661051465,
      0.9763483833,
      0.9837904586,
      0.9890905016,
      0.9927904292,
      0.995322265
    ];

    let xvec = [
      0.0,
      0.1,
      0.2,
      0.3,
      0.4,
      0.5,
      0.6,
      0.7,
      0.8,
      0.9,
      1.0,
      1.1,
      1.2,
      1.3,
      1.4,
      1.5,
      1.6,
      1.7,
      1.8,
      1.9,
      2.0
    ];

    if (nData.val < 0) nData.val = 0;

    nData.val++;

    if (nmax < nData.val) {
      nData.val = 0;
      x.val = 0.0;
      fx.val = 0.0;
    } else {
      x.val = xvec[nData.val - 1];
      fx.val = bvec[nData.val - 1];
    }
  }

  public static exparg(l: number): number {
    //
    // c*********************************************************************72
    // c
    // cc EXPARG returns the largest value for which EXP can be computed.
    // c
    // C     IF L = 0 THEN  EXPARG(L) = THE LARGEST POSITIVE W FOR WHICH
    // C     EXP(W) CAN BE COMPUTED.
    // C
    // C     IF L IS NONZERO THEN  EXPARG(L) = THE LARGEST NEGATIVE W FOR
    // C     WHICH THE COMPUTED VALUE OF EXP(W) IS NONZERO.
    // C
    // C     NOTE... ONLY AN APPROXIMATE VALUE FOR EXPARG(L) IS NEEDED.
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //

    let lnb = 0.0;
    let m = 0;
    let b = Toms708.ipmpar(4);

    switch (b) {
      case 2:
        lnb = 0.69314718055995;
        break;
      case 8:
        lnb = 2.0794415416798;
        break;
      case 16:
        lnb = 2.7725887222398;
        break;
      default:
        lnb = log(b);
        break;
    }
    //

    if (l !== 0) {
      m = Toms708.ipmpar(6);
      return 0.99999 * m * lnb;
    } else {
      m = Toms708.ipmpar(7);
      return 0.99999 * m * lnb;
    }
  }

  public static fpser(a: number, b: number, x: number, eps: number): number {
    //
    // c*********************************************************************72
    // c
    // cc FPSER uses a series for IX(A,B) with B < min(eps,eps*A) and X <= 0.5.
    // c
    // c  Discussion:
    // c
    // C                 EVALUATION OF IX(A,B)
    // C
    // C          FOR B .LT. MIN(EPS,EPS*A) AND X .LE. 0.5.
    // C
    // C
    // C                  SET  FPSER = X**A
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360 - 373.
    // c
    //

    let c: number = 0.0;
    let s: number = 0.0;
    let t: number = 0.0;
    let tol: number = 0.0;
    let an: number = 0.0;

    let dResult = 1.0;

    if (a > 1.0e-3 * eps) {
      dResult = 0.0;
      t = a * log(x);
      if (t < Toms708.exparg(1)) {
        return dResult;
      }
      dResult = Math.exp(t);
    }

    // C
    // C  NOTE THAT 1/B(A,B) = B
    // C
    dResult = b / a * dResult;
    tol = eps / a;
    an = a + 1.0;
    t = x;
    s = t / an;

    do {
      an = an + 1.0;
      t = x * t;
      c = t / an;
      s = s + c;
    } while (Math.abs(c) > tol);
    //
    return dResult * (1.0 + a * s);
  }

  static gam1(a: number): number {
    //
    // c*********************************************************************72
    // c
    // cc GAM1 evaluates 1/GAMMA(A+1) - 1  for -0.5 <= A <= 1.5
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c

    const p = [
      0.577215664901533,
      -0.409078193005776,
      -0.230975380857675,
      0.597275330452234e-1,
      0.76696818164949e-2,
      -0.514889771323592e-2,
      0.589597428611429e-3
    ];

    const q = [
      0.1e1,
      0.427569613095214,
      0.158451672430138,
      0.261132021441447e-1,
      0.423244297896961e-2
    ];

    const r = [
      -0.422784335098468,
      -0.771330383816272,
      -0.244757765222226,
      0.118378989872749,
      0.930357293360349e-3,
      -0.118290993445146e-1,
      0.223047661158249e-2,
      0.266505979058923e-3,
      -0.132674909766242e-3
    ];

    const s2 = 0.559398236957378e-1;
    const s1 = 0.273076135303957;
    //

    let d = 0.0;
    let bot = 0.0;
    let t = 0.0;
    let w = 0.0;
    let top = 0.0;

    t = a;
    d = a - 0.5;
    if (d > 0.0) {
      t = d - 0.5;
    }

    /*{
      double _arif_tmp = t;
      if (_arif_tmp < 0)  
        Dummy.go_to("Gam1",30);
      else if (_arif_tmp == 0)  
        Dummy.go_to("Gam1",10);
      else   Dummy.go_to("Gam1",20);
    }*/
    //

    if (t === 0) {
      return 0;
    } else if (t > 0) {
      top =
        (((((p[6] * t + p[5]) * t + p[4]) * t + p[3]) * t + p[2]) * t + p[1]) *
        t +
        p[0];
      bot = (((q[4] * t + q[3]) * t + q[2]) * t + q[1]) * t + 1.0;
      w = top / bot;

      if (d <= 0.0) {
        return a * w;
      } else {
        return t / a * (w - 0.5 - 0.5);
      }
    } else {
      // t < 0
      top =
        (((((((r[8] * t + r[7]) * t + r[6]) * t + r[5]) * t + r[4]) * t +
          r[3]) *
          t +
          r[2]) *
          t +
          r[1]) *
        t +
        r[0];
      bot = (s2 * t + s1) * t + 1.0;
      w = top / bot;

      if (d <= 0.0) {
        return a * (w + 0.5 + 0.5);
      } else {
        return t * w / a;
      }
    }
  }

  public static grat1(
    a: number,
    x: number,
    r: number,
    p: NumberW,
    q: NumberW,
    eps: number
  ) {
    //
    // c*********************************************************************72
    // c
    // cc GRAT1 evaluates P(A,X) and Q(A,X) when A <= 1.
    // c
    // C        EVALUATION OF THE INCOMPLETE GAMMA RATIO FUNCTIONS
    // C                      P(A,X) AND Q(A,X)
    // C
    // C     IT IS ASSUMED THAT A <= 1.  EPS IS THE TOLERANCE TO BE USED.
    // C     THE INPUT ARGUMENT R HAS THE VALUE E**(-X)*X**A/GAMMA(A).
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //

    let j = 0.0;
    let l = 0.0;
    let am0 = 0.0;
    let an0 = 0.0;
    let a2n = 0.0;
    let b2n = 0.0;
    let cma = 0.0;
    let c = 0.0;
    let g = 0.0;
    let h = 0.0;
    let t = 0.0;
    let w = 0.0;
    let z = 0.0;
    let tol = 0.0;
    let sum = 0.0;
    let a2nm1 = 0.0;
    let b2nm1 = 0.0;
    let an = 0.0;

    if (a * x === 0.0) {
      if (x <= a) {
        p.val = 0.0;
        q.val = 1.0;
        return;
      } else {
        p.val = 1.0;
        q.val = 0.0;
        return;
      }
    }

    if (a === 0.5) {
      if (x < 0.25) {
        p.val = Toms708.erf(Math.sqrt(x));
        q.val = 0.5 + (0.5 - p.val);
        return;
      } else {
        q.val = Toms708.erfc1(0, Math.sqrt(x));
        p.val = 0.5 + (0.5 - q.val);
        return;
      }
    }

    if (x < 1.1) {
      // C
      // C  TAYLOR SERIES FOR P(A,X)/X**A
      // C
      an = 3.0;
      c = x;
      sum = x / (a + 3.0);
      tol = 0.1 * eps / (a + 1.0);

      do {
        an++;
        c = -c * (x / an);
        t = c / (a + an);
        sum = sum + t;
      } while (Math.abs(t) > tol);

      j = a * x * ((sum / 6.0 - 0.5 / (a + 2.0)) * x + 1.0 / (a + 1.0));
      //
      z = a * log(x);
      h = Toms708.gam1(a);
      g = 1.0 + h;

      if (x < 0.25) {
        if (z > -0.13394) {
          l = Toms708.rexp(z);
          w = 0.5 + (0.5 + l);
          q.val = (w * j - l) * g - h;

          if (q.val < 0.0) {
            p.val = 1.0;
            q.val = 0.0;
            return;
          }

          p.val = 0.5 + (0.5 - q.val);
          return;
        } else {
          w = Math.exp(z);
          p.val = w * g * (0.5 + (0.5 - j));
          q.val = 0.5 + (0.5 - p.val);
          return;
        }
      } else {
        w = Math.exp(z);
        p.val = w * g * (0.5 + (0.5 - j));
        q.val = 0.5 + (0.5 - p.val);
        return;
      } //
    } else {
      // C
      // C  CONTINUED FRACTION EXPANSION
      // C

      a2nm1 = 1.0;
      a2n = 1.0;
      b2nm1 = x;
      b2n = x + (1.0 - a);
      c = 1.0;

      do {
        a2nm1 = x * a2n + c * a2nm1;
        b2nm1 = x * b2n + c * b2nm1;
        am0 = a2nm1 / b2nm1;
        c++;
        cma = c - a;
        a2n = a2nm1 + cma * a2n;
        b2n = b2nm1 + cma * b2n;
        an0 = a2n / b2n;
      } while (Math.abs(an0 - am0) >= eps * an0);

      q.val = r * an0;
      p.val = 0.5 + (0.5 - q.val);
      return;
    }
  }

  public static ipmpar(i: number): number {
    // c*********************************************************************72
    // C
    // cc IPMPAR sets integer machine constants.
    // c
    // C     IPMPAR PROVIDES THE INTEGER MACHINE CONSTANTS FOR THE COMPUTER
    // C     THAT IS USED. IT IS ASSUMED THAT THE ARGUMENT I IS AN INTEGER
    // C     HAVING ONE OF THE VALUES 1-10. IPMPAR(I) HAS THE VALUE ...
    // C
    // C  INTEGERS.
    // C
    // C     ASSUME INTEGERS ARE REPRESENTED IN THE N-DIGIT, BASE-A FORM
    // C
    // C               SIGN ( X(N-1)*A**(N-1) + ... + X(1)*A + X(0) )
    // C
    // C               WHERE 0 <= X(I) .LT. A FOR I =0,...,N-1.
    // C
    // C     IPMPAR(1)  = A, THE BASE.
    // C
    // C     IPMPAR(2)  = N, THE NUMBER OF BASE-A DIGITS.
    // C
    // C     IPMPAR(3)  = A**N - 1, THE LARGEST MAGNITUDE.
    // C
    // C  FLOATING-POINT NUMBERS.
    // C
    // C     IT IS ASSUMED THAT THE SINGLE AND DOUBLE PRECISION doubleING
    // C     POINT ARITHMETICS HAVE THE SAME BASE, SAY B, AND THAT THE
    // C     NONZERO NUMBERS ARE REPRESENTED IN THE FORM
    // C
    // C               SIGN (B**E) * (X(1)/B + ... + X(M)/B**M)
    // C
    // C               WHERE X(I)  = 0,1,...,B-1 FOR I =1,...,M,
    // C               X(1) .GE. 1, AND EMIN <= E <= EMAX.
    // C
    // C     IPMPAR(4)  = B, THE BASE.
    // C
    // C  SINGLE-PRECISION
    // C
    // C     IPMPAR(5)  = M, THE NUMBER OF BASE-B DIGITS.
    // C
    // C     IPMPAR(6)  = EMIN, THE SMALLEST EXPONENT E.
    // C
    // C     IPMPAR(7)  = EMAX, THE LARGEST EXPONENT E.
    // C
    // C  DOUBLE-PRECISION
    // C
    // C     IPMPAR(8)  = M, THE NUMBER OF BASE-B DIGITS.
    // C
    // C     IPMPAR(9)  = EMIN, THE SMALLEST EXPONENT E.
    // C
    // C     IPMPAR(10)  = EMAX, THE LARGEST EXPONENT E.
    // C
    // C
    // C
    // C     TO DEFINE THIS FUNCTION FOR THE COMPUTER BEING USED, ACTIVATE
    // C     THE DATA STATMENTS FOR THE COMPUTER BY REMOVING THE C FROM
    // C     COLUMN 1. (ALL THE OTHER DATA STATEMENTS SHOULD HAVE C IN
    // C     COLUMN 1.)
    // C
    // C
    // C
    // C     IPMPAR IS AN ADAPTATION OF THE FUNCTION I1MACH, WRITTEN BY
    // C     P.A. FOX, A.D. HALL, AND N.L. SCHRYER (BELL LABORATORIES).
    // C     IPMPAR WAS FORMED BY A.H. MORRIS (NSWC). THE CONSTANTS ARE
    // C     FROM BELL LABORATORIES, NSWC, AND OTHER SOURCES.
    // C
    const imach = [2, 31, 2147483647, 2, 24, -125, 128, 53, -1021, 1024];

    return imach[i - 1];
  }

  public static gamma_inc_values(
    nData: NumberW,
    a: NumberW,
    x: NumberW,
    fx: NumberW
  ): void {
    // C *********************************************************************72
    // C
    // C  GAMMA_INC_VALUES returns some values of the incomplete Gamma function.
    // C
    // C   Discussion:
    // C
    // C     The (normalized) incomplete Gamma function P(A,X) is defined as:
    // C
    // C       PN(A,X) = 1/Gamma(A) * Integral ( 0 <= T <= X ) T**(A-1) * exp(-T) dT.
    // C
    // C     With this definition, for all A and X,
    // C
    // C       0 <= PN(A,X) <= 1
    // C
    // C     and
    // C
    // C       PN(A,INFINITY) = 1.0
    // C
    // C     In Mathematica, the function can be evaluated by:
    // C
    // C       1 - GammaRegularized[A,X]
    // C
    // C   Modified:
    // C
    // C     28 August 2004
    // C
    // C   Author:
    // C
    // C     John Burkardt
    // C
    // C   Reference:
    // C
    // C     Milton Abramowitz and Irene Stegun,
    // C     Handbook of Mathematical Functions,
    // C     US Department of Commerce, 1964.
    // C
    // C     Stephen Wolfram,
    // C     The Mathematica Book,
    // C     Fourth Edition,
    // C     Wolfram Media / Cambridge University Press, 1999.
    // C
    // C   Parameters:
    // C
    // C     Input/output, integer N_DATA.  The user sets N_DATA to 0 before the
    // C     first call.  On each call, the routine increments N_DATA by 1, and
    // C     returns the corresponding data; when there is no more data, the
    // C     output value of N_DATA will be 0 again.
    // C
    // C     Output, real ( kind = 4 ) A, the parameter of the function.
    // C
    // C     Output, real ( kind = 4 ) X, the argument of the function.
    // C
    // C     Output, real ( kind = 4 ) FX, the value of the function.
    // C
    let nMax = 20;

    const aVec = [
      0.1,
      0.1,
      0.1,
      0.5,
      0.5,
      0.5,
      0.1e1,
      0.1e1,
      0.1e1,
      0.11e1,
      0.11e1,
      0.11e1,
      0.2e1,
      0.2e1,
      0.2e1,
      0.6e1,
      0.6e1,
      0.11e2,
      0.26e2,
      0.41e2
    ];

    const fxVec = [
      0.7382350532339351,
      0.9083579897300343,
      0.9886559833621947,
      0.3014646416966613,
      0.7793286380801532,
      0.9918490284064973,
      0.9516258196404043e-1,
      0.6321205588285577,
      0.9932620530009145,
      0.7205974576054322e-1,
      0.5891809618706485,
      0.9915368159845525,
      0.01018582711118352,
      0.4421745996289254,
      0.9927049442755639,
      0.4202103819530612e-1,
      0.9796589705830716,
      0.9226039842296429,
      0.4470785799755852,
      0.7444549220718699
    ];

    const xVec = [
      0.3e-1,
      0.3,
      0.15e1,
      0.75e-1,
      0.75,
      0.35e1,
      0.1,
      0.1e1,
      0.5e1,
      0.1,
      0.1e1,
      0.5e1,
      0.15,
      0.15e1,
      0.7e1,
      0.25e1,
      0.12e2,
      0.16e2,
      0.25e2,
      0.45e2
    ];

    if (nData.val < 0) nData.val = 0;

    nData.val++;

    if (nMax < nData.val) {
      nData.val = 0;
      a.val = 0.0;
      x.val = 0.0;
      fx.val = 0.0;
    } else {
      a.val = aVec[nData.val - 1];
      x.val = xVec[nData.val - 1];
      fx.val = fxVec[nData.val - 1];
    }
  }

  public static gamma_log_values(nData: NumberW, x: NumberW, fx: NumberW) {
    // C *********************************************************************72
    // C
    // C  GAMMA_LOG_VALUES returns some values of the Log Gamma function for testing.
    // C
    // C   Modified:
    // C
    // C     17 April 2001
    // C
    // C   Author:
    // C
    // C     John Burkardt
    // C
    // C   Reference:
    // C
    // C     Milton Abramowitz and Irene Stegun,
    // C     Handbook of Mathematical Functions,
    // C     US Department of Commerce, 1964.
    // C
    // C   Parameters:
    // C
    // C     Input/output, integer N_DATA.
    // C     On input, if N_DATA is 0, the first test data is returned, and
    // C     N_DATA is set to the index of the test data.  On each subsequent
    // C     call, N_DATA is incremented and that test data is returned.  When
    // C     there is no more test data, N_DATA is set to 0.
    // C
    // C     Output, real X, the argument of the function.
    // C
    // C     Output, real FX, the value of the function.
    // C
    const nmax = 18;

    const bvec = [
      1.524064183,
      0.7966780066,
      0.3982337117,
      0.1520599127,
      0.0,
      -0.04987246543,
      -0.08537410945,
      -0.1081747934,
      -0.119612895,
      -0.120782204,
      -0.1125917658,
      -0.09580771625,
      -0.07108385116,
      -0.0389842838,
      0.0,
      12.80182743,
      39.33988571,
      71.25704193
    ];

    const xvec = [
      0.2,
      0.4,
      0.6,
      0.8,
      1.0,
      1.1,
      1.2,
      1.3,
      1.4,
      1.5,
      1.6,
      1.7,
      1.8,
      1.9,
      2.0,
      10.0,
      20.0,
      30.0
    ];

    if (nData.val < 0) nData.val = 0;

    nData.val++;

    if (nmax < nData.val) {
      nData.val = 0;
      x.val = 0.0;
      fx.val = 0.0;
    } else {
      x.val = xvec[nData.val - 1];
      fx.val = bvec[nData.val - 1];
    }
  }

  public static gamln(a: number): number {
    //
    // c*********************************************************************72
    // c
    // cc GAMLN evaluates LN(GAMMA(A)) for positive A.
    // C
    // C     WRITTEN BY ALFRED H. MORRIS
    // C          NAVAL SURFACE WARFARE CENTER
    // C          DAHLGREN, VIRGINIA
    // C
    // C     D = 0.5*(LN(2*PI) - 1)
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //
    const d = 0.418938533204673;
    //
    const c5 = -0.165322962780713e-2;
    const c4 = 0.837308034031215e-3;
    const c3 = -0.59520293135187e-3;
    const c2 = 0.79365066682539e-3;
    const c1 = -0.277777777760991e-2;
    const c0 = 0.833333333333333e-1;
    //
    let i = 0;
    let n = 0;
    let t = 0.0;
    let w = 0.0;

    if (a <= 0.8) return Toms708.gamln1(a) - log(a);

    if (a <= 2.25) {
      t = a - 0.5 - 0.5;
      return Toms708.gamln1(t);
    }

    if (a < 10.0) {
      n = trunc(a - 1.25);
      t = a;
      w = 1.0;

      for (i = 1; i <= n; i++) {
        t--;
        w *= t;
      }
      return Toms708.gamln1(t - 1.0) + log(w);
    }

    t = Math.pow(1.0 / a, 2);
    w = (((((c5 * t + c4) * t + c3) * t + c2) * t + c1) * t + c0) / a;
    return d + w + (a - 0.5) * (log(a) - 1.0);
  }

  public static gamln1(a: number): number {
    //
    // c*********************************************************************72
    // c
    // cc GAMLN1 evaluates LN(GAMMA(1 + A)) for -0.2 <= A <= 1.25
    // c
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //
    const p6 = -0.271935708322958e-2;
    const p5 = -0.673562214325671e-1;
    const p4 = -0.402055799310489;
    const p3 = -0.780427615533591;
    const p2 = -0.168860593646662;
    const p1 = 0.844203922187225;
    const p0 = 0.577215664901533;
    const q6 = 0.667465618796164e-3;
    const q5 = 0.325038868253937e-1;
    const q4 = 0.361951990101499;
    const q3 = 0.156875193295039e1;
    const q2 = 0.312755088914843e1;
    const q1 = 0.288743195473681e1;
    // c
    const r5 = 0.497958207639485e-3;
    const r4 = 0.17050248402265e-1;
    const r3 = 0.156513060486551;
    const r2 = 0.565221050691933;
    const r1 = 0.848044614534529;
    const r0 = 0.422784335098467;
    const s5 = 0.116165475989616e-3;
    const s4 = 0.713309612391e-2;
    const s3 = 0.10155218743983;
    const s2 = 0.548042109832463;
    const s1 = 0.124313399877507e1;
    //

    let w = 0.0;
    let x = 0.0;

    if (a < 0.6) {
      w =
        ((((((p6 * a + p5) * a + p4) * a + p3) * a + p2) * a + p1) * a + p0) /
        ((((((q6 * a + q5) * a + q4) * a + q3) * a + q2) * a + q1) * a + 1.0);

      return -a * w;
    }

    x = a - 0.5 - 0.5;
    w =
      (((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x + r0) /
      (((((s5 * x + s4) * x + s3) * x + s2) * x + s1) * x + 1.0);

    return x * w;
  }

  public static gsumln(a: number, b: number): number {
    //
    // c*********************************************************************72
    // c
    // cc GSUMLN evaluates LN(GAMMA(A + B)) for 1 <= A <= 2 and 1 <= B <= 2.
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //
    let x = a + b - 2;

    if (x <= 0.25) return Toms708.gamln1(1.0 + x);

    if (x <= 1.25) return Toms708.gamln1(x) + Toms708.alnrel(x);

    return Toms708.gamln1(x - 1.0) + log(x * (1.0 + x));
  }

  public static psi(xx: number) {
    //
    // c*********************************************************************72
    // C
    // cc PSI evaluates the Digamma function.
    // c
    // C
    // C     PSI(XX) IS ASSIGNED THE VALUE 0 WHEN THE DIGAMMA FUNCTION CANNOT
    // C     BE COMPUTED.
    // C
    // C     THE MAIN COMPUTATION INVOLVES EVALUATION OF RATIONAL CHEBYSHEV
    // C     APPROXIMATIONS PUBLISHED IN MATH. COMP. 27, 123-127(1973) BY
    // C     CODY, STRECOK AND THACHER.
    // C
    // C
    // C     PSI WAS WRITTEN AT ARGONNE NATIONAL LABORATORY FOR THE FUNPACK
    // C     PACKAGE OF SPECIAL FUNCTION SUBROUTINES. PSI WAS MODIFIED BY
    // C     A.H. MORRIS (NSWC).
    // C
    // C
    // C  PIOV4  = PI/4
    // C  DX0  = ZERO OF PSI TO EXTENDED PRECISION
    // C
    const piov4 = 0.785398163397448;
    const dx0 = 1.461632144968362341262659542325721325;
    // C
    // C  COEFFICIENTS FOR RATIONAL APPROXIMATION OF
    // C  PSI(X) / (X - X0),  0.5 <= X <= 3.0
    // C

    const p1 = [
      0.89538502298197e-2,
      0.477762828042627e1,
      0.142441585084029e3,
      0.118645200713425e4,
      0.363351846806499e4,
      0.413810161269013e4,
      0.130560269827897e4
    ];

    const q1 = [
      0.448452573429826e2,
      0.520752771467162e3,
      0.22100079924783e4,
      0.364127349079381e4,
      0.1908310765963e4,
      0.691091682714533e-5
    ];

    // C
    // C  COEFFICIENTS FOR RATIONAL APPROXIMATION OF
    // C  PSI(X) - LN(X) + 1 / (2*X),  X .GT. 3.0
    // C

    const p2 = [
      -0.212940445131011e1,
      -0.701677227766759e1,
      -0.448616543918019e1,
      -0.648157123766197
    ];

    const q2 = [
      0.322703493791143e2,
      0.892920700481861e2,
      0.546117738103215e2,
      0.777788548522962e1
    ];

    // C
    // C  MACHINE DEPENDENT CONSTANTS ...
    // C
    // C        XMAX1   = THE SMALLEST POSITIVE doubleING POINT CONSTANT
    // C                 WITH ENTIRELY INTEGER REPRESENTATION.  ALSO USED
    // C                 AS NEGATIVE OF LOWER BOUND ON ACCEPTABLE NEGATIVE
    // C                 ARGUMENTS AND AS THE POSITIVE ARGUMENT BEYOND WHICH
    // C                 PSI MAY BE REPRESENTED AS ALOG(X).
    // C
    // C        XSMALL  = ABSOLUTE ARGUMENT BELOW WHICH PI*COTAN(PI*X)
    // C                 MAY BE REPRESENTED BY 1/X.
    // C
    // C

    let nq = 0;
    let xsmall = 0.0;
    let xmax1 = 0.0;
    let den = 0.0;
    let i = 0;
    let aug = 0.0;
    let m = 0;
    let n = 0;
    let sgn = 0.0;
    let w = 0.0;
    let x = 0.0;
    let z = 0.0;
    let upper = 0.0;
    let xmx0 = 0.0;

    xmax1 = Toms708.ipmpar(3);
    xmax1 = Math.min(xmax1, 1.0 / Toms708.spmpar(1));
    xsmall = 1e-9;
    //
    x = xx;
    aug = 0.0;
    if (x < 0.5) {
      // C
      // C  X .LT. 0.5,  USE REFLECTION FORMULA
      // C  PSI(1-X)  = PSI(X) + PI * COTAN(PI*X)
      // C
      if (Math.abs(x) <= xsmall) {
        // error exit
        if (x === 0.0) return 0;

        // C
        // C  0 .LT. ABS(X) <= XSMALL.  USE 1/X AS A SUBSTITUTE
        // C  FOR  PI*COTAN(PI*X)
        // C
        aug = -1 / x;
      } else {
        // C
        // C  REDUCTION OF ARGUMENT FOR COTAN
        // C
        w = -x;
        sgn = piov4;
        if (w <= 0.0) {
          w = -w;
          sgn = -sgn;
        }
        // C
        // C  MAKE AN ERROR EXIT IF X <= -XMAX1
        // C

        // error exit
        if (w >= xmax1) return 0;

        nq = trunc(w);
        w = w - nq;
        nq = trunc(w * 4.0);
        w = 4.0 * (w - nq * 0.25);
        // C
        // C  W IS NOW RELATED TO THE FRACTIONAL PART OF  4.0 * X.
        // C  ADJUST ARGUMENT TO CORRESPOND TO VALUES IN FIRST
        // C  QUADRANT AND DETERMINE SIGN
        // C
        n = nq / 2;
        if (n + n !== nq) {
          w = 1.0 - w;
        }
        z = piov4 * w;
        m = n / 2;
        if (m + m !== n) {
          sgn = -sgn;
        }
        // C
        // C  DETERMINE FINAL VALUE FOR  -PI*COTAN(PI*X)
        // C
        n = (nq + 1) / 2;
        m = n / 2;
        m = m + m;
        if (m === n) {
          // C
          // C  CHECK FOR SINGULARITY
          // C
          // error exit
          if (z === 0.0) return 0;

          // C
          // C  USE COS/SIN AS A SUBSTITUTE FOR COTAN, AND
          // C  SIN/COS AS A SUBSTITUTE FOR TAN
          // C
          aug = sgn * (Math.cos(z) / Math.sin(z) * 4.0);
        } else {
          aug = sgn * (Math.sin(z) / Math.cos(z) * 4.0);
        }
      }
      x = 1 - x;
    }
    if (x <= 3.0) {
      // C
      // C  0.5 <= X <= 3.0
      // C
      den = x;
      upper = p1[1] * x;
      //

      for (i = 0; i < 5; i++) {
        den = (den + q1[i]) * x;
        upper = (upper + p1[i + 1]) * x;
      }

      //
      den = (upper + p1[6]) / (den + q1[5]);
      xmx0 = x - dx0;
      return den * xmx0 + aug;

      // C
      // C  IF X .GE. XMAX1, PSI  = LN(X)
      // C
    }
    if (x < xmax1) {
      // C
      // C  3.0 .LT. X .LT. XMAX1
      // C
      w = 1.0 / (x * x);
      den = w;
      upper = p2[0] * w;
      //
      for (i = 0; i < 3; i++) {
        den = (den + q2[i]) * w;
        upper = (upper + p2[i + 1]) * w;
      } //  Close for() loop.
      //
      aug = upper / (den + q2[3]) - 0.5 / x + aug;
    }

    return aug + log(x);
  }

  public static psi_values(n: NumberW, x: NumberW, fx: NumberW) {
    // C *********************************************************************72
    // C
    // C  PSI_VALUES returns some values of the Psi or Digamma function for testing.
    // C
    // C   Discussion:
    // C
    // C     PSI(X) = d LN ( GAMMA ( X ) ) / d X = GAMMA'(X) / GAMMA(X)
    // C
    // C     PSI(1) = - Euler's constant.
    // C
    // C     PSI(X+1) = PSI(X) + 1 / X.
    // C
    // C   Modified:
    // C
    // C     17 May 2001
    // C
    // C   Author:
    // C
    // C     John Burkardt
    // C
    // C   Reference:
    // C
    // C     Milton Abramowitz and Irene Stegun,
    // C     Handbook of Mathematical Functions,
    // C     US Department of Commerce, 1964.
    // C
    // C   Parameters:
    // C
    // C     Input/output, integer N.
    // C     On input, if N is 0, the first test data is returned, and N is set
    // C     to the index of the test data.  On each subsequent call, N is
    // C     incremented and that test data is returned.  When there is no more
    // C     test data, N is set to 0.
    // C
    // C     Output, real X, the argument of the function.
    // C
    // C     Output, real FX, the value of the function.
    // C
    const nmax = 11;
    const fxvec = [
      -0.5772156649,
      -0.4237549404,
      -0.2890398966,
      -0.1691908889,
      -0.0613845446,
      -0.036489974,
      0.1260474528,
      0.2085478749,
      0.2849914333,
      0.3561841612,
      0.4227843351
    ];

    const xvec = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0];

    if (n.val < 0) n.val = 0;

    n.val++;

    if (nmax < n.val) {
      n.val = 0;
      x.val = 0.0;
      fx.val = 0.0;
    } else {
      x.val = xvec[n.val - 1];
      fx.val = fxvec[n.val - 1];
    }
  }

  public static r4_epsilon(): number {
    // C *********************************************************************72
    // C
    // C R4_EPSILON returns the round off unit for floating arithmetic.
    // C
    // C Discussion:
    // C
    // C R4_EPSILON is a number R which is a power of 2 with the property that,
    // C to the precision of the computer's arithmetic,
    // C 1 < 1 + R
    // C but
    // C 1 = ( 1 + R / 2 )
    // C
    // C FORTRAN90 provides the superior library routine
    // C
    // C EPSILON ( X )
    // C
    // C Modified:
    // C
    // C 28 November 2005
    // C
    // C Author:
    // C
    // C John Burkardt
    // C
    // C Parameters:
    // C
    // C Output, real R4_EPSILON, the floating point round-off unit.
    // C

    let r = 1.0;
    let rTest = 1.0 + r / 2.0;

    while (1.0 < rTest) {
      r = r / 2.0;
      rTest = 1.0 + r / 2.0;
    }

    return r;
  }

  public static rexp(x: number) {
    //
    // c*********************************************************************72
    // c
    // cc REXP evaluates the function EXP(X) - 1.
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360 - 373.
    // c
    //
    const q4 = 0.595130811860248e-3;
    const q3 = -0.119041179760821e-1;
    const q2 = 0.107141568980644;
    const q1 = -0.499999999085958;
    const p2 = 0.238082361044469e-1;
    const p1 = 0.914041914819518e-9;

    let w = 0.0;

    if (Math.abs(x) <= 0.15) {
      return (
        x *
        (((p2 * x + p1) * x + 1.0) / (((q4 * x + q3) * x + q2) * x + q1) * x +
          1.0)
      );
    } else {
      w = Math.exp(x);

      if (x <= 0.0) {
        return w - 0.5 - 0.5;
      } else {
        return w * (0.5 + (0.5 - 1.0 / w));
      }
    }
  }

  public static rlog1(x: number) {
    //
    // c*********************************************************************72
    // c
    // cc RLOG1 evaluates the function X - LN(1 + X).
    // C
    // c  Reference:
    // c
    // c    Armido Didonato, Alfred Morris,
    // c    Algorithm 708:
    // c    Significant Digit Computation of the Incomplete Beta Function Ratio
    // c    ACM Transactions on Mathematical Software,
    // c    Volume 18, Number 3, 1992, pages 360-373.
    // c
    //
    const a = 0.566749439387324e-1;
    const b = 0.456512608815524e-1;
    //
    const p2 = 0.620886815375787e-2;
    const p1 = -0.224696413112536;
    const p0 = 0.333333333333333;
    const q2 = 0.354508718369557;
    const q1 = -0.127408923933623e1;
    //

    let h = 0.0;
    let r = 0.0;
    let t = 0.0;
    let w = 0.0;
    let w1 = 0.0;

    if (x < -0.39 || x > 0.57) {
      w = x + 0.5 + 0.5;

      return x - log(w);
    }

    if (x < -0.18) {
      h = x + 0.3;
      h = h / 0.7;
      w1 = a - h * 0.3;
    } else if (x > 0.18) {
      h = 0.75 * x - 0.25;
      w1 = b + h / 3.0;
    } else {
      // C
      // C  ARGUMENT REDUCTION
      // C
      h = x;
      w1 = 0.0;
    }

    // C
    // C  Series expansion
    // c
    r = h / (h + 2.0);
    t = r * r;
    w = ((p2 * t + p1) * t + p0) / ((q2 * t + q1) * t + 1.0);

    return 2.0 * t * (1.0 / (1.0 - r) - r * w) + w1;
    //
  }

  /**
   * Fortran floating point transfer of sign (SIGN) intrinsic function.
   * <p>
   * Returns:<br>
   * <ul>
   *   <li> abs(a1), if a2 &gt;= 0
   *   <li>-abs(a1), if a2 &lt; 0
   * </ul>
   *
   * @param a1 floating point value
   * @param a2 sign transfer indicator
   *
   * @return equivalent of Fortran SIGN(a1,a2) as described above.
   *  <p>
   *  @author Keith Seymour (seymour@cs.utk.edu)
   */
  public static sign(a1: number, a2: number): number {
    return a2 >= 0 ? Math.abs(a1) : -Math.abs(a1);
  }

  public static spmpar(i: number) {
    //
    // c*********************************************************************72
    // c
    // cc SPMPAR returns single precision real machine constants.
    // c
    // C     SPMPAR PROVIDES THE SINGLE PRECISION MACHINE CONSTANTS FOR
    // C     THE COMPUTER BEING USED. IT IS ASSUMED THAT THE ARGUMENT
    // C     I IS AN INTEGER HAVING ONE OF THE VALUES 1, 2, OR 3. IF THE
    // C     SINGLE PRECISION ARITHMETIC BEING USED HAS M BASE B DIGITS AND
    // C     ITS SMALLEST AND LARGEST EXPONENTS ARE EMIN AND EMAX, THEN
    // C
    // C        SPMPAR(1)  = B**(1 - M), THE MACHINE PRECISION,
    // C
    // C        SPMPAR(2)  = B**(EMIN - 1), THE SMALLEST MAGNITUDE,
    // C
    // C        SPMPAR(3)  = B**EMAX*(1 - B**(-M)), THE LARGEST MAGNITUDE.
    // C
    // C
    // C     WRITTEN BY
    // C        ALFRED H. MORRIS, JR.
    // C        NAVAL SURFACE WARFARE CENTER
    // C        DAHLGREN VIRGINIA
    // C
    //

    let emin = 0;
    let emax = 0;
    let binv = 0.0;
    let bm1 = 0.0;
    let ibeta = 0;
    let b = 0.0;
    let m = 0;
    let one = 0.0;
    let w = 0.0;
    let z = 0.0;

    if (i > 1) {
      if (i > 2) {
        ibeta = Toms708.ipmpar(4);
        m = Toms708.ipmpar(5);
        emax = Toms708.ipmpar(7);
        //
        b = ibeta;
        bm1 = ibeta - 1;
        one = 1.0;
        z = Math.pow(b, m - 1);
        w = ((z - one) * b + bm1) / (b * z);
        //
        z = Math.pow(b, emax - 2);
        return w * z * b * b;
      } else {
        b = Toms708.ipmpar(4);
        emin = Toms708.ipmpar(6);
        one = 1.0;
        binv = one / b;
        w = Math.pow(b, emin + 2);
        return w * binv * binv * binv;
      }
    }
    //else
    b = Toms708.ipmpar(4);
    m = Toms708.ipmpar(5);
    return Math.pow(b, 1 - m);
  }
}
