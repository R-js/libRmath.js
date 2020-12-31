/* This is a conversion from libRmath.so to Typescript/Javascript
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
const libR = require('../dist/lib/libR.js');
const { Normal, Beta, rng } = libR;
const { arrayrify } = libR.R;

const log = arrayrify(Math.log); // Make Math.log accept/return arrays aswell as scalars

const ms = new rng.MersenneTwister();
const normal = new rng.normal.Inversion(ms);

const { dbeta, pbeta, qbeta, rbeta } = Beta(normal);

dbeta(0.4, 2, 2, 1);
//1.287245740256553

dbeta(0.4, 2, 2, undefined, true);
//0.36464311358790935

dbeta(0.4, 2, 2, 1, true);
//0.25250485075747914

dbeta([0, 0.2, 0.4, 0.8, 1, 1.2], 2, 2);
/*
    [ 0,
      0.9600000000000001,
      1.4400000000000002,
      0.9599999999999999,
      0,
      0 ]
*/


//1.
pbeta(0.5, 2, 5);

//2.
pbeta(0.5, 2, 5, 4);

//3.
pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, 4);

//4.
pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, undefined);

//5. Same as 4
pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, undefined, false).map(v => 1 - v);

//6.
pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, undefined, true, true);

//7. Same as 6
log(pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, undefined, true));

//1. always zero, regardless of shape params, because 0 ≤ x ≤ 1.
qbeta(0, 99, 66);

//2.
qbeta([0, 1], 99, 66);
//[0, 1] 

//3.
qbeta([0, 0.25, 0.5, 0.75, 1], 4, 5); // take quantiles of 25%
//[0, 0.3290834273473526, 0.4401552046347658, 0.555486315052315, 1] 

//4.
qbeta([0, 0.25, 0.5, 0.75, 1], 4, 5, 3); // ncp = 3
/*[0,
    0.4068615143975546,
    0.5213446410803881,
    0.6318812884183387,
    1
]*/

//5. ncp=undefined, lowerTail = false, logP=false(default)
qbeta(([0, 0.25, 0.5, 0.75, 1]), 4, 5, undefined, false); //
//[1, 0.555486315052315, 0.4401552046347658, 0.3290834273473526, 0]

//6. same as [5] but, logP=true,
qbeta(log([0, 0.25, 0.5, 0.75, 1]), //uses log!!
    4,
    5, undefined, false,
    true //logP=true (default=false)
);
//[1, 0.5554863150523149, 0.4401552046347659, 0.3290834273473526,0]

//0. reset
ms.init(0);

//1.
rbeta(5, 0.5, 0.5);

//2.
rbeta(5, 2, 2, 4);

//3. // re-initialize seed
ms.init(0);
rbeta(5, 2, 2);

//4.
rbeta(5, 2, 2, 5);