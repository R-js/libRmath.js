//https://stat.ethz.ch/R-manual/R-devel/library/base/html/Special.html
//https://en.wikipedia.org/wiki/Combination
const libR = require('../dist/lib/libR.js');
const {
    special: { choose, lchoose },
    R: { seq: _seq, flatten: c }
} = libR;

//1
const coef1 = choose(4, c(0, 1, 2, 3, 4));
//[ 1, 4, 6, 4, 1 ]

//2
const coef2 = choose(4000, 30);
//3.8975671313115776e+75

//3
const coef3 = choose(2000, 998);
//Infinity

//1
const lcoef1 = lchoose(4, c(0, 1, 2, 3, 4));
/*[ 0,
1.3862943611198906,
1.7917594692280552,
1.3862943611198906,
0 ]*/

//2
const lcoef2 = lchoose(4000, 30);
//174.05423452055285

//3
const lcoef3 = lchoose(2000, 998);
//1382.2639955341506