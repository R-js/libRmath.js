import '$jest-extension';
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';

jest.mock('@common/logger', () => {
    // Require the original module to not be mocked...
    const originalModule = jest.requireActual('@common/logger');
    const { ML_ERROR, ML_ERR_return_NAN } = originalModule;
    let array: unknown[] = [];
    function pr(...args: unknown[]): void {
        array.push([...args]);
    }

    return {
        __esModule: true, // Use it when dealing with esModules
        ...originalModule,
        ML_ERROR: jest.fn((x: unknown, s: unknown) => ML_ERROR(x, s, pr)),
        ML_ERR_return_NAN: jest.fn(() => ML_ERR_return_NAN(pr)),
        setDestination(arr: unknown[] = []) {
            array = arr;
        },
        getDestination() {
            return array;
        }
    };
});

//app
const cl = require('@common/logger');
const out = cl.getDestination();


import { pchisq } from '..';

describe('pncauchy', function () {
    beforeEach(()=>{
        out.splice(0);
    })
    it('ranges x ∊ [0, 40, step 0.5] df=13, ncp=8', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnchisq.R'), /\s+/, 1, 2);
        const actual = x.map(_x => pchisq(_x, 13, 8));
        expect(actual).toEqualFloatingPointBinary(y, 44);
    });
    it('ranges x ∊ [0, 40, step 0.5] df=13, ncp=8, log=true', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnchisq2.R'), /\s+/, 1, 2);
        const actual = x.map(_x => pchisq(_x, 13, 8, true, true));
        expect(actual).toEqualFloatingPointBinary(y, 43);
    });
    it('ranges x ∊ [80, 100] df=13, ncp=8, log=true', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnchisq3.R'), /\s+/, 1, 2);
        const actual = x.map(_x => pchisq(_x, 13, 8, true, true));
        expect(actual).toEqualFloatingPointBinary(y, 20);
    });
    it('x=NaN df=13, ncp=8, log=true', () => {
        const nan = pchisq(NaN, 13, 8, undefined, true);
        expect(nan).toBeNaN();
    });
    it('x=80 df=Infinity, ncp=8, log=true', () => {
        const nan = pchisq(80, Infinity, 8, undefined, true);
        expect(nan).toBeNaN();
        expect(out.length).toBe(1);
    });
    it('x=80 df=-3(<0), ncp=8, log=true', () => {
        const nan = pchisq(80, -3, 8, undefined, true);
        expect(nan).toBeNaN();
        expect(out.length).toBe(1);
    });
    it('ranges x ∊ [80, 100], df=13, ncp=85(>80) log=true', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnchisq4.R'), /\s+/, 1, 2);
        const actual = x.map(_x => pchisq(_x, 13, 85, true, true));
        expect(actual).toEqualFloatingPointBinary(y, 8);
    });
});