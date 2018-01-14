const libR = require('../dist/lib/libR.js');
// Possible to arbitraty uniform PRNG source (example: SuperDuper)
const sd = new libR.rng.SuperDuper(0);
const bkm1 = new libR.rng.normal.BuggyKindermanRamage(sd);
// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses default: new MersenneTwister(0)
const bkm2 = new libR.rng.normal.BuggyKindermanRamage();

// reference to uniform PRNG under rng property
bkm2.rng.init(0);
// bleed the normal PRNG 
new Array(5).fill('').map(() => bkm2.norm_rand());
/*
[ 0.3216151001162507,
  1.2325156080942392,
  0.28036952823392824,
  -1.1751964095317355,
  -1.6047136089275855 ]
*/
// its possible to bleed the uniform PRNG from the normal PRNG
bkm2.unif_rand();
//0.17655675252899528
bkm2.rng.unif_rand();
//0.6870228466577828