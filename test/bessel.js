process.env.DEBUG = 'bessel_j, bessel_y, bessel_i, bessel_k, K_bessel';

const libR = require('./lib-r-math');
const {
    special: {
        besselJ,
        besselK,
        besselI,
        besselY
    },
    R: {
        seq: _seq,
        numberPrecision,
        multiplexer,
        arrayrify,
        mult
    }
} = libR;
//some usefull helpers
const seq = _seq()();
const precision4 = numberPrecision(4); // restrict to 9 significant digits
const exp = arrayrify(Math.exp);

//some data for bessels
// orders
const musLarge = precision4(exp(seq(-2, 3.8, 1.1))); //large fractional orders
const musSmall = precision4(exp(seq(4, 4.3, 0.15))); // small fractional orders
const musLargeNegative = mult(musLarge, -1);
const musSmallNegative = mult(musSmall, -1);

// x >= 0
const x = exp(seq(-4, 10));

function calculate(x, mu) {
    return {
        x: x,
        nu: mu,
        besselJ: besselJ(x, mu)
    };
}

//mixing curry
const Jbessel1 = multiplexer(x, musLarge)(calculate);
const Jbessel2 = multiplexer(x, musSmall)(calculate);
const Jbessel3 = multiplexer(x, musLargeNegative)(calculate);
const Jbessel4 = multiplexer(x, musSmallNegative)(calculate);