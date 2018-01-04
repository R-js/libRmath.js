//https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Fdist.html
//https://en.wikipedia.org/wiki/F-distribution
//

const libR = require('../dist/lib/libR.js');
const {
    FDist,
    Normal,
    rng: { MersenneTwister },
    rng: { normal: { Inversion } }
} = libR;

//some tools
const { arrayrify, seq: seqCreate, numberPrecision } = libR.R;
const log = arrayrify(Math.log);

// just like in R
const seq = seqCreate()();

//show number up to 6 significant digits
const precision = numberPrecision(9);

//1. initialize default
const fDefault = FDist();

//1 initialize explicit
const mt = new MersenneTwister(1234);
const fDist1 = FDist(Normal(new Inversion(mt)));

const { df, pf, qfe, rf } = fDist1;

/*R
df(seq(0,4,0.5), df1=5,df2=10, ncp=8)
[1] 0.0000000 0.0972907 0.2195236 0.2702561
[5] 0.2629984 0.2290042 0.1884130 0.1505385
[9] 0.1185561
*/

//1.
precision(df(seq(0, 4, 0.5), 5, 10, 8));
/*[ 
  0,
  0.0972906993,
  0.219523567,
  0.270256085,
  0.262998414,
  0.229004229,
  0.188412981,
  0.150538493,
  0.118556123 ]
*/

//2.
precision(
    df(seq(0, 4, 0.5), 50, 10, undefined, true)
);
/*[ -Infinity,
  -0.688217839,
  -0.222580527,
  -0.940618761,
  -1.7711223,
  -2.55950945,
  -3.28076319,
  -3.93660717,
  -4.53440492 ]*/

//R
/*2:
  > df(seq(0,4,0.5), df1=50,df2=10, log = TRUE)
[1]       -Inf -0.6882178 -0.2225805 -0.9406188
[5] -1.7711223 -2.5595094 -3.2807632 -3.9366072
[9] -4.5344049
*/

//R
/*3:
> df(seq(0, 4, 0.5), 6, 25)
[1] 0.000000000 0.729921524 0.602808536
[4] 0.323999956 0.155316972 0.072482940
[7] 0.034022568 0.016280785 0.007986682
*/

//3
precision(df(seq(0, 4, 0.5), 6, 25));
/*[ 0,
  0.729921524,
  0.602808536,
  0.323999956,
  0.155316972,
  0.0724829398,
  0.0340225684,
  0.0162807852,
  0.00798668195 ]*/

precision(df(seq(0, 4), 6, 25, 8, true));
//[ -Infinity, -1.38207439, -1.09408866, -1.54026185, -2.22490033 ]

/*R
> df(seq(0, 4), 6, 25, 8,log=TRUE)
[1]      -Inf -1.382074 -1.094089 -1.540262 -2.22490
*/