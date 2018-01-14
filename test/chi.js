//jkfbogers@gmail.com
//https://en.wikipedia.org/wiki/Chi-squared_distribution
//docs :https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html
process.env.DEBUG = '_qnchisq';
//
const libR = require('../dist/lib/libR.js');
const {
    Normal,
    ChiSquared,
    rng: { MersenneTwister },
    rng: { normal: { Inversion } }
} = libR;

// some usefull tools
const { arrayrify, seq: seqCreate } = libR.R;
const log = arrayrify(Math.log);
const seq = seqCreate()();

//initialize ChiSquared
const defaultChiSquared = ChiSquared();
const mt = new MersenneTwister(0);
const inv = new Inversion(mt);
const normal = Normal(inv);

const customChi2 = ChiSquared(normal);

const { dchisq, pchisq, qchisq, rchisq } = customChi2;

//1. seq(0,10)=[0, 2, 4, 6, 8, 10], df=5
dchisq(seq(0, 10, 2), 5);

//2. seq(0,10)=[0, 2, 4, 6, 8, 10], df=3, ncp=4
dchisq(seq(0, 10, 2), 3, 4);

//3. seq(0,10)=[0, 2, 4, 6, 8, 10], df=3, ncp=4, log=true
dchisq(seq(0, 10, 2), 3, 4, true);

//1. df=3, ncp=4
pchisq([0, 2, 4, 6, 10, Infinity], 3);

//2. df=8, ncp=4, lowerTail=false
pchisq([0, 2, 4, 6, 10, Infinity], 3, 0);

//3. df=8, ncp=4, lowerTail=false
pchisq([0, 2, 4, 6, 10, Infinity], 8, 4, false);

//1. df=3,
qchisq(seq(0, 1, 0.2), 3);

//2. df=3, ncp=undefined, lowerTail=false
qchisq(seq(0, 1, 0.2), 50, undefined, false);

//3. df=50, ncp=0, lowerTail=false, logP=true 
qchisq(log(seq(0, 1, 0.2)), 50, 0, false, true);

//1. df=6
mt.init(1234);
rchisq(5, 6);

//2. df=40, ncp=3
rchisq(5, 40, 3);

//3. df=20
rchisq(5, 20);