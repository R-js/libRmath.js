//https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Fdist.html
//https://en.wikipedia.org/wiki/F-distribution
//

const libR = require('../dist/lib/libR.js');
const {
    FDist,
    rng: {
        MersenneTwister,
        normal: { KindermanRamage }
    },
    R: { numberPrecision }
} = libR;

//helpers
const seq = libR.R.seq()();
const precision = numberPrecision(9);

const mt = new MersenneTwister(1234);
const { df, pf, qf, rf } = FDist(new KindermanRamage(mt));

//1.
mt.init(1234);
precision(rf(5, 8, 6));
//[1] 0.3911730 0.5282256 1.0947890 2.4961292 0.1436789

//2.
precision(rf(5, Infinity, Infinity));
//[ 1, 1, 1, 1, 1 ]

//3. produces NaNs because df1 or/and df2 is Infinity and ncp !== undefined (yes, ncp=0 produces NaNs!)
precision(rf(5, 40, Infinity, 0));
//[ NaN, NaN, NaN, NaN, NaN ]

//4. 
precision(rf(5, 400, Infinity));
//[ 1.00424008, 1.00269156, 1.03619851, 0.965292995, 0.904786448 ]