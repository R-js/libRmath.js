import { loadData } from '@common/test-helpers/load';
import { resolve } from 'path';

import { dpois } from '..';
import { dpois_raw } from '../dpois';

import { DBL_MIN, MAX_SAFE_INTEGER, trunc } from '@lib/r-func';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('dpois', function () {
    describe('invalid input and edge cases', () => {
        it('x and lambda are NaN', () => {
            const nan1 = dpois(NaN, 2);
            expect(nan1).toBeNaN();
            const nan2 = dpois(0.1, NaN);
            expect(nan2).toBeNaN();
        });
        it('lamnda < 0', () => {
            const nan1 = dpois(0.5, -1);
            expect(nan1).toBeNaN();
            expect(getStats().dpois).toBe(1);
        });
        it('x is non integer', () => {
            const stats0 = getStats();
            const zero = dpois(0.5, 1);
            expect(zero).toBe(0);
            const stats1 = getStats();
            expect(stats1.dpois - stats0.dpois).toBe(1);
        });
        it('x < 0 or x is Infinite', () => {
            const zero1 = dpois(-2, 1);
            expect(zero1).toBe(0);
            const zero2 = dpois(Infinity, 1);
            expect(zero2).toBe(0);
        });
        it('x = 1 lambda = Infinite', () => {
            const zero1 = dpois(1, Infinity);
            expect(zero1).toBe(0);
        });
    });
    describe('fidelity', () => {
        it('x > 0 lambda = 0', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dpois1.R'), /\s+/, 1, 2);
            const result = x.map((_x) => dpois(_x, 0));
            expect(result).toEqualFloatingPointBinary(y);
        });
        it('x > 0 lambda = 1', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dpois2.R'), /\s+/, 1, 2);
            const result = x.map((_x) => dpois(_x, 1));
            expect(result).toEqualFloatingPointBinary(y, 50);
        });
        it('x > 0 lambda = 2', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dpois3.R'), /\s+/, 1, 2);
            const result = x.map((_x) => dpois(_x, 2));
            expect(result).toEqualFloatingPointBinary(y, 51);
        });
        it('x > 0 lambda = 4', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dpois4.R'), /\s+/, 1, 2);
            const result = x.map((_x) => dpois(_x, 4));
            expect(result).toEqualFloatingPointBinary(y, 51);
        });
        it('x > 0 lambda = 10', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dpois5.R'), /\s+/, 1, 2);
            const result = x.map((_x) => dpois(_x, 10));
            expect(result).toEqualFloatingPointBinary(y, 46);
        });
        it('lambda < MAX_SAFE_INTEGER * DBL_MIN', () => {
            const ans1 = dpois(
                MAX_SAFE_INTEGER, // x
                DBL_MIN * trunc(MAX_SAFE_INTEGER - 1) // lambda
            );
            expect(ans1).toBe(0);
            const ans2 = dpois_raw(
                Infinity, // x
                DBL_MIN * (MAX_SAFE_INTEGER - 1), // lambda
                false
            );
            expect(ans2).toBe(0);
        });
        it.todo('any reasonable value of "lambda < x * DBL_MIN" slaps result to zero investigate');
    });
});
