import { resolve } from 'path';
import { pchisq } from '..';

import { loadData } from '@common/test-helpers/load';
import { createLogHarnas } from '@common/debug-backend';

const { getStats } = createLogHarnas();

describe('pnchisq', function () {
    it('ranges x ∊ [0, 40, step 0.5] df=13, ncp=8', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnchisq.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => pchisq(_x, 13, 8));
        expect(actual).toEqualFloatingPointBinary(y, 44);
    });
    it('ranges x ∊ [0, 40, step 0.5] df=13, ncp=8, log=true', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnchisq2.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => pchisq(_x, 13, 8, true, true));
        expect(actual).toEqualFloatingPointBinary(y, 43);
    });
    it('ranges x ∊ [80, 100] df=13, ncp=8, log=true', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnchisq3.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => pchisq(_x, 13, 8, true, true));
        expect(actual).toEqualFloatingPointBinary(y, 20);
    });
    it('x=NaN df=13, ncp=8, log=true', () => {
        const nan = pchisq(NaN, 13, 8, undefined, true);
        expect(nan).toBeNaN();
    });
    it('x=80 df=Infinity, ncp=8, log=true', () => {
        const stats0 = getStats();
        const nan = pchisq(80, Infinity, 8, undefined, true);
        const stats1 = getStats();
        expect(nan).toBeNaN();
        expect(stats1.pnchisq - stats0.pnchisq).toBe(1);
    });
    it('x=80 df=-3(<0), ncp=8, log=true', () => {
        const stats0 = getStats();
        const nan = pchisq(80, -3, 8, undefined, true);
        const stats1 = getStats();
        expect(nan).toBeNaN();
        expect(stats1.pnchisq - stats0.pnchisq).toBe(1);
    });
    it('ranges x ∊ [80, 100], df=13, ncp=85(>80) log=true', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnchisq4.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => pchisq(_x, 13, 85, true, true));
        expect(actual).toEqualFloatingPointBinary(y, 8);
    });
    it('(precison warning): x = 490, df=13, ncp=85, lower=false, log=false', () => {
        const stats0 = getStats();
        const actual = pchisq(490, 13, 85, false, false);
        const stats1 = getStats();
        expect(actual).toBeLessThan(1e-10);
        expect(stats1.pnchisq - stats0.pnchisq).toBe(4373 - 3862);
    });
    it('(precison warning): x = 490, df=13, ncp=85, lower=false, log=true', () => {
        const actual = pchisq(490, 13, 85, false, true);
        const expected = -31.643050368870338;
        expect(Math.abs(actual - expected)).toBeLessThan(0.02);
        // expect(pnchisqPrecisionWarns()).toHaveLength(1);
    });
    it('x = 200, df=13, ncp=85, lower=false, log=true', () => {
        const actual = pchisq(200, 13, 85, false, true);
        const expected = -12.131050756693373;
        expect(actual).toEqualFloatingPointBinary(expected, 34);
        // expect(pnchisqDomainWarns()).toHaveLength(0);
    });
    it('x = 0, df=0, ncp=85, lower=false, log=false', () => {
        const actual = pchisq(0, 0, 85, false, false);
        expect(actual).toBe(1);
    });
    it('x = 0, df=0, ncp=85, lower=false, log=true', () => {
        const actual = pchisq(0, 0, 85, false, true);
        expect(actual).toEqualFloatingPointBinary(-3.4872615319944465e-19);
    });
    it('x = Inf, df=0, ncp=85, lower=false, log=true|false', () => {
        const z = pchisq(Infinity, 0, 85, false, true);
        expect(z).toBe(-Infinity);
        const z1 = pchisq(Infinity, 0, 85, false, false);
        expect(z1).toBe(0);
    });
    it('x = 45, df=1000, ncp=75, lower=false, log=false|true', () => {
        const z = pchisq(45, 1000, 75, true, false);
        expect(z).toBe(0);
        const z1 = pchisq(45, 1000, 75, true, true);
        expect(z1).toEqualFloatingPointBinary(-1112.8456957296012);
    });
    it('x = 45, df=1000, ncp=2000, lower=false, log=false|true', () => {
        const z = pchisq(45, 1000, 2000, true, false);
        expect(z).toBe(0);
        const z1 = pchisq(45, 1000, 2000, true, true);
        expect(z1).toBe(-Infinity);
    });
});
