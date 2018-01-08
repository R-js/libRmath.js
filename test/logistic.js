//https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Logistic.html
//https://en.wikipedia.org/wiki/Logistic_distribution

const libR = require('../dist/lib/libR.js');
//const libR = require('lib-r-math.js');
const { Logistic, rng: { MersenneTwister, SuperDuper } } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//init PRNG
const mt = new MersenneTwister(5321);
const customL = Logistic(mt);

//or use default  (uses MersenneTwister)
const defaultL = Logistic();
//
const { dlogis, plogis, qlogis, rlogis } = customL;
//

//quantile data
const x = [-Infinity, ...seq(-10, 10, 2.5), Infinity];

//1
const d1 = dlogis(x, 5, 2);
precision(d1);
/*[
  0, 0.000276236536, 0.000961511178, 0.00332402834,
  0.0112247052, 0.0350518583, 0.0865523935, 0.125,
  0.0865523935, 0.0350518583, 0 
]*/

//2
const d2 = dlogis(x, 0, 2, true);
precision(d2);
/*[ -Infinity, -5.70657788, -4.48963811, -3.35092665,
    -2.44700534, -2.07944154, -2.44700534, -3.35092665,
    -4.48963811, -5.70657788, -Infinity ]
*/

//3
const d3 = dlogis(x, -9, 2);
precision(d3);
/*
[ 0, 0.117501856, 0.108947497, 0.0524967927,
  0.0179667954, 0.00543311486, 0.00158130846,
  0.00045511059, 0.000130561049, 0.0000374203128,
  0 ]
*/

//1
const p1 = plogis(x, 5, 2);
precision(p1);
/*
[ 0, 0.000552778637, 0.00192673466, 0.00669285092,
  0.0229773699, 0.07585818, 0.222700139, 0.5,
  0.777299861, 0.92414182, 1 ]
*/

//2
const p2 = plogis(x, 0, 2, true, true);
precision(p2);
/*
[ -Infinity, -5.00671535, -3.77324546, -2.57888973,
  -1.50192908, -0.693147181, -0.251929081, -0.0788897343,
  -0.0232454644, -0.00671534849, 0 ]
*/

//3
const p3 = plogis(x, -9, 2, false);
precision(p3);
/*[ 1, 0.622459331, 0.320821301, 0.119202922,
    0.0373268873, 0.0109869426, 0.00317268284,
    0.000911051194, 0.000261190319, 0.0000748462275,
    0 ]*/

//1
const pp1 = plogis(x, 5, 2);
const q1 = qlogis(pp1, 5, 2);
precision(q1);
//[ -Infinity, -10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10, Infinity ]

//2
const pp2 = plogis(x, 0, 2);
const q2 = qlogis(log(pp2), 0, 2, true, true);
precision(q2);
//[ -Infinity, -10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10, Infinity ]

//3
const pp3 = plogis(x, -9, 2, false);
const q3 = qlogis(pp3, -9, 2, false);
precision(q3);
//[ -Infinity, -10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10, Infinity ]


//1
mt.init(453);
rlogis(5, )