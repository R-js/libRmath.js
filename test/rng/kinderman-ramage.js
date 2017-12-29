const libR = require('../../dist/lib/libR');
// Possible to arbitraty uniform PRNG source (example: SuperDuper)
const sd = new libR.rng.SuperDuper(0);
const km1 = new libR.rng.normal.KindermanRamage(sd);
// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses default: new MersenneTwister(0)
const km2 = new libR.rng.normal.KindermanRamage();

// reference to uniform PRNG under rng property
km2.rng.init(0);
// bleed the normal PRNG 
new Array(5).fill('').map(() => km2.norm_rand());
/*
[ 0.3216151001162507,
  1.2325156080972606,
  0.28036952823499206,
  -1.1751964095317355,
  -1.6047136089272598 ]
*/
// its possible to bleed the uniform PRNG from the normal PRNG
km2.unif_rand();
//0.17655675252899528
km2.rng.unif_rand();
//0.6870228466577828