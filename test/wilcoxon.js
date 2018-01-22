//https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Wilcoxon.html
//https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test


process.env.DEBUGx = 'dnt, pnt, pbeta, seq';
const libR = require('../dist/lib/libR.js');
const {
    Normal,
    StudentT,
    rng: { MarsagliaMultiCarry },
    rng: {
        normal: { AhrensDieter }
    }
} = libR;

//some usefull helpers
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//uses default argument "Normal()"
const defaultT = StudentT();