 const l = require('./dist/lib');
 const { init: ik, getSeed: gk, unif_rand: rk } = l.KnuthTAOCP2002;
 const { init: il, getSeed: gl, unif_rand: rl } = l.LecuyerCMRG;
 il(0);
 ik(0);