//http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Normal.html
//https://en.wikipedia.org/wiki/Normal_distribution
import { Normal } from '../../src/lib/normal';
import { numberPrecision, Rcycle } from '../../src/lib/r-func';

//some helpers

describe(`Normal distribution test`, () => {
    const { rnorm, dnorm, pnorm, qnorm } = Normal();
    const log = Rcycle(Math.log);
    const precision9 = numberPrecision(9);

    describe('dnorm', () => {
        it(`dnorm x=2,mu=1,sigma=1`, () => { return true; })
        rnorm(10);
        dnorm(10);
        pnorm(1);
        qnorm(3);
        precision9(log(1));



    })

})

/*


const q = [-1, 0, 1];
pnorm(0);
//0.5
const p2 = pnorm(q);
precision(p2);
//[ 0.15865525393145705, 0.5, 0.8413447460685429 ]

const p3 = pnorm(q, 0, 1, false); // propability upper tail, reverse above result
precision(p3);
//[ 0.8413447460685429, 0.5, 0.15865525393145705 ]

const p4 = pnorm(q, 0, 1, false, true); // probabilities as log(p)
precision(p4);

[ -0.17275377902344988,
  -0.6931471805599453,
  -1.8410216450092636 ]

const p5 = pnorm(q, 0, 1, false);
precision(p5);
//[ -0.1727537790234499, -0.6931471805599453, -1.8410216450092636 ]

const p = seq(0, 1, 0.25);
// qnorm
qnorm(0);

qnorm([-1, 0, 1]); // -1 makes no sense


qnorm(p, 0, 2); // take quantiles of 25%

qnorm(p, 0, 2, false); // same but use upper Tail of distribution

qnorm(log(p), 0, 2, false, true); // same but use upper Tail of distribution

rnorm(5)

rnorm(5, 2, 3);
*/