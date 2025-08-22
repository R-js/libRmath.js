import { loadData } from '@common/test-helpers/load';
import { resolve } from 'path';

import { qf } from '..';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('qf', function () {
    it('p ∈ [-0.125, 1.125], df1=3, df2=55', async () => {
        const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'qf.R'), /\s+/, 1, 2);
        const a1 = p.map((_p) => qf(_p, 3, 55));
        expect(a1).toEqualFloatingPointBinary(y1, 26);
    });
    it('p=0.2 df1=Nan, df2=231', () => {
        const nan = qf(0.2, NaN, 231);
        expect(nan).toBeNaN();
    });
    it('p=0.2, df1=-2(<0), df2=4', () => {
        const nan = qf(0.2, -2, 4);
        expect(nan).toBeNaN();
        const stats = getStats();
        expect(stats.qf).toBe(1);
    });
    it('p=0.3, df1=35, df2=4e6', () => {
        const z = qf(0.3, 35, 4e6);
        expect(z).toEqualFloatingPointBinary(0.86223349387851478);
    });
    it('p=0.3, df1=Infinity, df2=Infinity', () => {
        const z = qf(0.3, Infinity, Infinity);
        expect(z).toBe(1);
    });
    it('p=0.3, df1=1e6, df2=234', () => {
        const z = qf(0.3, 1e6, 234);
        expect(z).toEqualFloatingPointBinary(0.95571309656704362);
    });
});
