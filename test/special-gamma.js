//https://stat.ethz.ch/R-manual/R-devel/library/base/html/Special.html
const libR = require('../dist/lib/libR.js');
const {
    special: {
        digamma,
        gamma,
        lgamma,
        pentagamma,
        tetragamma,
        trigamma,
        psigamma
    },
    R: { numberPrecision, multiplex, seq: _seq, flatten: c }
} = libR;

//some helpers
const seq = _seq()();
const pow = multiplex(Math.pow);
const precision9 = numberPrecision(9); //truncate past 9 digits

//data
const x = c(0, pow(4, seq(1, 10, 2)), Infinity);

//1 first derivative of log(Gamma(x))
const dig1 = precision9(digamma(x));
//[ 1.25611767, 4.15105024, 6.93098344, 9.70403001, 12.4766473 ]

//2 second derivative of log(Gamma(x))
digamma(c(0, Infinity));
//[ NaN, Infinity ]

//1  second derivative of log(Gamma(x))
const tri1 = precision9(trigamma(x));
//[ 0.283822956,  0.0157477061, 0.000977039492, 0.0000610370189, 0.00000381470454 ]

//2 
trigamma(c(0, Infinity));
//[ Infinity, 0 ]

//1 third derivative of the log(Gamma(x))
const tetra1 = precision9(tetragamma(x));
/*[ -0.0800397322,    -0.000247985122,    -9.54606094e-7,
    -3.72551768e-9,   -1.45519707e-11 ]
*/

//4
tetragamma(c(0, Infinity));
//[ NaN, -0 ]

//5
const pent1 = precision9(pentagamma(x));
/*[ 
    0.0448653282,    0.00000781007088,    1.86537541e-9,
    4.54788986e-13,  1.11022938e-16 ]
*/

//6
pentagamma(c(0, Infinity));
//[ Infinity, 0 ]

//7
const psi1 = precision9(psigamma(x));
//[ 1.25611767, 4.15105024, 6.93098344, 9.70403001, 12.4766473 ]

//8
const psi4 = precision9(psigamma(x, 3));
/*[ 
    0.0448653282,   0.00000781007088,  1.86537541e-9,
    4.54788986e-13, 1.11022938e-16 
]*/

//9
const psi5 = precision9(psigamma(x, 9));
//[ 0.391017719, 2.39967982e-12, 3.27136005e-23, 4.74089512e-34, 6.89713427e-45 ]
//#psigamma(x, 9);
//#[1] 3.91017719e-01 2.39967982e-12 3.27136005e-23 4.74089512e-34 6.89713427e-45

//generate data
const gx = seq(2, 5, .5).map(x => x * x - 9);
//[ -5, -2.75, 0, 3.25, 7, 11.25, 16 ]

const g = precision9(gamma(gx));
//[ NaN, -1.00449798, NaN, 2.54925697, 720, 6552134.14, 1307674370000 ]

const lg = precision9(lgamma(gx));
//[ Infinity,  0.00448789754,  Infinity,  0.935801931,  6.57925121,  15.6953014, 27.8992714 ]