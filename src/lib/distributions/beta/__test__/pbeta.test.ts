// node
import { resolve } from 'path';

//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';

///jest.mock('@common/logger');
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
        getDestination(){
            return array;
        }
    };
});

const cl = require('@common/logger');
//app
import { pbeta } from '..';

describe('pbeta, ncp = 0', function () {
    it('ranges x ∊ [0, 1], shape1=3, shape2=3', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pbeta.R'), /\s+/, 1, 2);
        const actual = x.map(_x => pbeta(_x, 3, 3, undefined, true));
        expect(actual).toEqualFloatingPointBinary(y,40);
    });
    it('x=NaN, shape1=3, shape2=3', () => {
        const nan = pbeta(NaN, 3, 3);
        expect(nan).toBeNaN();
    });
    it('x=0.5, shape1=3, shape2=3', () => {
        const dest: unknown[] = [];
        cl.setDestination(dest);
        const nan = pbeta(0.5, -3, 3);
        expect(nan).toBeNaN();
        expect(dest.length).toBe(1);
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
        const actual = x.map(_x => pbeta(_x, 1, 1, undefined, false, true));
        expect(actual).toEqualFloatingPointBinary(y, 43);
    });
});