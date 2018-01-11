//https://stat.ethz.ch/R-manual/R-patched/library/stats/html/SignRank.html
//https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test

const libR = require('../dist/lib/libR.js');
const {
    SignRank,
    rng: { MersenneTwister, MarsagliaMultiCarry },
    R: { sum, div, mult }
} = libR;

//some usefull helpers
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//default MersenneTwister
const defaultSR = SignRank();

//explicit use of PRNG
const mmc = new MarsagliaMultiCarry(0);
const explicitSR = SignRank(mmc);

const { dsignrank, psignrank, qsignrank, rsignrank } = explicitSR;

//1
const d1 = dsignrank([0, 1, 2, 3, 4, 5], 9);
precision(d1);
/*[
  0.001953125,
  0.001953125,
  0.001953125,
  0.00390625,
  0.00390625,
  0.005859375 ]*/

//2
const d2 = dsignrank([3, 4, 5, 6, 7, 8], 4);
precision(d2);
//[ 0.125, 0.125, 0.125, 0.125, 0.125, 0.0625 ]

//3
const d3 = dsignrank([15, 16, 17, 18, 19, 20], 11);
precision(d3);
/*[ 
  0.0107421875,
  0.0122070312,
  0.013671875,
  0.015625,
  0.0170898438,
  0.0190429687 ]*/

const p1 = psignrank([0, 1, 2, 3, 4, 5], 9);
precision(p1);
/*
[ 0.001953125,
  0.00390625,
  0.005859375,
  0.009765625,
  0.013671875,
  0.01953125 ]*/

const p2 = psignrank([3, 4, 5, 6, 7, 8], 4);
precision(p2);
//[ 0.3125, 0.4375, 0.5625, 0.6875, 0.8125, 0.875 ]

const p3 = psignrank([15, 16, 17, 18, 19, 20], 11);
precision(p3);
/*
[ 0.0615234375,
  0.0737304687,
  0.0874023437,
  0.103027344,
  0.120117187,
  0.139160156 ]
*/

//1
const q1 = qsignrank(seq(0, 1, 0.2), 9);
precision(q1);
//[ 0, 15, 20, 25, 30, 45 ]

//2
const q2 = qsignrank(seq(0, 1, 0.2), 4);
precision(q2);
//[ 0, 15, 20, 25, 30, 45 ]

//3 there is a bug in R, it gives NaN instead of 66
const q3 = qsignrank(log(seq(0, 1, 0.2)), 11, false, true);
precision(q3);
//[ 66, 43, 36, 30, 23, 0 ]

//1
mmc.init(4569);
rsignrank(5, 9);
//[ 17, 15, 32, 12, 20 ]

//2
rsignrank(5, 25);
//[ 140, 80, 125, 198, 157 ]

//3
rsignrank(5, 4)
    //[ 4, 7, 8, 10, 8 ]