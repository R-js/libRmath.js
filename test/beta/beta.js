const libR = require('../dist/lib/libR.js');
const { Normal, Beta, rng } = libR;

// All options specified in creating Beta distribution object.
const beta1 = Beta(Normal(
    new rng.normal.BoxMuller( //
        new rng.SuperDuper(0)
    )
));

// Or

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const betaDefault = Beta();
const { dbeta, pbeta, qbeta, rbeta } = betaDefault;