//https://en.wikipedia.org/wiki/Poisson_distribution
//https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Poisson.html

const libR = require('../dist/lib/libR.js');
const {
    Poisson,
    rng: { MersenneTwister, SuperDuper },
    rng: { normal: { Inversion, BoxMuller } },
    R: { sum, div, mult }
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//default (uses Inversion and MersenneTwister)
const defaultP = Poisson();

//explicit use of PRNG
const mt = new MersenneTwister(0);
const explicitP = Poisson(new Inversion(mt));

const { dpois, ppois, qpois, rpois } = explicitP;
const x = seq(0, 10, 2);

//1
const d1 = dpois(x, 1, true);
precision(d1);
/*
[
  -1, -1.69314718, -4.17805383,
  -7.57925121, -11.6046029, -16.1044126
]*/

//2
const d2 = dpois(x, 4);
precision(d2);
/*
[ 0.0183156389,
  0.146525111,
  0.195366815,
  0.104195635,
  0.0297701813,
  0.00529247668 ]
*/

//3
const d3 = dpois(x, 10);
precision(d3);
/*[
  0.0000453999298, 0.00226999649,
  0.0189166374,  0.063055458,
  0.112599032,  0.125110036
]*/

//1
const p1 = ppois(x, 1, false, true);
precision(p1);
/*[
  -0.458675145,
  -2.52196826,
  -5.61033398,
  -9.39376875,
  -13.6975475,
  -18.4159155 ]*/

//2
const p2 = ppois(x, 4);
precision(p2);
/*
[ 0.0183156389,
  0.238103306,
  0.628836935,
  0.889326022,
  0.978636566,
  0.997160234 ]
*/

//3
const p3 = ppois(x, 10);
precision(p3);
/*[ 
  0.0000453999298,
  0.00276939572,
  0.0292526881,
  0.130141421,
  0.332819679,
  0.58303975 ]
*/

const p = seq(0, 1, 0.2);

//1
const q1 = qpois(log(p), 1, false, true);
precision(q1);
//[ Infinity, 2, 1, 1, 0, 0 ]

//2
const q2 = qpois(p, 4);
precision(q2);
//[ 0, 2, 3, 4, 6, Infinity ]

//3
const q3 = qpois(p, 10);
precision(q3);
//[ 0, 7, 9, 11, 13, Infinity ]

mt.init(123);
//1
const r1 = rpois(5, 1);
precision(r1);
//[ 0, 2, 1, 2, 3 ]

//2
const r2 = rpois(5, 4);
precision(r2);
//[ 1, 4, 7, 4, 4 ]

//3
const r3 = rpois(5, 10);
precision(r3);
//[ 15, 11, 5, 4, 13 ]