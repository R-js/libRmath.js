import { loadData } from '@common/load';
import { resolve } from 'path';

import { emptyFloat64Array } from '@lib/r-func';
import { globalUni, RNGkind } from '@rng/global-rng';
import { rgamma } from '..';

describe('rgamma', function () {
    describe('invalid input', () => {
        beforeEach(() => {
            // cl.clear('rgamma');
        });
        it('n=-1(<0)', () => {
            expect(() => rgamma(-1, 1.6)).toThrow();
        });
        it.todo('n=1, scale=NaN  shape=4', () => {
            const nan = rgamma(1, 4, undefined, NaN);
            expect(nan).toEqualFloatingPointBinary(NaN);
            //expect(rgammaDomainWarns()).toHaveLength(1);
        });
    });
    describe('edge cases', () => {
        it('n=0, shape=1.6, defaults', () => {
            const z = rgamma(0, 1.6);
            expect(z).toBe(emptyFloat64Array);
        });
        it('n=1, scale=0, shape=4', () => {
            const z = rgamma(1, 4, undefined, 0);
            expect(z).toEqualFloatingPointBinary(0);
        });
        it('n=1, scale=3, shape=0', () => {
            const z = rgamma(1, 0, 1 / 3);
            expect(z).toEqualFloatingPointBinary(0);
        });
    });
    describe('fidelity, Mersenne-Twister & Inversion', () => {
        beforeEach(() => {
            RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
        });
        it('n=100, shape=1, scale=3', async () => {
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rgamma1.R'), /\s+/, 1);
            globalUni().init(12345);
            const a = rgamma(100, 1, 1 / 3);
            expect(a).toEqualFloatingPointBinary(y);
        });
        it('n=100, shape=0.2 (<1), scale=3', async () => {
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rgamma2.R'), /\s+/, 1);
            globalUni().init(12345);
            const a = rgamma(100, 0.2, 1 / 3);
            expect(a).toEqualFloatingPointBinary(y, 45);
        });
        it('n=100, shape=2.5 (1< shape <3.68), scale=3', async () => {
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rgamma3.R'), /\s+/, 1);
            globalUni().init(12345);
            const z = rgamma(100, 2.5, 1 / 3);
            expect(z).toEqualFloatingPointBinary(y);
        });
        it('n=100, shape=2.5 (3.68 < shape < 13.022), scale=3', async () => {
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rgamma4.R'), /\s+/, 1);
            globalUni().init(12345);
            const z = rgamma(100, 12.5, 1 / 3);
            expect(z).toEqualFloatingPointBinary(y);
        });
        it('n=10, shape=34, ', () => {
            globalUni().init(12345);
            const act = rgamma(10, 34);
            expect(act).toEqualFloatingPointBinary([
                // data from R
                36.97470404775342, 37.732166960881386, 32.870348131808953, 33.633973783507038, 48.249875084583067,
                38.454673772074443, 31.875493264905938, 43.804482844669913, 30.9521890919548, 35.67950510758088
            ]);
        });
    });
});
