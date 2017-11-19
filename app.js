 const l = require('./dist/lib');
 const { init: i, getSeed: g, unif_rand: r } = l.KnuthTAOCP2002;
 i(0);
 console.log(g());