//https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Geometric.html
//https://en.wikipedia.org/wiki/Geometric_distribution

const libR = require('../dist/lib/libR.js');
//const libR = require('lib-r-math.js');
const {
    Geometric,
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
const { dgeom, pgeom, qgeom, rgeom } = Geometric(Normal(new Inversion(mt)));
/*
dgeom(x, prob, log = FALSE)
pgeom(q, prob, lower.tail = TRUE, log.p = FALSE)
qgeom(p, prob, lower.tail = TRUE, log.p = FALSE)
rgeom(n, prob)
*/


//1
const d1 = dgeom(seq(0, 4), 0.5);
precision(d1);
//[ 0.5, 0.25, 0.125, 0.0625, 0.03125 ]

//2
const d2 = dgeom(seq(0, 4), 0.2, true);
precision(d2);
//[ -1.60943791, -1.83258146, -2.05572502, -2.27886857, -2.50201212 ]

//1
const p1 = pgeom(seq(5, 9), 0.1);
precision(p1);
//[ 0.468559, 0.5217031, 0.56953279, 0.612579511, 0.65132156 ]

//2
const p2 = pgeom(seq(5, 9), 0.1, false);
precision(p2);
//[ 0.531441, 0.4782969, 0.43046721, 0.387420489, 0.34867844 ]

//3
const p3 = pgeom(seq(5, 9), 0.2, false, true);
precision(p3);
//[ -1.33886131, -1.56200486, -1.78514841, -2.00829196, -2.23143551 ]

//1
const pp1 = pgeom(seq(5, 9), 0.2, false, true);
const q1 = qgeom(pp1, 0.2, false, true);
precision(q1);
//[ 5, 6, 7, 8, 9 ] returns seq(5,9)

//2
const pp2 = pgeom(seq(4, 8), 0.9, true, true);
const q2 = qgeom(pp2, 0.9, true, true);
precision(q2);
//[ 4, 5, 6, 7, 8 ] returns seq(4,9)

//3
const pp3 = pgeom([...seq(0, 6), Infinity], 0.5);
const q3 = qgeom(pp3, 0.5);
precision(q3);
//[ 0, 1, 2, 3, 4, 5, 6, Infinity ]

//1
mt.init(3456);
rgeom(5, 0.001);
//[ 573, 1153, 75, 82, 392 ]

//2
mt.init(9876);
rgeom(5, 0.999);
//[ 0, 0, 0, 0, 0 ]  low failure rate!!

//3
mt.init(934);
rgeom(10, 0.4);
//[ 1, 2, 6, 1, 0, 1, 0, 0, 1, 2 ]