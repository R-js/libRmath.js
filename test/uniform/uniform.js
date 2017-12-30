const libR = require('../dist/lib/libR.js');

const { rng, Uniform } = libR;

// select specific PRNG to use with uniform
const uni0 = Uniform(new rng.SuperDuper(0));

// will choose default: new rng.MersenneTwister(0)
const uni1 = Uniform();

// default will be "new rng.MersenneTwister(0)"
const { dunif, punif, qunif, runif } = uni1;

dunif(0, -1, 1, false);
// 0.5
dunif([NaN, -Infinity, Infinity, -1, 0, 0.5, 1, 2]);
// [ NaN, 0, 0, 0, 1, 1, 1, 0 ]
dunif([0, 1, 2], -2, 2);
//[ 0.25, 0.25, 0.25 ]
dunif([0, 1, 2], -2, 2, true);
// [ -1.3862943611198906, -1.3862943611198906, -1.3862943611198906 ]
punif(0.5);
// 0.5
punif([-Infinity, 0, 0.5, 1, Infinity]);
// [0, 0, 0.5, 1, 1]
punif([-Infinity, 0, 0.5, 1, Infinity], 0, 1, false);
// [1, 1, 0.5, 0, 0]
punif([-0.5, 0.5], -1, 1);
// [0.25, 0.75]
punif([-0.5, 0.5], -1, 1, false);
// [0.75, 0.25]

qunif(0);
// 0
qunif([0, 0.1, 0.5, 0.9, 1], -1, 1, false)
    // [ 1, 0.8, 0, -0.8, -1 ]
const { arrayrify } = libR.R;
const log = arrayrify(Math.log);

qunif(log([0, 0.1, 0.5, 0.9, 1]), -1, 1, false, true)
    // [ 1, 0.8, 0, -0.8, -1 ]
runif(4);
/*
[ 0.8966972001362592,
  0.2655086631421,
  0.37212389963679016,
  0.5728533633518964 ]
*/
runif(5, -1, 1, true);
/*
[ 0.8164155799895525,
  -0.5966361379250884,
  0.7967793699353933,
  0.8893505372107029,
  0.3215955849736929 ]
  */