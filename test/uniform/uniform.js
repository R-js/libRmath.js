const libR = require('../dist/lib/libR.js');

const { rng, Uniform } = libR;

// select specific PRNG to use with uniform
const uni1 = Uniform(new rng.SuperDuper(0));

// default will be "new rng.MersenneTwister(0)"
const { dunif, punif, qunif, runif } = uni1;

dunif(0, -1, 1, false);

dunif([NaN, -Infinity, Infinity, -1, 0, 0.5, 1, 2]);

dunif([0, 1, 2], -2, 2);

dunif([0, 1, 2], -2, 2, true);

punif(0.5);

punif([-Infinity, 0, 0.5, 1, Infinity]);

punif([-Infinity, 0, 0.5, 1, Infinity], false);

punif([-0.5, 0.5], -1, 1);

punif([-0.5, 0.5], -1, 1, log);