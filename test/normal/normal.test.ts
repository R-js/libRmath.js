import { fixture } from './normal_fixture';
import { creatApproximator, createComment } from '../test-helpers';
import * as libR from '../../src/lib/index'

const {
  Normal,
  R: { numberPrecision, each, multiplexer },
  rng: { SuperDuper, normal: { BoxMuller } }
} = libR;

describe('normal distribution', function n() {
  //
  const wh = new SuperDuper(0);
  const { dnorm, pnorm, qnorm, rnorm } = Normal(new BoxMuller(wh));
  const precision = numberPrecision(9);
  

  describe('dnorm density', () => {

    //construct tests for dbeta from fixtures
    const { dnorm: testData } = fixture;
    //abuse as a for-each loop
    //make sure it is an arrow function for `map` but not an arrow function for `it`
    each(testData)(({ input, output: expectation, desc }, key) => {
      const { x, mu, sigma, asLog } = input
      let i = 1
      multiplexer(x, mu, sigma, asLog, expectation)((_x, _mu, _sigma, _aslog, _expected) => {

        const desc = createComment({ x: _x, mu: _mu, sigma: _sigma, asLog: _aslog })
        const approximitly = creatApproximator(1E-9)
        it(`density test: ${key}_${i++}/dorm: ${desc}`, function t() {
          const actual = dnorm(_x, _mu, _sigma, _aslog);
          multiplexer(actual, _expected)(approximitly);
        });
      });
    });
  })
})