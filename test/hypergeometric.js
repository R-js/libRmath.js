//https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Hypergeometric.html
//https://en.wikipedia.org/wiki/Hypergeometric_distribution
const libR = require('../dist/lib/libR.js');
//const libR = require('lib-r-math.js');
const {
    HyperGeometric,
    Normal,
    rng: { MersenneTwister },
    rng: { normal: { Inversion } }
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//init PRNG
const mt = new MersenneTwister(1234);
const { dhyper, phyper, qhyper, rhyper } = HyperGeometric(mt);
/*
dhyper(x, m, n, k, log = FALSE)
phyper(q, m, n, k, lower.tail = TRUE, log.p = FALSE)
qhyper(p, m, n, k, lower.tail = TRUE, log.p = FALSE)
rhyper(nn, m, n, k)
*/
dhyper(
    seq(0, 5), //success count, number of white balls drawn
    5, //population white balls
    3, //population red balls
    5, // total balls drawn from (5+3)
    false
)