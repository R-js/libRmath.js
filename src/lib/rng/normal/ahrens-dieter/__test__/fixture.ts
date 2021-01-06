/*
RNGkind(kind = "Mersenne-Twister", normal.kind = "Ahrens-Dieter")
set.seed(1234)
options(digits=12)
rnorm(10)
*/
export const rnormAfterSeed1234 = [
    0.2481097736881,
    -0.2706187939251,
    -0.2369425232434,
    -0.2734469221168,
    -1.012031679579,
    -0.3178051947761,
    2.2106875790674,
    -0.3863839302545,
    -2.3711893853504,
    -0.0736298345183,
];
/*
runif(1)
[1]0.28273358359
*/
//rnorm(4)
export const rnormAfterUniformRNGBleed = [-1.347180028436, -0.920722703879, 0.739601689827, 0.676643050103];
// runif(1)
//[1] 0.186722789658
// rnorm(2)
export const rnormAfterUniformRNGBleed2 = [0.572679284807, 0.843283742793];
// set.seed(0)
//rnorm(2)
export const rnormAfterUniformRNGReset = [-1.176167531784, 0.674117731643];
