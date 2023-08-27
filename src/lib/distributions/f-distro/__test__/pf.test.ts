import { loadData } from '@common/load';
import { resolve } from 'node:path';
import { pf } from '..';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('pf', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    it('x ∈ [-0.125, 3.1250], df1=23, df2=52', async () => {
        const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'pf.R'), /\s+/, 1, 2);
        const a1 = p.map((_p) => pf(_p, 23, 52));
        expect(a1).toEqualFloatingPointBinary(y1, 23);
    });
    it('x=1, df1=NaN, df2=4', () => {
        const nan = pf(1, NaN, 4);
        expect(nan).toBeNaN();
    });
    it('x=1, df1=-1(<0), df2=4', () => {
        const nan = pf(1, -2, 4);
        expect(nan).toBeNaN();
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'pf',
                formatter: "argument out of domain in '%s'",
                args: ['pf']
            }
        ]);
    });
    it('x=2, df1=23, df2=Infinity', () => {
        const z = pf(2, 23, Infinity);
        expect(z).toEqualFloatingPointBinary(0.99700884518723809);
    });
    it('x=2, df1=Infinity, df2=Infinity', () => {
        const z = pf(2, Infinity, Infinity);
        expect(z).toBe(1);
    });
    it('x=0, df1=Infinity, df2=Infinity', () => {
        const z = pf(0.5, Infinity, Infinity);
        expect(z).toBe(0);
    });
    it('x=1, df1=Infinity, df2=Infinity', () => {
        const z = pf(1, Infinity, Infinity);
        expect(z).toBe(0.5);
    });
    it('x=1, df1=Infinity, df2=Infinity', () => {
        const z = pf(1, Infinity, Infinity, undefined, false, true);
        expect(z).toBe(-Math.LN2);
    });
    it('x=1, df1=Infinity, df2=8', () => {
        const z = pf(1, Infinity, 9, undefined, false, true);
        expect(z).toEqualFloatingPointBinary(-0.5749627835289125, 50);
    });
});
