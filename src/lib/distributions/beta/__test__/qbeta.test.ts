// node
import { resolve } from 'path';

//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';

jest.mock('@common/logger', () => {
    // Require the original module to not be mocked...
    const originalModule = jest.requireActual('@common/logger');
    const { ML_ERROR, ML_ERR_return_NAN } = originalModule;
    let array: unknown[];
    function pr(...args: unknown[]): void {
        array.push([...args]);
    }

    return {
        __esModule: true, // Use it when dealing with esModules
        ...originalModule,
        ML_ERROR: jest.fn((x: unknown, s: unknown) => ML_ERROR(x, s, pr)),
        ML_ERR_return_NAN: jest.fn(() => ML_ERR_return_NAN(pr)),
        setDestination(arr: unknown[]) {
            array = arr;
        },
        getDestination() {
            return array;
        }
    };
});

const cl = require('@common/logger');
//app
import { qbeta } from '..';

describe('qbeta', function () {
    it('ranges x ∊ [0, 1], shape1=1, shape2=2', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qbeta.R'), /\s+/, 1, 2);
        const actual = x.map(_x => qbeta(_x, 2, 2, undefined, true, false));
        expect(actual).toEqualFloatingPointBinary(y, 9);
    });
    it('shape1 x ∊ [0, 10], x=0.5, shape2=2', async () => {
        const dest: unknown[] = [];
        cl.setDestination(dest);
        /* load data from fixture */
        const [shape1, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qbeta2.R'), /\s+/, 1, 2);
        const actual = shape1.map(_shape1 => qbeta(0.5, _shape1, 2, undefined, true, false));
        expect(actual).toEqualFloatingPointBinary(y, 9);
    });
    it('shape1 x ∊ [0, 10], x=0.5, shape2=2, tail=true, logp=true', async () => {
        const dest: unknown[] = [];
        cl.setDestination(dest);
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qbeta.log.R'), /\s+/, 1, 2);
        const actual = x.map(_x => qbeta(_x, 2, 2, undefined, true, true));
        expect(actual).toEqualFloatingPointBinary(y, 9);
    });
    it('shape1 x ∊ [0, 10], x=0.5, shape2=2', async () => {
        const dest: unknown[] = [];
        cl.setDestination(dest);
        /* load data from fixture */
        const [shape1, shape2, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qbeta3.R'), /\s+/, 1, 2, 3);
        const actual = shape1.map((s1, i) => qbeta(0.5, s1, shape2[i]));
        expect(actual).toEqualFloatingPointBinary(y, 9);
    });
    it('shape1=NaN, q=0.2, shape2=4, ncp=undefined', () => {
        const nan = qbeta(0.2, NaN, 4);
        expect(nan).toEqualFloatingPointBinary(NaN);
    });
    it('shape1=-1, q=0.2, shape2=4, ncp=undefined', () => {
        const dest: unknown[] = [];
        cl.setDestination(dest);
        const nan = qbeta(0.2, -3, 4);
        expect(nan).toEqualFloatingPointBinary(NaN);
        expect(dest.length).toBe(1);
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
    })
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