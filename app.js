 const l = require('./dist/lib');
 const { init: i, getSeed: g, unif_rand: r } = l.KnuthTAOCP;
 i(0);
 console.log(g());