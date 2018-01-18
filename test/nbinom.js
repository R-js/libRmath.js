//https: //stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html
//
const libR = require('../dist/lib/libR.js');
const {
    NegativeBinomial,
    R: { precisionNumber, arrayrify },
    rng: {
        SuperDuper,
        normal: { BoxMuller }
    }
} = libR;
//some helpers
const seq = libR.R.seq()();
const precision = precisionNumber(9);
const log = arrayrify(Math.log);

//explicit use of PRNG
const sd = new SuperDuper(12345);
const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial(new BoxMuller(sd));

//some data
const x = seq(0, 10, 2);

//1.
const d1 = dnbinom(x, 3, 0.5);
precision(d1);
//[ 0.125, 0.1875, 0.1171875, 0.0546875, 0.0219726562, 0.00805664062 ]

//2. alternative presentation with `mu` = n*(1-p)/p
const d2 = dnbinom(x, 3, undefined, 3 * (1 - 0.5) / 0.5);
//[ 0.125, 0.1875, 0.1171875, 0.0546875, 0.0219726562, 0.00805664062 ]

//some data
x = [0, 2, 3, 4, 6, Infinity];

//1.
const p1 = pnbinom(x, 3, 0.5);
precision(p1);
//[ 0.125, 0.5, 0.65625, 0.7734375, 0.91015625, 1 ]

//2. alternative presentation of 1 with mu = n(1-p)/p
const p2 = pnbinom(x, 3, undefined, 3 * (1 - 0.5) / 0.5);
precision(p2);
//[ 0.125, 0.5, 0.65625, 0.7734375, 0.91015625, 1 ]

//3
const p3 = pnbinom(x, 3, 0.5, undefined, false);
//[ 0.875, 0.5, 0.34375, 0.2265625, 0.08984375, 0 ]

//4
const p4 = pnbinom(x, 3, 0.5, undefined, false, true);
precision(p4)
    /*[
      -0.133531393,  -0.693147181,  -1.06784063,
      -1.48473443,   -2.40968323,   -Infinity ]*/


//1. inversion
qnbinom(pnbinom([0, 2, 4, 6, Infinity], 3, 0.5), 3, 0.5);
//[ 0, 2, 4, 6, Infinity ]

//2. lowerTail=false
qnbinom(pnbinom([0, 2, 4, 6, Infinity], 3, 0.5), 3, 0.5, undefined, false);
//[ 6, 2, 1, 0, 0 ]

//3. with logP=true
qnbinom(log(pnbinom([0, 2, 4, 6, Infinity], 3, 0.5)), 3, 0.5, undefined, false, true)
    //[ 6, 2, 1, 0, 0 ]

//1. size = 100, prob=0.5, so expect success/failure to be approximatly equal
rnbinom(7, 100, 0.5);
//[ 109, 95, 89, 112, 88, 90, 90 ]

//2. size = 100, prob=0.1, so expect failure to be approx 10 x size
rnbinom(7, 100, 0.1);
//[ 989, 1004, 842, 974, 820, 871, 798 ]

//3. size = 100, prob=0.9, so expect failure to be approx 1/10 x size
rnbinom(7, 100, 0.9);
//[ 10, 14, 9, 7, 12, 11, 10 ]

sd.init(98765); //reset
//4. same as (1.)
rnbinom(7, 100, undefined, 100 * (1 - 0.5) / 0.5);
//[ 109, 95, 89, 112, 88, 90, 90 ]