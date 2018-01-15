//http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Binomial.html
//https://en.wikipedia.org/wiki/Binomial_distribution
const libR = require('../dist/lib/libR.js');
const { Binomial } = libR;
const { arrayrify } = libR.R;

// make "log" accept arrays and scalars
const log = arrayrify(Math.log);

//Binomial()  uses Normal() as default argument,
const { dbinom, pbinom, qbinom, rbinom } = Binomial();

//1.
pbinom(4, 4, 0.5)

//2.
pbinom([0, 1, 2, 3, 4], 4, 0.5)

//3.
pbinom([0, 1, 2, 3, 4], 4, 0.5, true)

//4.
pbinom([0, 1, 2, 3, 4], 4, 0.5, false)

//5.
pbinom([0, 1, 2, 3, 4], 4, 0.5, false, true)


//1.
rbinom(2, 40, 0.5);
//[ 24, 18 ]

//2.
rbinom(3, 20, 0.5);
//[ 9, 10, 13 ]

//3.
rbinom(2, 10, 0.25);
//[ 1, 4 ]