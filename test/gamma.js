//https://stat.ethz.ch/R-manual/R-devel/library/stats/html/GammaDist.html
//https://en.wikipedia.org/wiki/Gamma_distribution

const libR = require('../dist/lib/libR.js');
//const libR = require('lib-r-math.js');
const {
    Gamma,
    rng: {
        KnuthTAOCP,
        normal: { KindermanRamage }
    },
    R: { arrayrify, numberPrecision, seq: seqCR }
} = libR;

//helpers
const log = arrayrify(Math.log);
const seq = seqCR()();
const precision = numberPrecision(9); //restrict to 9 significant digits

//init PRNG
const kn = new KnuthTAOCP(1234);
const { dgamma, pgamma, qgamma, rgamma } = Gamma(new KindermanRamage(kn));

//1.
const d1 = dgamma(seq(0, 10, 2), 1, 1 / 2);
precision(d1);
/*[ 0.5,
  0.183939721,
  0.0676676416,
  0.0248935342,
  0.00915781944,
  0.0033689735 ]*/

//2.
const d2 = dgamma(seq(0, 10, 2), 2, 0.5);
precision(d2);
/*[ 0,
  0.183939721,
  0.135335283,
  0.0746806026,
  0.0366312778,
  0.0168448675 ]*/

//3.
const d3 = dgamma(seq(0, 10, 2), 5, 1);
precision(d3);
/*[ 0,
  0.0902235222,
  0.195366815,
  0.133852618,
  0.0572522885,
  0.0189166374 ]*/

//4.
const d4 = dgamma(seq(0, 10, 2), 7.5, 1, undefined, true);
precision(d4);
/*[
  -Infinity,
  -5.02890756,
  -2.52345089,
  -1.88792769,
  -2.01799422,
  -2.56756113 ]
*/

//1.
const p1 = pgamma(seq(0, 10, 2), 1, 0.5);
precision(p1);
/*
[ 0,
  0.632120559,
  0.864664717,
  0.950212932,
  0.981684361,
  0.993262053 ]
*/

//2.
const p2 = pgamma(seq(0, 10, 2), 2, 0.5);
precision(p2);
/*
[ 0,
  0.264241118,
  0.59399415,
  0.800851727,
  0.908421806,
  0.959572318 ]
*/

//3.
const p3 = pgamma(seq(0, 10, 2), 5, 1, undefined, false, true);
precision(p3);
/*[ 
  0,
  -0.0540898509,
  -0.4638833,
  -1.25506787,
  -2.30626786,
  -3.53178381 ]
*/

//4.
const p4 = pgamma(seq(0, 10, 2), 7.5, 1, undefined, false, true);
precision(p4);
/*
[ 0,
  -0.00226521952,
  -0.0792784046,
  -0.387091358,
  -0.96219944,
  -1.76065222 ]
*/

//1.
const pp1 = pgamma(seq(0, 10, 2), 1, 0.5);
const q1 = qgamma(pp1, 1, 0.5);
precision(q1);
//[ 0, 2, 4, 6, 8, 10 ]

//2.
const pp2 = pgamma(seq(0, 10, 2), 2, 0.5);
const q2 = qgamma(pp2, 2, 0.5);
precision(q2);
//[ 0, 2, 4, 6, 8, 10 ]

//3.
const pp3 = pgamma(seq(0, 10, 2), 5, 1, undefined, false, true);
const q3 = qgamma(pp3, 5, undefined, 1, false, true);
precision(q3);
//[ 0, 2, 4, 6, 8, 10 ]

//4.
const pp4 = pgamma(seq(0, 10, 2), 7.5, 1, undefined, false);
const q4 = qgamma(log(pp4), 7.5, 1, undefined, false, true);
precision(q4);
//[ 0, 2, 4, 6, 8, 10 ]

//1.
kn.init(1234); // optionally re-init PRNG
const r1 = rgamma(5, 1, 0.5);
kn.init(1234);
const r1Alt = rgamma(5, 1, undefined, 2); //alternative using 'scale'
precision(r1);
//[ 0.0214551082, 1.49399813, 1.57265591, 0.233750469, 1.84371739 ]

//2.
kn.init(0);
const r2 = rgamma(5, 2, 0.5);
kn.init(0);
const r2Alt = rgamma(5, 2, undefined, 2); // alternative using 'scale'
precision(r2);
//[ 6.89112033, 2.25410883, 1.30227387, 4.1016237, 7.77081806 ]

//3.
kn.init(9856);
const r3 = rgamma(5, 7.5, 1);
kn.init(9856);
const r3Alt = rgamma(5, 7.5, undefined, 1);
precision(r3);
//[ 7.13748561, 6.64198712, 13.9948926, 6.36703157, 6.7039321 ]