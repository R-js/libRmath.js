//https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Lognormal.html
//https://en.wikipedia.org/wiki/Log-normal_distribution
const libR = require('../dist/lib/libR.js');
//const libR = require('lib-r-math.js');
const {
    Normal,
    LogNormal,
    rng: { MersenneTwister },
    rng: { normal: { Inversion } }
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//explicitly use a PRNG.
const mt = new MersenneTwister(5321);
const customL = LogNormal(Normal(new Inversion(mt)));

//or use default  (uses "MersenneTwister" and "Inversion")
const defaultL = LogNormal();
//
const { dlnorm, plnorm, qlnorm, rlnorm } = customL;
//

//data from 0 to 3, step 0.5 
const x = seq(0, 3, 0.5); // 

//1.
const d1 = dlnorm(x, 0, 0.25);
precision(d1);
/*[ 
    0, 0.0683494951, 1.59576912, 0.285553776, 0.0170873738,
    0.000772680788,0.0000340783543
]*/

//2.
const d2 = dlnorm(x, 0, 0.5, true);
precision(d2);
/*
[ -Infinity, -0.4935502, -0.225791353, -0.960060369, -1.87984456,
  -2.8212595,-3.73830156 
]
*/

//3
const d3 = dlnorm(x, 0, 1);
precision(d3);
/*[ 
  0, 0.627496077, 0.39894228, 0.244973652, 0.156874019,
  0.104871067, 0.0727282561
]*/

//1.
const p1 = plnorm(x, 0, 0.25);
precision(p1);
/*[ 
  0, 0.00278061786, 0.5, 0.947583382,
  0.997219382, 0.999876409, 0.999994447
]*/

//2.
const p2 = plnorm(x, 0, 0.5, false, true);
precision(p2);
/*[
  0, -0.086460822, -0.693147181, -1.5668437,
  -2.49098284, -3.39822924, -4.26854042
]
*/

//3
const p3 = plnorm(x, 0, 1);
precision(p3);
/*[
  1, 0.244108596, 0.5, 0.657432169,
  0.755891404, 0.820242786, 0.864031392
]
*/

//1.
const pp1 = plnorm(x, 0, 0.25);
const q1 = qlnorm(pp1, 0, 0.25);
precision(q1);
// [ 0, 0.5, 1, 1.5, 2, 2.5, 3]

//2.
const pp2 = plnorm(x, 2, 0.5, false, true);
const q2 = qlnorm(pp2, 2, 0.5, false, true);
precision(q2);
//[ 0, 0.5, 1, 1.5, 2, 2.5, 3 ]

//3. //defaults mu=0, sigma =1.
const pp3 = plnorm(x);
const q3 = qlnorm(pp3);
precision(q3);
//[ 0, 0.5, 1, 1.5, 2, 2.5, 3 ]

//1
mt.init(12345);
const r1 = rlnorm(5);
precision(r1);
//[1.79594046, 2.03290543, 0.896458467, 0.63540215, 1.83287809]

//2
mt.init(56789);
const r2 = rlnorm(5, 2, 0.3);
precision(r2);

//3
mt.init(332211);
const r3 = rlnorm(5, 2, 3.2);
precision(r3);