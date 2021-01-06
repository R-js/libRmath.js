/*RNGkind(kind = "Mersenne-Twister", normal.kind = "Ahrens-Dieter")
set.seed(1234)
options(digits=12)
rnorm(10)
*/

export const rnormAfterSeed123 = [
    0.735828171633,
    0.638141668834,
    -0.751919884285,
    -0.616292355529,
    0.606060737737,
    -0.724081612362,
    1.704970141444,
    0.101845527822,
    -0.580301187173,
    -0.996663230085,
];
/*runif(1)
[1] 0.693591291783*/

export const rnormAfterUniformRNGBleed = [-1.526453950189, -0.443214156933, 1.390368002803, -0.725753160448];
// runif(1)
//[1] 0.837295628153
// rnorm(2)
export const rnormAfterUniformRNGBleed2 = [-0.366781499737, 1.583612166937];
// set.seed(0)
//rnorm(2)
export const rnormAfterUniformRNGReset = [1.29738758063, -0.9843785269];
