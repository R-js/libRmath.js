import { loadData } from '@common/test-helpers/load';
import { resolve } from 'path';
import { df } from '..';

import { createLogHarnas } from '@common/debug-backend';

const { getStats } = createLogHarnas();

describe('dnf (df with ncp is finite)', function () {

    it('x ∈ [-0.125, 3.1250], df1=23, df2=52, ncp=98', async () => {
        const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'dnf.R'), /\s+/, 1, 2);
        const a1 = p.map((_p) => df(_p, 23, 52, 98));
        expect(a1).toEqualFloatingPointBinary(y1, 43);
    });
    it('x=1, df1=NaN, df2=4, ncp=98', () => {
        const nan = df(1, NaN, 4, 98);
        expect(nan).toBeNaN();
    });
    it('x=1, df1=-1(<=0), df2=4, ncp=98', () => {
        const nan = df(1, -1, 4, 98);
        expect(nan).toBeNaN();
        const stats = getStats();
        expect(stats.dnf).toBe(1);
    });
    it('x=1, df1=2, df2=4, ncp=Inf', () => {
        const z = df(1, 2, 4, Infinity);
        expect(z).toBeNaN();
        const stats = getStats();
        expect(stats.dnf).toBe(2);
    });
    it('x=4, df1=inf, df2=inf, ncp=98', () => {
        const z = df(4, Infinity, Infinity, 98);
        expect(z).toBe(0);
    });
    it('x=1, df1=inf, df2=inf, ncp=98', () => {
        const z = df(1, Infinity, Infinity, 98);
        expect(z).toBe(Infinity);
    });
    it('x=1, df1=44, df2=inf, ncp=98', () => {
        const z = df(1, 44, Infinity, 98);
        expect(z).toEqualFloatingPointBinary(4.0763819395105776401e-8);
    });
    it('x=1, df1=1e15, df2=234, ncp=98', () => {
        const z = df(1, 1e15, 234, 98);
        expect(z).toEqualFloatingPointBinary(4.3121481266847112579);
    });
    it('x=1, df1=1e15, df2=23, ncp=98 log=true', () => {
        const z = df(1, 1e15, 23, 98, true);
        expect(z).toEqualFloatingPointBinary(0.2949904301786088201);
    });
    it('x=5, df1=3, df2=5, ncp=24, log=true', () => {
        const z = df(5, 3, 5, 24, true);
        expect(z).toEqualFloatingPointBinary(-2.6178541411440345854);
    });
    it('x=1, df1=1, df2=1, log=true', () => {
        const z = df(1, 1, 1, undefined, true);
        expect(z).toEqualFloatingPointBinary(-1.8378770664093455611);
    });
});
