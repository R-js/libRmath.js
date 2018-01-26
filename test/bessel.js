process.env.DEBUG = 'bessel_j, bessel_y, bessel_i, bessel_k, K_bessel';

const libR = require('./lib-r-math');
const {
    special: { besselJ, besselK, besselI, besselY },
    R: { seq: _seq, numberPrecision, mult, multiplexer }
} = libR;
//some usefull helpers
const seq = _seq()();
const precision = numberPrecision(9); // restrict to 9 significant digits

//some data for bessels
const musLarge = [100, 50, 5.2, 3, 2];
const musSmall = [0.5, 0.33, 0.2, 0.0001, 1.2e-5];
const xSmallPositive = seq(0, 0.1, 0.01);
const xMediumPositive = seq(3, 24, 4);
const musSmallNegative = mult(musSmall, -1);

multiplexer(musLarge, xSmallPositive)((mu, x) => {
    console.log(`x:${x},\tmu:${mu})\t\t${besselJ(x, mu)}`);
});
/*
x:0,    mu:100)         0
x:0.01, mu:50)          2.9202842854069257e-180
x:0.02, mu:5.2)         2.349978842436202e-13
x:0.03, mu:3)           5.624683600869052e-7
x:0.04, mu:2)           0.00019997333466663107
  bessel_j bessel_j(0.05,nu=100): precision lost in result +0ms
x:0.05, mu:100)         0
x:0.06, mu:50)          2.360370615859834e-141
x:0.07, mu:5.2)         1.5854004540013213e-10
x:0.08, mu:3)           0.000010662400682605991
x:0.09, mu:2)           0.0010118167354717647
x:0.1,  mu:100)         8.452516535121787e-289
*/
multiplexer(musSmall, xMediumPositive)((mu, x) => {
    console.log(`x:${x},\tmu:${mu})\t\t${besselJ(x, mu)}`);
});
/*
x:3,    mu:0.5)         0.06500818287737568
x:7,    mu:0.33)                0.24924623753008018
x:11,   mu:0.2)         -0.21481056159385037
x:15,   mu:0.0001)              -0.014192198463757282
x:19,   mu:0.000012)            0.14662737523648428
x:23,   mu:0.5)         -0.14078605393988997
*/
//> besselJ(xMediumPositive,musSmall)
//[1]  0.06500818  0.24924624 -0.21481056 -0.01419220  0.14662738 -0.14078605

multiplexer(musSmall, xMediumPositive)((mu, x) => {
    console.log(`x:${x},\tmu:${mu})\t\t${besselY(x, mu)}`);
});
/*
x:3,    mu:0.5)         0.4560488207946332
x:7,    mu:0.33)                -0.1693958908893066
x:11,   mu:0.2)         -0.10808046308592172
x:15,   mu:0.0001)              0.20546652787660774
x:19,   mu:0.000012)            -0.1095224552651635
x:23,   mu:0.5)         0.08864765960675623
*/
multiplexer(musSmallNegative, xMediumPositive)((mu, x) => {
    console.log(`x:${x},\tmu:${mu})\t\t${besselY(x, mu)}`);
});
/*
x:3,    mu:-0.5)                0.06500818287737568
x:7,    mu:-0.33)               0.1283071875941596
x:11,   mu:-0.2)                -0.21370141153795402
x:15,   mu:-0.0001)             0.20546205912667123
x:19,   mu:-0.000012)           -0.1095169274655186
x:23,   mu:-0.5)                -0.14078605393988997

> besselY(xMediumPositive, -musSmall)
[1]  0.06500818  0.12830719 -0.21370141  0.20546206 -0.10951693 -0.14078605
*/
multiplexer(musLarge, xMediumPositive)((mu, x) => {
    console.log(`x:${x},\tmu:${mu})\t\t${besselY(x, mu)}`);
});
/*
x:3,    mu:100)         -7.474796102355667e+137
x:7,    mu:50)          -1.5574394388488233e+35
x:11,   mu:5.2)         -0.035672389622905254
x:15,   mu:3)           -0.07511482242816271
x:19,   mu:2)           0.09377652150506224
x:23,   mu:100)         -9.710787082846998e+49

> besselY(xMediumPositive, musLarge)
[1] -7.474796e+137  -1.557439e+35  -3.567239e-02  -7.511482e-02   9.377652e-02  -9.710787e+49

*/
multiplexer(musLarge, xSmallPositive)((mu, x) => {
    console.log(`x:${x},\tmu:${mu})\t\t${besselI(x, mu)}`);
});
/*
x:0,    mu:100)         0
x:0.01, mu:50)          2.920287148432138e-180
x:0.02, mu:5.2)         2.350054649428001e-13
x:0.03, mu:3)           5.625316413369228e-7
x:0.04, mu:2)           0.00020002666800003553
  bessel_i bessel_i(%g,nu=%g): precision lost in result
  bessel_i  0 100 +0ms
x:0.05, mu:100)         0
x:0.06, mu:50)          2.3604539245281854e-141
x:0.07, mu:5.2)         1.5860270666890643e-10
x:0.08, mu:3)           0.000010670934016060686
x:0.09, mu:2)           0.0010131836105184736
x:0.1,  mu:100)         8.452934986892065e-289

> besselI(xSmallPositive, musLarge)
 [1]  0.000000e+00 2.920287e-180  2.350055e-13  5.625316e-07  2.000267e-04  0.000000e+00 2.360454e-141  1.586027e-10
 [9]  1.067093e-05  1.013184e-03 8.452935e-289
Warning message:
In besselI(xSmallPositive, musLarge) :
  bessel_i(0.05,nu=100): precision lost in result
  */

multiplexer(musLarge, xMediumPositive)((mu, x) => {
    console.log(`x:${x},\tmu:${mu})\t\t${besselI(x, mu)}`);
});
/*
> besselI(xMediumPositive, musLarge)
[1] 4.454470e-141  6.674269e-38  2.061611e+03  2.492184e+05  1.476120e+07  4.622304e-52

x:3,    mu:100)         4.4544703417654986e-141
x:7,    mu:50)          6.674268819177063e-38
x:11,   mu:5.2)         2061.6112025468483
x:15,   mu:3)           249218.41964970334
x:19,   mu:2)           14761203.726313079
x:23,   mu:100)         4.622304143427105e-52
*/

multiplexer(musLarge, xMediumPositive)((mu, x) => {
    console.log(`x:${x},\tmu:${mu})\t\t${besselI(x, -mu)}`);
});
/*
x:3,    mu:100)         4.4544703417654986e-141
x:7,    mu:50)          6.674268819177063e-38
x:11,   mu:5.2)         2061.6111950876007
x:15,   mu:3)           249218.41964970334
x:19,   mu:2)           14761203.726313079
x:23,   mu:100)         4.622304143427105e-52

> besselI(xMediumPositive, -musLarge)
[1] 4.454470e-141  6.674269e-38  2.061611e+03  2.492184e+05  1.476120e+07  4.622304e-52
*/

multiplexer(musSmall, xMediumPositive)((mu, x) => {
    console.log(`x:${x},\tmu:${mu})\t\t${besselK(x, -mu)}`);
});

/*

x:3,    mu:0.5)         0.036025985131764596
x:7,    mu:0.33)                0.0004279049034886013
x:11,   mu:0.2)         0.0000062539093029084086
x:15,   mu:0.0001)              9.81953648556764e-8
x:19,   mu:0.000012)            1.6006712869352757e-9
x:23,   mu:0.5)         2.6817786978801076e-11

> besselK(xMediumPositive, -musSmall)
[1] 3.602599e-02 4.279049e-04 6.253909e-06 9.819536e-08 1.600671e-09 2.681779e-11
*/