//http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Normal.html
//https://en.wikipedia.org/wiki/Normal_distribution
const libR = require('../dist/lib/libR.js');
const {
    Normal,
    rng: { seq: _seq, arrayrify, numberPrecision }
} = libR;

//some helpers
const log = arrayrify(Math.log);
const seq = seq()();
const precision = numberPrecision(9);
const { rnorm, dnorm, pnorm, qnorm } = Normal();

const q = [-1, 0, 1];
pnorm(0);
//0.5
const p2 = pnorm(q);
precision(p2);
//[ 0.15865525393145705, 0.5, 0.8413447460685429 ]

const p3 = pnorm(q, 0, 1, false); // propability upper tail, reverse above result
precision(p3);
//[ 0.8413447460685429, 0.5, 0.15865525393145705 ]

const p4 = pnorm(q, 0, 1, false, true); // probabilities as log(p)
precision(p4);
/*
[ -0.17275377902344988,
  -0.6931471805599453,
  -1.8410216450092636 ]
*/
const p5 = pnorm(q, 0, 1, false);
precision(p5);
//[ -0.1727537790234499, -0.6931471805599453, -1.8410216450092636 ]

const p = seq(0, 1, 0.25);
// qnorm
qnorm(0);

qnorm([-1, 0, 1]); // -1 makes no sense


qnorm(p, 0, 2); // take quantiles of 25%

qnorm(p, 0, 2, false); // same but use upper Tail of distribution

qnorm(log(p), 0, 2, false, true); // same but use upper Tail of distribution

rnorm(5)

rnorm(5, 2, 3);