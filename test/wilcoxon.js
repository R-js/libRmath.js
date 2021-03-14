//https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Wilcoxon.html
//https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test

process.env.DEBUGx = 'dnt, pnt, pbeta, seq';
const libR = require('../');
const {
    Wilcoxon,
    rng: { SuperDuper },
    R: { seq: _seq, arrayrify, numberPrecision }
} = libR;

//some usefull helpers
const pow = arrayrify(Math.pow);
const seq = _seq()();
const precision = numberPrecision(9); //restrict to 9 significant digits

//uses default argument "Normal()"
const sd = new SuperDuper(1234);
const { dwilcox, pwilcox, qwilcox, rwilcox } = Wilcoxon(sd);


const x = pow(seq(0, 10, 2), 2);
//[ 0, 4, 16, 36, 64, 100 ]

//1
const d1 = dwilcox(x, 8, 9);
precision(d1);

//2
const d2 = dwilcox(x, 100, 50); // same as dwilcox(x, 50, 100)
precision(d2);

//3
const d3 = dwilcox(x, 5, 34);
precision(d3);

//1
const q = pow(seq(0, 10, 2), 2);

//1
const p1 = pwilcox(q, 8, 9);
precision(p1);

//2
const p2 = pwilcox(q, 100, 50); // same as dwilcox(x, 50, 100)
precision(p2);

//3
const p3 = pwilcox(q, 5, 34);
precision(p3);

//probabilities (0, 1)
const p = seq(0, 1, 0.2);
//[ 0, 0.2, 0.4, 0.6, 0.8, 1 ]

//1
const q1 = qwilcox(p, 8, 9);
//[ 0, 27, 33, 39, 45, 72 ]

//2
const q2 = qwilcox(p, 100, 50); // same as dwilcox(x, 50, 100)
//[ 0, 2288, 2436, 2564, 2712, 5000 ]

//3
const q3 = qwilcox(p, 5, 34);
//[ 0, 64, 79, 91, 106, 170 ]

sd.init(1234);
//1
rwilcox(5, 8, 9);

//2
rwilcox(5, 100, 50);

//3
rwilcox(5, 5, 34)