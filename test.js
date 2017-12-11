 libR = require('./dist/lib/libR');
 let sd = new libR.rng.SuperDuper(0);
 bm = new libR.rng.normal.BoxMuller(sd);
 n = libR.normal(bm);
 sp = libR.special;