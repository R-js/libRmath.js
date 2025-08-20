import { resolve } from 'path';
import { df } from '..';

import { loadData } from '@common/load';
import { createLogHarnas } from '@common/debug-backend';

const { getStats } = createLogHarnas();


describe('df', function () {
    it('x ∈ [-0.125, 3.1250], df1=23, df2=52', async () => {
        const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'df.R'), /\s+/, 1, 2);
        const a1 = p.map((_p) => df(_p, 23, 52));
        expect(a1).toEqualFloatingPointBinary(y1, 46);
    });
    it('x=1, df1=NaN, df2=4', () => {
        const nan = df(1, NaN, 4);
        expect(nan).toBeNaN();
    });
    it('x=1, df1=-1(<0), df2=4', () => {
        const nan = df(1, -2, 4);
        expect(nan).toBeNaN();
        const stats = getStats();
        expect(stats.df).toBe(1);
    });
    it('x=0, df1=3(>2), df2=4', () => {
        const z = df(0, 3, 4);
        expect(z).toBe(0);
    });
    it('x=0, df1=2, df2=4', () => {
        const z = df(0, 2, 4);
        expect(z).toBe(1);
    });
    it('x=0, df1=1, df2=4', () => {
        const z = df(0, 1, 4);
        expect(z).toBe(Infinity);
    });
    it('x=4, df1=inf, df2=inf', () => {
        const z = df(4, Infinity, Infinity);
        expect(z).toBe(0);
    });
    it('x=1, df1=inf, df2=inf', () => {
        const z = df(1, Infinity, Infinity);
        expect(z).toBe(Infinity);
    });
    it('x=1, df1=44, df2=inf', () => {
        const z = df(1, 44, Infinity);
        expect(z).toEqualFloatingPointBinary(1.8641311540557727877);
    });
    it('x=1, df1=1e15, df2=234', () => {
        const z = df(1, 1e15, 234);
        expect(z).toEqualFloatingPointBinary(4.3121481266847112579);
    });
    it('x=1, df1=1e15, df2=234, log=true', () => {
        const z = df(1, 1e15, 234, undefined, true);
        expect(z).toEqualFloatingPointBinary(1.4614361852162813804);
    });
    it('x=1, df1=1, df2=1', () => {
        const z = df(1, 1, 1);
        expect(z).toEqualFloatingPointBinary(0.15915494309189531785);
    });
    it('x=1, df1=1, df2=1, log=true', () => {
        const z = df(1, 1, 1, undefined, true);
        expect(z).toEqualFloatingPointBinary(-1.8378770664093455611);
    });
});
