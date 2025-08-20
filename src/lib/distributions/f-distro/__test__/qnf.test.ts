import { loadData } from '@common/load';

import { resolve } from 'path';
import { qf } from '..';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('qf ncp is defined', function () {
    it('p ∈ [-0.125, 1.125], df1=3, df2=5, ncp=25', async () => {
        const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'qnf.R'), /\s+/, 1, 2);
        const a1 = p.map((_p) => qf(_p, 3, 5, 25));
        expect(a1).toEqualFloatingPointBinary(y1, 23);
    });
    it('p=0.2 df1=Nan, df2=231, ncp=25', () => {
        const nan = qf(0.2, NaN, 231, 25);
        expect(nan).toBeNaN();
    });
    it('p=0.2, df1=-2(<0), df2=4, ncp=25', () => {
        const nan = qf(0.2, -2, 4, 25);
        expect(nan).toBeNaN();
        const stats = getStats();
        expect(stats.qnf).toBe(1);
    });
    it('p=0.2, df1=Inf, df2=Inf, ncp=25', () => {
        const stats0 = getStats();
        const nan = qf(0.2, Infinity, Infinity, 25);
        const stats1 = getStats();
        expect(nan).toBeNaN();
        expect(stats1.qnf - stats0.qnf).toBe(1);
    });
    it('p=0.2, df1=2.4e8, df2=2E8, ncp=2e9', () => {
        const z = qf(0.2, 2.4, 2e8, 290);
        expect(z).toEqualFloatingPointBinary(109.75391976731237);
    });
});
