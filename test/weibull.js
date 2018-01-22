//https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Weibull.html
//https://en.wikipedia.org/wiki/Weibull_distribution

const libR = require('../dist/lib/libR.js');
//const libR = require('lib-r-math.js');
const {
    Weibull,
    rng: { WichmannHill },
    R: { arrayrify, seq: _seq, numberPrecision, map, sum }
} = libR;

//some usefull helpers
const log = arrayrify(Math.log);
const seq = _seq()();
const precision = numberPrecision(9); // restrict to 9 significant digits
const { pow, sqrt, abs } = Math;

const wh = new WichmannHill(1234);
const explicitW = Weibull(wh);

//uses Mersenne-Twister
const defaultW = Weibull();
const { dweibull, pweibull, qweibull, rweibull } = explicitW;

const x = seq(0, 10, 2);
const x2 = [...seq(0, 1, 0.2), Infinity];

//1
const d1 = dweibull(x, 1, 2);
precision(d1);
/*[
  0.5,           0.183939721,     0.0676676416,
  0.0248935342,  0.00915781944,   0.0033689735 ]*/

//2
const d2 = dweibull(x, 0.5, 2);
precision(d2);
/*[
  Infinity,    0.57624084,  0.357439558,
  0.263940781, 0.210009077,  0.174326108 ]*/

//3
const d3 = dweibull(x2, 1.5, 9);
precision(d3);
/*[
  0,            0.0247630314,  0.0348087379, 0.0422987464,
  0.0483908235, 0.0535355802,  0 ]*/


//1
const p1 = pweibull(x, 1, 2);
precision(p1);
/*[ 
  0,            0.632120559,  0.864664717,  0.950212932,
  0.981684361,  0.993262053 ]*/

//2
const p2 = pweibull(x, 0.5, 2);
precision(p2);
/*[ 
    0,              0.632120559,    0.756883266,    0.823078794,
    0.864664717,    0.893122074 ]*/

//3
const p3 = pweibull(x2, 1.5, 9);
precision(p3);
/*[ 
    0,              0.0247630314,    0.0348087379,    0.0422987464,
    0.0483908235,   0.0535355802,    0 
]*/

const pp = seq(0, 1, 0.2);

//1
const q1 = qweibull(pp, 1, 2);
precision(q1);
//[ 0, 0.446287103, 1.02165125, 1.83258146, 3.21887582, Infinity ]

//2
const q2 = qweibull(pp, 0.5, 2);
precision(q2);
//[ 0, 0.099586089, 0.521885636, 1.67917741, 5.18058079, Infinity ]

const q3 = qweibull(pp, 1.5, 9);
precision(q3);
//[ 0, 3.31104744, 5.75118881, 8.49046297, 12.3601952, Infinity ]

//1
const r1 = rweibull(5, 1, 2);
precision(r1);
//[ 1.76155181, 0.903023096, 0.444343952, 0.290091816, 0.556104098 ]

//2
const r2 = rweibull(5, 0.5, 2);
precision(r2);
//[ 0.271864356, 5.52787221, 0.591076799, 0.801653652, 5.62018481 ]

//3
const r3 = rweibull(5, 1.5, 9);
precision(r3);
//[2.45445219, 16.6940144, 12.0119534, 13.5791705, 8.9347082]