import { loadData } from '@common/test-helpers/load';
import { resolve } from 'path';
import { dnorm } from '..';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('dnorm', function () {
    describe('invalid input check and edge cases', () => {
        it('x = NaN or mu = Nan, or sigma = NaN', () => {
            const nan1 = dnorm(NaN);
            expect(nan1).toBeNaN();
            const nan2 = dnorm(0, NaN);
            expect(nan2).toBeNaN();
            const nan3 = dnorm(0, 1, NaN);
            expect(nan3).toBeNaN();
        });
        it('dnorm is zero for all x if variance is infinite', () => {
            expect(dnorm(0, 0, Infinity)).toBe(0);
            expect(dnorm(0, 0, Infinity, true)).toBe(-Infinity);
        });
        it('x = ± Infinity and equal to µ (= ± Infinity) gives NaN', () => {
            expect(dnorm(Infinity, Infinity, 1)).toBeNaN();
            expect(dnorm(-Infinity, -Infinity, 1)).toBeNaN();
        });
        it('x = ± Infinity, when µ is 1. Finite or is 2. Infinite (with opposite sign of x)', () => {
            expect(dnorm(Infinity, 0, 1)).toBe(0);
            expect(dnorm(Infinity, 0, 1, true)).toBe(-Infinity);

            expect(dnorm(-Infinity, Infinity)).toBe(0);
            expect(dnorm(-Infinity, Infinity, 1, true)).toBe(-Infinity);

            expect(dnorm(-Infinity, Infinity)).toBe(0);
            expect(dnorm(-Infinity, Infinity, 1, true)).toBe(-Infinity);
        });
        it('sd < 0', () => {
            expect(dnorm(0, 0, -1)).toBe(NaN);
            const stats = getStats();
            expect(stats.dnorm).toBe(1);
        });
        it('sd == 0, (a dirac delta function)', () => {
            expect(dnorm(0, 0, 0)).toBe(Infinity);
            expect(dnorm(1, 0, 0)).toBe(0);
            expect(dnorm(1, 0, 0, true)).toBe(-Infinity);
        });
        it('z (z-norm) > 2 * sqrt(DBL_MAX)', () => {
            const x = 2 * Math.sqrt(Number.MAX_VALUE);
            expect(dnorm(x, 0, 1)).toBe(0);
            expect(dnorm(x, 0, 1, true)).toBe(-Infinity);
        });
        it('abs(z) >= 38.6 (special cutoff), gives zero', () => {
            expect(dnorm(38.9)).toBe(0);
        })
    });
    describe('fidelity', () => {
        it('log = true for dnorm(x, µ, σ)', () => {
            const σ = 2;
            const µ = 1.5;
            const zvals = [-1.5, -1, 0, 1, 1.5].map(x => (x - µ) / σ);

            const results = zvals.map(z => dnorm(z, 0, 1, true));
            expect(results).toEqualFloatingPointBinary([
                -2.04393853320467267,
                -1.70018853320467267,
                -1.20018853320467267,
                -0.95018853320467278,
                -0.91893853320467278,
            ]);
            expect(dnorm(38.5, 0, 1, true)).toEqualFloatingPointBinary(-742.04393853320471);
        });
        it('abs(z) < 5 dnorm(x, µ, σ)', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dnorm.R'), /\s+/, 1, 2);
            const result = x.map(d => dnorm(d));
            expect(result).toEqualFloatingPointBinary(y, 51);
        });

        it('abs(z) >= 5  && <= 38.0 dnorm(x, µ, σ)', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dnorm2.R'), /\s+/, 1, 2);
            const result = x.map(d => dnorm(d));
            expect(result).toEqualFloatingPointBinary(y, 51);
        });
    });
});
