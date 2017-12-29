const libR = require('../dist/lib/libR.js');
// Possible to arbitraty uniform PRNG source (example: SuperDuper)
const sd = new libR.rng.SuperDuper(0);
const inv1 = new libR.rng.normal.Inversion(sd);
// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses default: new MersenneTwister(0)
const inv2 = new libR.rng.normal.Inversion();

// reference to uniform PRNG under rng property
inv2.rng.init(0);
// bleed the normal PRNG 
new Array(5).fill('').map(() => inv2.norm_rand());
/*
[ 1.2629542848807933,
  -0.3262333607056494,
  1.3297992629225006,
  1.2724293214294047,
  0.4146414344564082 ]
*/
// its possible to bleed the uniform PRNG from the normal PRNG
inv2.unif_rand();
//0.061786270467564464
inv2.rng.unif_rand();
//0.20597457489930093