// node
import { resolve } from 'path';

//helper
import { loadData } from '@common/test-helpers/load';

import { dbeta } from '..';

import { createLogHarnas } from '@common/debug-backend';

const { getStats } = createLogHarnas();

describe('dbeta', function () {
    it('ranges x ∊ [0, 1]', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dbeta.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => dbeta(_x, 2, 3));
        expect(actual).toEqualFloatingPointBinary(y, 40);
    });
    it('x=NaN, shape1=2,shape2=3', () => {
        const actual = dbeta(NaN, 2, 3);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('x=0.5, shape1=-2, shape2=3', () => {
        const nan = dbeta(0.5, -2, 3);
        const stats1 = getStats();
        expect(stats1.dbeta).toBe(1);
        expect(nan).toBe(NaN);
    });
    it('x ∊ {-1.5,1.2}, shape1=2, shape2=3', () => {
        const one = dbeta(-0.5, 2, 3);
        expect(one).toBe(1);
        const _one = dbeta(1.5, 2, 3);
        expect(_one).toBe(1);
        const z1 = dbeta(-0.5, 2, 3, undefined, true);
        expect(z1).toBe(0);
    });
    it('x= ∊ {0,1,0.5,}, shape1=0, shape2=0', () => {
        const z = dbeta(0.5, 0, 0);
        expect(z).toBe(0);
        const z0 = dbeta(0.5, 0, 0, undefined, true);
        expect(z0).toBe(-Infinity);
        const z1 = dbeta(0, 0, 0);
        expect(z1).toBe(Infinity);
        const z2 = dbeta(0, 0, 0, undefined, true);
        expect(z2).toBe(Infinity);
    });
    it('x=0.5, shape1=0, shape2=4', () => {
        const z = dbeta(0.5, 0, 4);
        expect(z).toBe(0);
    });
    it('x=0,shape1=0,shape2=4', () => {
        const z = dbeta(0, 0, 4);
        expect(z).toBe(Infinity);
    });
    it('x=0,shape1=3,shape2=Inf', () => {
        const z = dbeta(0, 3, Infinity);
        expect(z).toBe(Infinity);
    });
    it('x=0,shape1=Infinity,shape2=2', () => {
        const z = dbeta(0, Infinity, 2);
        expect(z).toBe(0);
    });
    it('x=1,shape1=Infinity,shape2=2', () => {
        const z = dbeta(1, Infinity, 2);
        expect(z).toBe(Infinity);
    });
    it('x=0.5,shape1=Infinity,shape2=Infinity', () => {
        const z = dbeta(0.5, Infinity, Infinity);
        expect(z).toBe(Infinity);
    });
    it('x=0.25,shape1=Infinity,shape2=Infinity', () => {
        const z = dbeta(0.25, Infinity, Infinity);
        expect(z).toBe(0);
    });
    it('x=0,shape1=0.2,shape2=3', () => {
        const z = dbeta(0, 0.2, 3);
        expect(z).toBe(Infinity);
    });
    it('x=0,shape1=1,shape2=3', () => {
        const z = dbeta(0, 1, 3);
        expect(z).toBe(3);
        const z2 = dbeta(0, 1, 3, undefined, true);
        expect(z2).toEqualFloatingPointBinary(1.0986122886681098, 51);
    });
    it('x=1,shape1=4,shape2=0.2', () => {
        const z = dbeta(1, 4, 0.2);
        expect(z).toBe(Infinity);
    });
    it('x=1,shape1=4,shape2=1', () => {
        const z = dbeta(1, 4, 1);
        expect(z).toBe(4);
        const z2 = dbeta(1, 4, 1, undefined, true);
        expect(z2).toEqualFloatingPointBinary(1.3862943611198906);
    });
    it('x=0.6,shape1=3,shape2=1', () => {
        const z = dbeta(0.6, 3, 1);
        expect(z).toEqualFloatingPointBinary(1.0800000000000001);
    });
    it('x=0.6,shape1=3,shape2=3', () => {
        const z = dbeta(0.6, 3, 3);
        expect(z).toEqualFloatingPointBinary(1.728, 51);
    });
});
