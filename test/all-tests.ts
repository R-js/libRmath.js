import { expect } from 'chai';
import { sin, cos, tan, asin, acos, atan, atan2, cospi, sinpi, tanpi, ML_NAN, ML_POSINF, ML_NEGINF, sqrt, epsilonNear, DBL_EPSILON, isEpsilonNear, ISNAN } from '../index';

isEpsilonNear;
sin;
cos;
tan;
asin;
acos;
atan;
atan2;

describe('libRmath.js test suite', () => {

  describe('test NaN, Infinite equalities of CHAI', () => {
    it('Tests NaNs', () => {
      expect(ML_NAN).to.not.be.equal(ML_NAN);
      expect(ML_NAN).to.be.NaN;
    });
    it('Test Positive Infinity', () => {
      expect(ML_POSINF).to.be.equal(Number.POSITIVE_INFINITY);
    })
    it('Test Negative Infinity', () => {
      expect(ML_NEGINF).to.be.equal(Number.NEGATIVE_INFINITY);
    })
  });
  describe('function nearEpsilon', () => {
    it('check DBL_EPSILON accuracy', () => {
      [0, 1, 2, 3, -1, -2, 0.01, 1.001, 1E-10].forEach((x: number) => {
        expect(epsilonNear(x + DBL_EPSILON * 2, x)).to.be.above(x);
        expect(epsilonNear(x + DBL_EPSILON, x)).to.be.equal(x);
        expect(epsilonNear(x - DBL_EPSILON * 2, x)).to.be.below(x);
      });
      [1E6, 1E14, 1E3].forEach((x: number) => {
        expect(epsilonNear(x + DBL_EPSILON * 2, x)).to.be.equal(x);
        expect(epsilonNear(x + DBL_EPSILON, x)).to.be.equal(x);
        expect(epsilonNear(x - DBL_EPSILON * 2, x)).to.be.equal(x);
      });
    });
  });
  describe('trigonometric sinpi, cospi, tanpi,', () => {
    let arg = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 10, 101.5, ML_POSINF, ML_NEGINF, ML_NAN];
    let rcospi = [1, sqrt(0.5), 0, -sqrt(0.5), -1, -sqrt(0.5), 0, sqrt(0.5), 1, 1, 0, ML_NAN, ML_NAN, ML_NAN];
    let rsinpi = [0, sqrt(0.5), 1, sqrt(0.5), 0, -sqrt(0.5), -1, -sqrt(0.5), 0, 0, -1, ML_NAN, ML_NAN, ML_NAN];
    let rtanpi = [0, 1, ML_NAN, -1, 0, 1, ML_NAN, -1, 0, 0, ML_NAN, ML_NAN, ML_NAN, ML_NAN];

    for (let i = 0; i < arg.length; i++) {
      let x = arg[i];
      let _cospi = cospi(x);
      let _sinpi = sinpi(x);
      let _tanpi = tanpi(x);

      it(`test cospi(${x}) should be ${rcospi[i]}`, () => {
        if (!ISNAN(_cospi)) {
          expect(epsilonNear(_cospi, rcospi[i])).to.be.equal(rcospi[i]);
        }
        else {
          expect(epsilonNear(_cospi, rcospi[i])).to.be.NaN;
        }
      });
      it(`test sinpi(${x}) should be ${rsinpi[i]}`, () => {
        if (!ISNAN(_sinpi)) {
          expect(epsilonNear(_sinpi, rsinpi[i])).to.be.equal(rsinpi[i]);
        }
        else {
          expect(epsilonNear(_sinpi, rsinpi[i])).to.be.NaN;
        }
      });
      it(`test tanpi(${x}) should be ${rtanpi[i]}`, () => {
        if (!ISNAN(_tanpi)) {

          expect(epsilonNear(_tanpi, rtanpi[i])).to.be.equal(rtanpi[i]);
        }
        else {
          expect(epsilonNear(_tanpi, rtanpi[i])).to.be.NaN;
        }
      });
    }
  });

});


