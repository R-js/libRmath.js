//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';

import { pcauchy } from '..';


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

describe('pcauchy', function () {

    beforeEach(() => {
        out.splice(0);//clear out
    })
    it('ranges x ∊ [-40, 40, step 1] location=2, scale=3, log=false', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pcauchy1.R'), /\s+/, 1, 2);
        const actual = x.map(_x => pcauchy(_x, 2, 3));
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('x=NaN',()=>{
        const nan = pcauchy(NaN);
        expect(nan).toBeNaN();
    });
    it('x=0.2, scale=-2(<0), location=0',()=>{
        const nan = pcauchy(0.2,0,-2);
        expect(nan).toBeNaN();
        expect(out.length).toBe(1);
    });
    it('x=0, scale=Infinity, location=Infinity',()=>{
        const nan = pcauchy(0,Infinity,Infinity);
        expect(nan).toBeNaN();
        expect(out.length).toBe(1);
    });
    it('x=Infinity, rest=default',()=>{
        const z = pcauchy(Infinity);
        expect(z).toBe(1);
    });
    it('x=-Infinity, rest=default',()=>{
        const z = pcauchy(-Infinity);
        expect(z).toBe(0);
    });
    it('x=20, lowerTail=false',()=>{
        const z = pcauchy(20,undefined,undefined,false);
        expect(z).toEqualFloatingPointBinary(0.015902251256176378);
    });
});