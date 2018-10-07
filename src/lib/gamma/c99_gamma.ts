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
import * as debug from 'debug';
// Note that the functions Gamma and LogGamma are mutually dependent.
import {
  ME,
  ML_ERROR,
} from '../common/_general';

const { floor, exp, log, abs: fabs } = Math;
const { MAX_VALUE: DBL_MAX, NaN: ML_NAN } = Number;
const printer_tgamma = debug('tgamma');

function tgamma(x: number): number {

  if (x <= 0.0) {
    ML_ERROR(ME.ME_DOMAIN, 'gamma', printer_tgamma);
    printer_tgamma('Argument %d must be positive', x);
    return ML_NAN;
  }

  // Split the function domain into three intervals:
  // (0, 0.001), [0.001, 12), and (12, infinity)

  ///////////////////////////////////////////////////////////////////////////
  // First interval: (0, 0.001)
  //
  // For small x, 1/Gamma(x) has power series x + gamma x^2  - ...
  // So in this range, 1/Gamma(x) = x + gamma x^2 with error on the order of x^3.
  // The relative error over this interval is less than 6e-7.

  const gamma = 0.577215664901532860606512090; // Euler's gamma constant

  if (x < 0.001)
    return 1.0 / (x * (1.0 + gamma * x));

  ///////////////////////////////////////////////////////////////////////////
  // Second interval: [0.001, 12)

  if (x < 12.0) {
    // The algorithm directly approximates gamma over (1,2) and uses
    // reduction identities to reduce other arguments to this interval.

    let y = x;
    let n = 0;
    let arg_was_less_than_one: boolean = (y < 1.0);

    // Add or subtract integers as necessary to bring y into (1,2)
    // Will correct for this below
    if (arg_was_less_than_one) {
      y += 1.0;
    }
    else {
      n = (floor(y)) - 1;  // will use n later
      y -= n;
    }

    // numerator coefficients for approximation over the interval (1,2)
    const p = [
      -1.71618513886549492533811E+0,
      2.47656508055759199108314E+1,
      -3.79804256470945635097577E+2,
      6.29331155312818442661052E+2,
      8.66966202790413211295064E+2,
      -3.14512729688483675254357E+4,
      -3.61444134186911729807069E+4,
      6.64561438202405440627855E+4
    ];

    // denominator coefficients for approximation over the interval (1,2)
    const q = [
      -3.08402300119738975254353E+1,
      3.15350626979604161529144E+2,
      -1.01515636749021914166146E+3,
      -3.10777167157231109440444E+3,
      2.25381184209801510330112E+4,
      4.75584627752788110767815E+3,
      -1.34659959864969306392456E+5,
      -1.15132259675553483497211E+5
    ];

    let num = 0.0;
    let den = 1.0;
    let i;

    let z = y - 1;
    for (i = 0; i < 8; i++) {
      num = (num + p[i]) * z;
      den = den * z + q[i];
    }
    let result = num / den + 1.0;

    // Apply correction if argument was not initially in (1,2)
    if (arg_was_less_than_one) {
      // Use identity gamma(z) = gamma(z+1)/z
      // The variable "result" now holds gamma of the original y + 1
      // Thus we use y-1 to get back the orginal y.
      result /= (y - 1.0);
    }
    else {
      // Use the identity gamma(z+n) = z*(z+1)* ... *(z+n-1)*gamma(z)
      for (i = 0; i < n; i++)
        result *= y++;
    }

    return result;
  }

  ///////////////////////////////////////////////////////////////////////////
  // Third interval: [12, infinity)

  if (x > 171.624) {
    // Correct answer too large to display. Force +infinity.
    let temp = DBL_MAX;
    return temp * 2.0;
  }

  return exp(lgamma_c99(x));
}

function lgamma_c99(x: number) {

  if (x <= 0.0) {
    ML_ERROR(ME.ME_DOMAIN, 'gamma', printer_tgamma);
    printer_tgamma('Argument %f must be positive', x);
    return ML_NAN;
  }


  if (x < 12.0) {
    return log(fabs(tgamma(x)));
  }

  // Abramowitz and Stegun 6.1.41
  // Asymptotic series should be good to at least 11 or 12 figures
  // For error analysis, see Whittiker and Watson
  // A Course in Modern Analysis (1927), page 252

  const c = [
    1.0 / 12.0,
    - 1.0 / 360.0,
    1.0 / 1260.0,
    - 1.0 / 1680.0,
    1.0 / 1188.0,
    - 691.0 / 360360.0,
    1.0 / 156.0,
    - 3617.0 / 122400.0
  ];

  let z = 1.0 / (x * x);
  let sum = c[7];
  for (let i = 6; i >= 0; i--) {
    sum *= z;
    sum += c[i];
  }
  let series = sum / x;

  const halfLogTwoPi = 0.91893853320467274178032973640562;
  let logGamma = (x - 0.5) * log(x) - x + halfLogTwoPi + series;
  return logGamma;
}

// Can delete these functions and the #include for <iostream> if not testing.

/* test values for gamma  (x, gamma_c99(x) )
	 Test near branches in code for (0, 0.001), [0.001, 12), (12, infinity)
	
  {1e-20, 1e+20 },
  { 2.19824158876e-16, 4.5490905327e+15 },	// 0.99*DBL_EPSILON
  { 2.24265050974e-16, 4.45900953205e+15 }, // 1.01*DBL_EPSILON
  { 0.00099, 1009.52477271 },
  { 0.00100, 999.423772485 },
  { 0.00101, 989.522792258 },
  { 6.1, 142.451944066 },
  { 11.999, 39819417.4793 },
  { 12, 39916800.0 },
  { 12.001, 40014424.1571 },
  { 15.2, 149037380723.0 }

  FOR LOG Gamma (x, lgamma_c99(x) )
 	{1e-12, 27.6310211159 },
  { 0.9999, 5.77297915613e-05 },
  { 1.0001, -5.77133422205e-05 },
  { 3.1, 0.787375083274 },
  { 6.3, 5.30734288962 },
  { 11.9999, 17.5020635801 },
  { 12, 17.5023078459 },
  { 12.0001, 17.5025521125 },
  { 27.4, 62.5755868211 }
*/
