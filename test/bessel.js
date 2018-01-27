//https://stat.ethz.ch/R-manual/R-devel/library/base/html/Bessel.html
//https://en.wikipedia.org/wiki/Bessel_function
process.env.DEBUG = 'bessel_j, bessel_y, bessel_i, bessel_k, K_bessel';
const libR = require('./lib-r-math');

//strip mining
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
        mult,
        selector,
        map,
        flatten,
        flatten: c
    }
} = libR;
//some usefull helpers
const seq = _seq()();
const precision4 = numberPrecision(4); // restrict to 4 significant digits
const precision9 = numberPrecision(9); // restrict to 9 significant digits
const exp = arrayrify(Math.exp);

//some data for bessels
// orders
const musLarge = precision4(exp(seq(-2, 3.8, 1.1))); //large fractional orders
const musSmall = precision4(exp(seq(4, 4.3, 0.15))); // small fractional orders
const musLargeNegative = mult(musLarge, -1);
const musSmallNegative = mult(musSmall, -1);

// x >= 0
const x = precision4(exp(seq(-4, 10)));

let xJ = c(1, 7.389, 20.09, 7.389, 403.4, 1097,
    0.3679, 8103, 22030, 0.04979, 7.389, 1097);

let nuJ = c(11.02, 0.1353, 0.4066, 54.6, 63.43, 73.7, -3.669, -0.4066, -1.221, -63.43, -54.6, -73.7);

const bJ = precision9(besselJ(xJ, nuJ));


let xY = c(0.1353, 148.4, 22030, 20.09, 403.4, 1097, 0.1353, 2.718, 2981, 1, 8103, 22030);
let nuY = c(1.221, 3.669, 1.221, 63.43, 63.43,
    73.7, -1.221, -33.12, -0.1353, -63.43, -63.43, -73.7);

const bY = precision9(besselY(xY, nuY));

//besselI

let xI = c(0.3679, 1, 22030, 0.04979, 54.6, 403.4,
    0.04979, 2981, 8103, 0.1353, 0.3679, 2.718);

let nuI = c(3.669, 11.02, 1.221, 63.43, 73.7,
    63.43, -0.4066, -0.1353, -0.4066, -73.7, -54.6, -73.7);


const bI = precision9(besselI(xI, nuI, true));


//besselK


let xK = c(0.3679, 2.718, 403.4, 1, 54.6, 2981, 0.3679, 148.4,
    22030, 0.1353, 2.718, 148.4);

let nuK = c(3.669, 33.12, 11.02, 63.43, 73.7, 54.6, -3.669, -3.669, -1.221, -73.7, -73.7, -54.6);

const bK = precision9(besselK(xK, nuK, true));