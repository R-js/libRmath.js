//import { expect } from 'chai';

import { assert } from 'chai';
import * as libR from '../src/lib';
import { selector } from '../src/lib/r-func';
const {
  Beta,
  R: { arrayrify, numberPrecision, map },
  rng: { SuperDuper, normal: { BoxMuller } }
} = libR;
const { abs } = Math;

describe('beta distribution', function() {
  //
  const wh = new SuperDuper(0);
  const { dbeta, pbeta, qbeta, rbeta } = Beta(new BoxMuller(wh));
  const precision = numberPrecision(9);
  const seq = libR.R.seq()();
  //
  describe('dbeta density', () => {
    let testNr = 1;

    it(`density test: ${testNr++}`, function() {
      const d1 = dbeta(0.4, 2, 2, 1) as number;
      assert.approximately(d1, 1.28724574, 1e-9, 'numbers are close');
    });

    it(`density test: ${testNr++}`, function() {
      const d2 = dbeta(0.4, 2, 2, undefined, true) as number;
      assert.approximately(d2, 0.364643114, 1e-9, 'numbers are close');
    });

    it(`density test: ${testNr++}`, function() {
      const d3 = dbeta(0.4, 2, 2, 1, true) as number;
      assert.approximately(d3, 0.252504851, 1e-9, 'numbers are close');
    });

    it(`density test: ${testNr++}`, function() {
      const d4 = dbeta([0, 0.2, 0.4, 0.8, 1, 1.2], 2, 2) as number[];
      const fixture = [0, 0.96, 1.44, 0.96, 0, 0];
      d4.map((v, i) =>
        assert.approximately(v, fixture[i], 1e-9, 'numbers are close')
      );
    });
  });

  describe('pbeta cumulative probability', function() {
    let testNr = 1;
    let prefix = 'cumulative probability';
    const q = [0, 0.2, 0.4, 0.6, 0.8, 1];

    it(`${prefix}: ${testNr++}`, function() {
      const p1 = pbeta<number>(0.5, 2, 5);
      assert.approximately(p1, 0.890625, 1e-9, 'numbers are close');
    });

    it(`${prefix}: ${testNr++}`, function() {
      const p2 = pbeta(0.5, 2, 5, 4);
      assert.approximately(p2, 0.63923843, 1e-9, 'numbers are close');
    });

    it(`${prefix}: ${testNr++}`, function() {
      const p3 = pbeta(q, 2, 5, 4);
      [0, 0.106517718, 0.438150345, 0.813539396, 0.986024517, 1].map(
        (v, i) => assert.approximately(v, p3[i], 1e-9, 'numbers are close')
      );
    });

    it(`${prefix}: ${testNr++}`, function() {
      const p4 = pbeta(q, 2, 5, undefined);
      [0, 0.345027474, 0.76672, 0.95904, 0.9984, 1].map((v, i) =>
        assert.approximately(v, p4[i], 1e-9, 'numbers are close')
      );
    });
  });
});
