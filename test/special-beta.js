//https://en.wikipedia.org/wiki/Beta_function
//https://stat.ethz.ch/R-manual/R-devel/library/base/html/Special.html
const libR = require('../dist/lib/libR.js');
const {
    special: {
        beta,
        lbeta
    },
    R: { arrayrify, seq: _seq, flatten: c }
} = libR;

const log = arrayrify(Math.log);
const seq = _seq()();

//1
const b1 = beta(4, 5);
//0.0035714285714285718

//2
const b2 = beta(c(0.5, 100), c(0.25, 50));
//[ 5.24411510858424, 1.49041211109555e-42 ]

//3
const lb1 = lbeta(4, 5);
//-5.634789603169249

const lb2 = lbeta(c(0.5, 100), c(0.25, 50));
//[1.6571065161914822, -96.30952123940715]