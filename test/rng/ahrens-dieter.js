const libR = require('../../dist/lib/libR');

// Possible to arbitraty uniform PRNG source (example: SuperDuper)
const sd = new libR.rng.SuperDuper(0);
const ad1 = new libR.rng.normal.AhrensDieter(sd);
// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses default: new MersenneTwister(0)
const ad2 = new libR.rng.normal.AhrensDieter();

// reference to uniform PRNG under rng property
ad2.rng.init(0);
// bleed the normal PRNG 
new Array(5).fill('').map(() => ad2.norm_rand());
/*
[
  -1.1761675317838745,
  0.674117731642815,
  1.0641435248508742,
  -0.1438972977736321,
  -1.2311497987786715
]
*/
// its possible to bleed the uniform PRNG from the normal PRNG
ad2.unif_rand();
//0.2016819310374558
ad2.rng.unif_rand();
//0.8983896849676967