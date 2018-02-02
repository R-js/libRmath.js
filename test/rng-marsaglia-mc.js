const libR = require('../dist/lib/libR.js');
const {
    rng: { MarsagliaMultiCarry, timeseed },
    R: { numberPrecision }
} = libR;

//usefull helpers
const precision = numberPrecision(9); //9 significant digits

// Some options on seeding given below
const mmc = new MarsagliaMultiCarry(1234); // use seed = 1234 on creation

mmc.init(timeseed());
mmc.init(0); // also, defaults to '0' if seed is not specified
mmc.seed;
//[ -835792825, 1280795612 ]

const rmmc = mmc.unif_rand(5);
precision(rmmc);
//[ 0.169153755, 0.53154353, 0.594605297, 0.233315406, 0.45765618 ]