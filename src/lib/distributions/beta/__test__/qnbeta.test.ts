// node
import { resolve } from 'path';

//helper
import { loadData } from '@common/test-helpers/load';

//app
import { qbeta } from '..';

import { createLogHarnas } from '@common/debug-backend';

const { getStats } = createLogHarnas();

describe('qbeta, ncp != undefined', function () {
    it('ranges x ∊ [0, 1], shape1=1, shape2=2, ncp=3', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qnbeta.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => qbeta(_x, 1, 2, 3));
        expect(actual).toEqualFloatingPointBinary(y, 6);
    });
    it('x = 0.5, shape1=NaN, shape2=2, ncp=3', () => {
        const nan = qbeta(0.5, NaN, 2, 3);
        expect(nan).toBe(NaN);
    });
    it('x=0.5, shape1=Infinite,shape2=3, ncp=3', () => {
        const nan = qbeta(0.5, Infinity, 2, 3);
        expect(nan).toBeNaN();
        const stats = getStats();
        expect(stats.qnbeta).toBe(1);
    });
    it('x=0.5, shape1=-2,shape2=3, ncp=3', () => {
        const stats0 = getStats();
        const qnBetaCount0 = stats0.qnbeta;
        const nan = qbeta(0.5, -2, 2, 3);
        expect(nan).toBeNaN();
        const stats1 = getStats();
        const qnBetaCount1 = stats1.qnbeta;
        expect(qnBetaCount1 - qnBetaCount0).toBe(1);
    });
    it('x=1-EPSILON/2, shape1=-2, shape2=2, ncp=4', () => {
        const z = qbeta(1 - Number.EPSILON / 2, 2, 2, 4, true);
        expect(z).toBe(1);
    });
});
