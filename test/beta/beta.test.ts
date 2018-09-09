import * as libR from '../../src/lib';
import { fixture } from './beta_fixture';
import { creatApproximator } from '../test-helpers';

const {
  Beta,
  R: { numberPrecision, each, multiplexer },
  rng: { SuperDuper, normal: { BoxMuller } }
} = libR;
const { abs } = Math;
const { isNaN, isFinite } = Number;
const approximitly = creatApproximator(1E-9)


describe('beta distribution', function n() {
  //
  const wh = new SuperDuper(0);
  const { dbeta, pbeta, qbeta, rbeta } = Beta(new BoxMuller(wh));
  const precision = numberPrecision(9);
  const seq = libR.R.seq()();
  //


  describe('dbeta density', () => {

    //construct tests for dbeta from fixtures
    const { dbeta: testData } = fixture;
    //abuse as a for-each loop
    //make sure it is an arrow function for `map` but not an arrow function for `it`
    each(testData)(({ input: inn, output: expectation, desc }, key) => {
     
      it(`density test: ${key}/${desc}`, function t() {
        const actuals = dbeta(inn.x, inn.shape1, inn.shape2, inn.ncp, inn.asLog);
        multiplexer(actuals, expectation)(approximitly);
      });
    });
  });

  describe('pbeta probability', () => {

    //construct tests for dbeta from fixtures
    const { pbeta: testData } = fixture;
    //abuse as a for-each loop
    //make sure it is an arrow function for `map` but not an arrow function for `it`
    each(testData)(({ input: inn, output: expectation, desc }, key) => {

      it(`propability test: ${key}/${desc}`, function t() {
        const actuals = pbeta(inn.x, inn.shape1, inn.shape2, inn.ncp, inn.lowerTail, inn.asLog);
        multiplexer(actuals, expectation)(approximitly);
      });
    });
  });
});
