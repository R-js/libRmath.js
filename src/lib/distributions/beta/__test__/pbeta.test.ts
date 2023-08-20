// node
import { resolve } from 'path';

//helper
import { loadData } from '@common/load';

//app
import { pbeta } from '..';
import { register, unRegister } from '@mangos/debug-frontend';

//mocks
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('pbeta, ncp = 0', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        register(createBackEndMock(logs));
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    it('ranges x ∊ [0, 1], shape1=3, shape2=3', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pbeta.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => pbeta(_x, 3, 3, undefined, true));
        expect(actual).toEqualFloatingPointBinary(y, 40);
    });
    it('x=NaN, shape1=3, shape2=3', () => {
        const nan = pbeta(NaN, 3, 3);
        expect(nan).toBeNaN();
    });
    it('x=0.5, shape1=3, shape2=3', () => {
        const nan = pbeta(0.5, -3, 3);
        expect(nan).toBeNaN();
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'pbeta',
                formatter: 'pbeta(q=%d, a=%d, b=%d, l.t=%s, ln=%s)',
                args: [0.5, -3, 3, true, false]
            },
            {
                prefix: '',
                namespace: 'pbeta',
                formatter: "argument out of domain in '%s'",
                args: ['pbeta']
            }
        ]);
    });
    it('x=0.5, shape1=Infinity, shape2=3', () => {
        const z = pbeta(0.5, Infinity, 3);
        expect(z).toBe(0);
    });
    it('x=0.5, shape1=Infinity, shape2=Infinity', () => {
        const z = pbeta(0.5, Infinity, Infinity);
        expect(z).toBe(1);
    });
    it('x=0.4, shape1=Infinity, shape2=Infinity', () => {
        const z = pbeta(0.4, Infinity, Infinity);
        expect(z).toBe(0);
    });
    it('x=0.4, shape1=2, shape2=Infinity', () => {
        const z = pbeta(0.4, 2, Infinity);
        expect(z).toBe(1);
    });
    it('x=0.4, shape1=0, shape2=0', () => {
        const z = pbeta(0.4, 0, 0);
        expect(z).toBe(0.5);
    });
    it('x=0.4, shape1=0, shape2=0, log=true', () => {
        const z = pbeta(0.4, 0, 0, undefined, true, true);
        expect(z).toEqualFloatingPointBinary(-Math.LN2);
    });
    it('ranges x ∊ [0, 1], shape1=1, shape2=1, lowerTail=false, asLog=true', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pbeta2.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => pbeta(_x, 1, 1, undefined, false, true));
        expect(actual).toEqualFloatingPointBinary(y, 43);
    });
});
