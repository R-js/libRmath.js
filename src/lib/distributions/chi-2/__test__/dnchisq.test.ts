//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';




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
cl.setDestination();
const out = cl.getDestination();

import { dchisq } from '..';


describe('dncauchy', function () {
    beforeEach(() => {
        out.splice(0);//clear out
    })
    it('ranges x ∊ [0, 40, step 0.5] df=13, ncp=8', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dnchisq.R'), /\s+/, 1, 2);
        const actual = x.map(_x => dchisq(_x, 13, 8));
        expect(actual).toEqualFloatingPointBinary(y, 27);
    });
    it('ranges x ∊ [0, 40, step 0.5] df=13, ncp=8, log=true', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dnchisq2.R'), /\s+/, 1, 2);
        const actual = x.map(_x => dchisq(_x, 13, 8, true));
        expect(actual).toEqualFloatingPointBinary(y, 47);
    });
    it('x=20, df=NaN ncp=8', () => {
        const nan = dchisq(20, NaN, 8);
        expect(nan).toBeNaN();
    });
    it('x=20, df=-4 ncp=8', () => {
        const nan = dchisq(20, -4, 8);
        expect(nan).toBeNaN();
        expect(out.length).toBe(1);
    });
    it('x=-2(<0), df=4 ncp=8', () => {
        const z = dchisq(-2, 4, 8);
        expect(z).toBe(0)
    });
    it('x=0, df=1(<2) ncp=8', () => {
        const z = dchisq(0, 1, 8);
        expect(z).toBe(Infinity);
    });

    it('x=0.2, df=0 ncp=0', () => {
        const z = dchisq(0.2, 0, 0);
        expect(z).toBe(0);
    });
    it('x=0.2, df=2 ncp=0', () => {
        const z = dchisq(0.2, 2, 0);
        expect(z).toEqualFloatingPointBinary(0.45241870901797976);
    });
    it('x=Infinity, df=2 ncp=5', () => {
        const z = dchisq(Infinity, 2, 5);
        expect(z).toBe(0);
    });
    it('x=Infinity, df=2 ncp=5', () => {
        const z = dchisq(19, 2, 1E20);
        expect(z).toBe(0);
    });
});
