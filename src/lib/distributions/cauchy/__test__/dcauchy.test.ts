//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';

import { dcauchy } from '..';


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

describe('dcauchy', function () {

    beforeEach(() => {
        out.splice(0);//clear out
    })
    it('ranges x ∊ [-40, 40, step 1] location=2, scale=3, log=true', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dcauchy.R'), /\s+/, 1, 2);
        const actual = x.map(_x => dcauchy(_x, 2, 3, true));
        expect(actual).toEqualFloatingPointBinary(y,51);
    });
    it('ranges x ∊ [-40, 40, step 1] location=2, scale=3, log=false', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dcauchy2.R'), /\s+/, 1, 2);
        const actual = x.map(_x => dcauchy(_x, 2, 3, false));
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('x=NaN, location=0,scale=10',()=>{
        const nan= dcauchy(NaN, 0,10);
        expect(nan).toBeNaN();
    });
    it('x=2, location=0,scale=-10 (<0)',()=>{
        const nan= dcauchy(2, 0,-10);
        expect(nan).toBeNaN();
        expect(out.length).toBe(1);
    });
    it('x=2, + defaults',()=>{
        const z= dcauchy(2);
        expect(z).toEqualFloatingPointBinary(0.063661977236758135);
    });
});