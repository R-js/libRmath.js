const libR = require('../dist/lib/libR.js');
const { Normal, Beta, rng } = libR;
const { arrayrify } = libR.R;

const log = arrayrify(Math.log); // Make Math.log accept/return arrays aswell as scalars

// All options specified in creating Beta distribution object.
const beta1 = Beta(
    Normal(
        new rng.normal.BoxMuller(new rng.SuperDuper(0)) //
    )
);

// Or

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const betaDefault = Beta();
const { dbeta, pbeta, qbeta, rbeta } = betaDefault;

dbeta(0.4, 2, 2, 1);
//1.287245740256553

dbeta(0.4, 2, 2, undefined, true);
//0.36464311358790935

dbeta(0.4, 2, 2, 1, true);
//0.25250485075747914

dbeta([0, 0.2, 0.4, 0.8, 1, 1.2], 2, 2);
/*
    [ 0,
      0.9600000000000001,
      1.4400000000000002,
      0.9599999999999999,
      0,
      0 ]
*/
pbeta(0.5, 2, 5);

pbeta(0.5, 2, 5, 4);

pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, 4);

pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, undefined, false);

const logP = log([0, 0.2, 0.4, 0.6, 0.8, 1]);
console.log(logP);
pbeta(logP, 2, 5, undefined, false, true);