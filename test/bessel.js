process.env.DEBUG = 'J_bessel, bessel_j, bessel_y, Y_bessel, bessel_i, I_bessel, bessel_k, K_bessel';
const libR = require('../dist/lib/libR.js');
const {
    special: { besselJ, besselK, besselI, bessekY },
    R: { arrayrify, seq: _seq, numberPrecision, map, sum }
} = libR;

//some usefull helpers
const log = arrayrify(Math.log);
const seq = _seq()();
const precision = numberPrecision(9); // restrict to 9 significant digits
const { pow, sqrt, abs } = Math;

const mus = [
    100 + 0.2,
    50,
    5,
    3,
    2,
    1. / 2,
    0.333,
    1. / 5,
    1. / 50,
    1. / 100,
    1. / 1000,
    1. / 10000,
    1.2e-5
];

const muDefects = [50, 0.5, 0.333];
const j1 = map(muDefects)(
    mu => besselJ(0.5, mu)
);
console.log(precision(j1));
//R:[1] 2.590558e-95 5.409738e-01 6.731040e-01
//JS:[ 2.6727866e-95, 0.522360023, 0.6326604 ]
//mu=50, 0.5, 0.333