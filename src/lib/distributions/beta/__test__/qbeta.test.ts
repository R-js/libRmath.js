// node
import { resolve } from 'path';

//helper
import { loadData } from '@common/test-helpers/load';

//app
import { qbeta } from '..';

import { createObjectLogHarnas } from '@common/debug-backend';

const { getStats } = createObjectLogHarnas();

describe('qbeta', function () {
    it('ranges x ∊ [0, 1], shape1=1, shape2=2', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qbeta.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => qbeta(_x, 2, 2, undefined, true, false));
        expect(actual).toEqualFloatingPointBinary(y, 9);
    });
    it('shape1 x ∊ [0, 10], x=0.5, shape2=2', async () => {
        const [shape1, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qbeta2.R'), /\s+/, 1, 2);
        const actual = shape1.map((_shape1) => qbeta(0.5, _shape1, 2, undefined, true, false));
        expect(actual).toEqualFloatingPointBinary(y, 9);
    });
    it('shape1 x ∊ [0, 10], x=0.5, shape2=2, tail=true, logp=true', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qbeta.log.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => qbeta(_x, 2, 2, undefined, true, true));
        expect(actual).toEqualFloatingPointBinary(y, 9);
    });
    it('shape1 x ∊ [0, 10], x=0.5, shape2=2', async () => {
        /* load data from fixture */
        const [shape1, shape2, y] = await loadData(
            resolve(__dirname, 'fixture-generation', 'qbeta3.R'),
            /\s+/,
            1,
            2,
            3
        );
        const actual = shape1.map((s1, i) => qbeta(0.5, s1, shape2[i]));
        expect(actual).toEqualFloatingPointBinary(y, 9);
    });
    it('shape1=NaN, q=0.2, shape2=4, ncp=undefined', () => {
        const nan = qbeta(0.2, NaN, 4);
        expect(nan).toEqualFloatingPointBinary(NaN);
    });
    it('shape1=-1, q=0.2, shape2=4, ncp=undefined', () => {
        const nan = qbeta(0.2, -3, 4);
        expect(nan).toEqualFloatingPointBinary(NaN);
        const stats = getStats();
        expect(stats.qbeta).toBe(1);
    });
    it('shape1=3, q=0.2, shape2=4, ncp=undefined, log.p=TRUE', () => {
        const nan = qbeta(0.2, 3, 4, undefined, false, true);
        expect(nan).toEqualFloatingPointBinary(NaN);
    });
    it('shape1=3, q=-40.2, shape2=4, ncp=undefined, log.p=false', () => {
        const nan = qbeta(-40.2, 3, 4, undefined, false, false);
        expect(nan).toBeNaN();
    });
    it('shape1=0, q=-40.2, shape2=0, ncp=undefined, lower=false, log.p=false', () => {
        const z0 = qbeta(0.2, 0, 0, undefined, false, false);
        expect(z0).toBe(0);
    });
    it('shape1=0, q=0.2, shape2=0, ncp=undefined, lowertail=true, log.p=true', () => {
        const nan = qbeta(0.2, 0, 0, undefined, true, true);
        expect(nan).toBeNaN();
    });
    it('shape1=0, q=0.4, shape2=0, ncp=undefined, lowertail=true, log.p=false', () => {
        const z = qbeta(0.6, 0, 0, undefined, true, false);
        expect(z).toBe(1);
    });
    it('shape1=0, q=0.4, shape2=0, ncp=undefined, lowertail=true, log.p=false', () => {
        const z = qbeta(0.5, 0, 0, undefined, true, false);
        expect(z).toBe(0.5);
    });
    it('shape1=3, q=0.6, shape2=Infinity, ncp=undefined, lowertail=true, log.p=false', () => {
        const z = qbeta(0.6, 3, Infinity, undefined, true, false);
        expect(z).toBe(0);
    });
    it('shape1=Infinity, q=0.6, shape2=8, ncp=undefined, lowertail=true, log.p=false', () => {
        const z = qbeta(0.6, Infinity, 8, undefined, true, false);
        expect(z).toBe(1);
    });
    it('shape1=Infinity, q=0.6, shape2=Infinity, ncp=undefined, lowertail=true, log.p=false', () => {
        const z = qbeta(0.6, Infinity, Infinity, undefined, true, false);
        expect(z).toBe(0.5);
    });
});
