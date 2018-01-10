//https://en.wikipedia.org/wiki/Multinomial_distribution
//https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Multinom.html
//process.env.DEBUG = 'rmultinom, _rbinom, _qbinom, do_search, pbinom, pbeta, pbeta_raw';

const libR = require('../dist/lib/libR.js');
const {
    Multinomial,
    rng: { MersenneTwister },
    rng: { normal: { Inversion } },
    R: { sum, div, mult }
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const mt = new MersenneTwister();
const { dmultinom, rmultinom } = Multinomial(mt);

//1. binomial analog
const d1 = dmultinom({
    x: [3, 5],
    prob: [0.25, 0.75]
});
precision(d1);
//0.207641602

//2. binomial analog
const d2 = dmultinom({
    x: [3, 5, 9],
    prob: [0.2, 0.7, 0.1]
});
precision(d2);
//0.0000018304302

//3. binomial analog
const d3 = dmultinom({
    x: [3, 5, 9, 4],
    prob: [2, 8, 4, 6] // will normalized to = [ 2/20, 8/20, 4/20, 6/20 ]
});
precision(d3);
//0.00034601273

//1
mt.init(1234);
const prob1 = [0.167, 0.5, 0.167, 0.167];
rmultinom(4, 40, prob1);
/*
[ [ 4, 21, 8, 7 ],
  [ 7, 17, 9, 7 ],
  [ 2, 25, 7, 6 ],
  [ 7, 18, 8, 7 ] ]*/

//2
mt.init(5678);
const prob2 = [10, 30, 40, 90]; // probabilities will be normalized to sum(prob) = 1
rmultinom(4, 5299, prob2);
/*
[ [ 316, 945, 1271, 2767 ],
  [ 308, 896, 1206, 2889 ],
  [ 329, 871, 1292, 2807 ],
  [ 308, 930, 1265, 2796 ] ]*/

//3
mt.init(666);
const prob3 = [9, 8, 0, 6, 0, 2]; //0 means the bin will never be chosen
rmultinom(4, 9967, prob3);
/*
[ [ 3727, 3098, 0, 2299, 0, 843 ],
  [ 3563, 3142, 0, 2447, 0, 815 ],
  [ 3534, 3145, 0, 2455, 0, 833 ],
  [ 3702, 3125, 0, 2365, 0, 775 ] ]  */