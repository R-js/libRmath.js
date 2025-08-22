import { loadData } from '@common/test-helpers/load';
import { resolve } from 'path';

import { globalUni, RNGkind } from '@rng/global-rng';

import { rmultinom } from '..';

describe('rmultinom', function () {
    describe('invalid input check and edge cases', () => {
        it('size < 0 throws exception', () => {
            const prob = new Float64Array([0.4]);
            expect(() => rmultinom(1, -1, prob)).toThrowError('invalid second argument "size"');
        });
        it('n < 0 throws exception', () => {
            const prob = new Float64Array([0.4]);
            expect(() => rmultinom(-1, -1, prob)).toThrowError('invalid first argument "n"');
        });
        it('probs = [], size = 0, n = 0, no positive probabilities', () => {
            const prob = new Float64Array(0);
            expect(() => rmultinom(0, 0, prob)).toThrowError('no positive probabilities');
        });
        it('probs = [-0.4], size = 1, n = 1, negative probability ', () => {
            const prob = new Float64Array([-0.4]);
            expect(() => rmultinom(1, 1, prob)).toThrowError('negative probability');
        });
        it('probs = [0, 0], size = 1, n = 1, no positive probabilities', () => {
            const prob = new Float64Array([0, 0]);
            expect(() => rmultinom(1, 1, prob)).toThrowError('no positive probabilities');
        });
    });
    describe('fidelity', () => {
        beforeEach(() => {
            RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
            globalUni().init(123456);
        });
        it('probs = [0.4,0.4,0.0], size = 0, n = 0, empty array output', () => {
            const prob = new Float64Array([0.4, 0.4, 0.4]);
            expect(rmultinom(0, 0, prob)).toEqualFloatingPointBinary([]);
        });
        it('probs = [0.4,0.4,0.0], size = 0, n = 1, array(prob.length) with zero elements', () => {
            const prob = new Float64Array([0.4, 0.0, 0.4]);
            expect(rmultinom(1, 0, prob)).toEqualFloatingPointBinary([0, 0]);
        });
        it('probs=c(0.25,4,9,8), size=100, n = 1', async () => {
            const ans = rmultinom(5, 100, new Float64Array([0.25, 4, 9, 8]));
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rmultinom1.R'), /\s+/, 1);
            expect(ans).toEqualFloatingPointBinary(y);
        });
        it('probs=c(0.25,4,0,8), size=100, n = 1', async () => {
            const ans = rmultinom(5, 100, new Float64Array([0.25, 4, 0, 8]));
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rmultinom2.R'), /\s+/, 1);
            expect(ans).toEqualFloatingPointBinary(y);
        });
    });
});
