//process.env.DEBUG = 'do_search';
const libR = require('../dist/lib/libR.js');

const { Normal, NegativeBinomial, rng } = libR;

// All options specified in creating NegativeBinomial distribution object.
const negBinom1 = NegativeBinomial(
    Normal(
        new rng.normal.BoxMuller(new rng.SuperDuper(0)) //
    )
);
//
// Or
// Just go with defaults
const { arrayrify } = libR.R;
const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial();

const log = arrayrify(Math.log);
const seq = libR.R.seq()();

//1. note: sequence has step 2
dnbinom(seq(0, 10, 2), 3, 0.5);
/*
   [0.12500000000000003,
    0.18749999999999997,
    0.11718749999999997,
    0.05468750000000006,
    0.02197265624999999,
    0.008056640624999997]
*/

//2. alternative presentation with `mu` = n*(1-p)/p
dnbinom(seq(0, 10, 2), 3, undefined, 3 * (1 - 0.5) / 0.5);
/*[0.12500000000000003,
    0.18749999999999997,
    0.11718749999999997,
    0.05468750000000006,
    0.02197265624999999,
    0.008056640624999997]
*/

//1.
pnbinom([0, 2, 3, 4, 6, 8, 10, Infinity], 3, 0.5);
/*[ 0.12500000000000003,
      0.5000000000000001,
      0.65625,
      0.7734374999999999,
      0.91015625,
      0.96728515625,
      0.98876953125,
      1
    ]
*/

//2. alternative presentation of 1 with mu = n(1-p)/p
pnbinom([0, 2, 3, 4, 6, Infinity], 3, undefined, 3 * (1 - 0.5) / 0.5);
/*[0.12500000000000003,
    0.5000000000000001,
    0.65625,
    0.7734374999999999,
    0.91015625,
    0.96728515625,
    0.98876953125,
    1
]*/

//3
pnbinom([0, 2, 3, 4, 6, Infinity], 3, 0.5, undefined, false);
/*[ 0.875,
  0.4999999999999999,
  0.34374999999999994,
  0.2265625000000001,
  0.08984375000000003,
  0 ]
  */

//4
pnbinom([0, 2, 3, 4, 6, Infinity], 3, 0.5, undefined, false, true);
/*[
  -0.13353139262452263,
  -0.6931471805599455,
  -1.067840630001356,
  -1.4847344339331427,
  -2.4096832285504126,
  -Infinity
]*/

//1. inversion
qnbinom(pnbinom([0, 2, 4, 6, Infinity], 3, 0.5), 3, 0.5);
//[ 0, 2, 4, 6, Infinity ]

//2. lowerTail=false
qnbinom(pnbinom([0, 2, 4, 6, Infinity], 3, 0.5), 3, 0.5, undefined, false);
//[ 6, 2, 1, 0, 0 ]

//3. with logP=true
qnbinom(log(pnbinom([0, 2, 4, 6, Infinity], 3, 0.5)), 3, 0.5, undefined, false, true)
    //[ 6, 2, 1, 0, 0 ]