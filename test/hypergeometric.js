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

//1* m = 3, n = 3, m+n=6 ,k=5 (≤ m+n).
const d1 = dhyper(
    seq(0, 4), //success count, number of white balls drawn
    5, //population white balls
    3, //population red balls
    5, //total balls drawn from (5+3)
    false
);
precision(d1);
//[ 0, 0, 0.178571429, 0.535714286, 0.267857143 ]

//2* m = 3, n = 4, m+n = 7, k=7 (≤ m+n).
const d2 = dhyper(
    seq(0, 4), //success count, number of white
    3, //population white balls
    4, //population red balls
    7 //total balls drawn 7 ≤ (4+3), all balls are drawn
);
precision(d2);
//[ 0, 0, 0, 1, 0 ]

//*3. m = 3, n = 4, m+n = 7, k=5 (≤ m+n).
const d3 = dhyper(
    seq(0, 3), //success count, number of white balls drawn, must be ≤ 3
    3, //population white balls
    4, //population red balls
    5 //total balls drawn, must be < (4+3)
);
precision(d3);
//[ 0, 0.142857143, 0.571428571, 0.285714286 ]

//*4. m = 3, = 9, m+n = 12, k = 5 (≤ m+n)
const d4 = dhyper(
    seq(0, 3), //success count, number of white balls drawn, must be ≤ 3
    3, //population white balls
    9, //population red balls
    5 //total balls drawn, must be < (4+3)
);
precision(d4);
//[ 0.159090909, 0.477272727, 0.318181818, 0.0454545455 ]

/*
phyper(q, m, n, k, lower.tail = TRUE, log.p = FALSE)
*/

//*1. m=5, n=3, m+n=6 ,k=5 (≤ m+n).
const p1 = phyper(
    seq(2, 5), //success count, number of white balls drawn
    5, //population white balls
    3, //population red balls
    5 //total balls drawn from (5+3)
);
precision(p1);
//[ 0.178571429, 0.714285714, 0.982142857, 1 ]

//*2. m=9, n=18, m+n=27 ,k=9 (≤ m+n).
const p2 = phyper(
    seq(2, 6), //success count, number of white balls drawn
    9, //population white balls
    18, //population red balls
    9, //total balls drawn from (5+3)
    false
);
precision(p2);
//[ 0.66115526, 0.328440469, 0.0980994597, 0.671559531, 0.33884474 ]

//*3. m=9, n=18, m+n=27 ,k=9 (≤ m+n).
const p3 = phyper(
    seq(2, 6), //success count, number of white balls drawn
    9, //population white balls
    18, //population red balls
    6, //total balls drawn (from white add red)
    false,
    true
);
precision(p3);
//[ -1.1886521, -2.616312, -1.12942575, -2.76916902, -Infinity ]

/*

qhyper(p, m, n, k, lower.tail = TRUE, log.p = FALSE);

*/

//*1
const q1 = qhyper(
    seq(0, 1, 0.2), //probabilities of drawing white balls
    5, //population white balls
    2, //population red balls
    3 //total balls drawn from (5+2)
);
precision(q1);
//[ 1, 2, 2, 2, 3, 3 ]

//*2 there is a bug in R for log(0) gives a NaN instead of '3'
const q2 = qhyper(
    log(seq(0, 1, 0.2)), //probabilities of drawing white balls
    5, //population white balls
    2, //population red balls
    3, //total balls drawn from (5+2)
    false,
    true
);
precision(q2);
//[ 3, 3, 2, 2, 2, 1 ]
// R gives [ NaN, 3, 2, 2, 2, 1 ]

//*3 m=50, n=20, n+m=70, k=6 (≤ m+n)
const q3 = qhyper(
    seq(0, 1, 0.2), //probabilities of drawing white balls
    50, // population with white balls
    20, // population with red balls
    6 // total picks
);
precision(q3);
//[ 0, 3, 4, 5, 5, 6 ]


/*
rhyper(nn, m, n, k)
*/
//1. N=5, m=4, n=3, (m+n)=7,  k=5 (≤ m+n)
// k will pick at least 2 (from m) and at most all 4 (from m).
mt.init(1234);
rhyper(5, 4, 3, 5);
//[ 2, 3, 3, 3, 4 ]

//2. N=5, m=40, n=19, (m+n)=59, k=13 (≤ m+n)
mt.init(9876);
rhyper(5, 40, 19, 13);
//[ 7, 9, 11, 9, 9 ]

//3. N=5, m=4, n=17, (m+n)=23, k=3
mt.init(5688);
rhyper(5, 40, 99, 33);
//[ 12, 10, 10, 7, 12 ]