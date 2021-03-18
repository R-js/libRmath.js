// node
import { resolve } from 'path';

//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';

const ml_error: unknown[] = [];
const ml_err_return_nan: unknown[] = [];
///jest.mock('@common/logger');
jest.mock('@common/logger', () => {
    // Require the original module to not be mocked...
    const originalModule = jest.requireActual('@common/logger');
    const { ML_ERROR, ML_ERR_return_NAN } = originalModule;
    function printer(array: unknown[]) {
        return function (...args: unknown[]): void {
            array.push([...args]);
        };
    }
    return {
        __esModule: true, // Use it when dealing with esModules
        ...originalModule,
        ML_ERROR: jest.fn((x: unknown, s: unknown) => ML_ERROR(x, s, printer(ml_error))),
        ML_ERR_return_NAN: jest.fn(() => ML_ERR_return_NAN(printer(ml_err_return_nan)))
    };
});


//app
import { pbeta } from '..';

describe('pbeta, ncp != undefined', function () {
    it('ranges x ∊ [0, 1], shape1=3, shape2=3, ncp=2', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnbeta.R'), /\s+/, 1, 2);
        const actual = x.map(_x => pbeta(_x, 3, 3, 0.5, true));
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('x = NaN, shape1=3, shape2=3, ncp=2', async () => {
        const actual = pbeta(NaN, 3, 3, 0.5, true);
        expect(actual).toBeNaN();
    });
    it('x = 0.5, shape1=3, shape2=3, ncp=0.5, lowerTail=true, log=true', async () => {
        const actual = pbeta(0.5, 3, 3, 0.5, true, true);
        expect(actual).toEqualFloatingPointBinary(-0.77187133575811151);
    });
    it('ranges x = 0.5, shape1=3, shape2=3, ncp=0.5, lowerTail=false, log=false', async () => {
        const actual = pbeta(0.5, 3, 3, 0.5, false, false);
        expect(actual).toEqualFloatingPointBinary(0.53785257439328626);
    });
    it('ranges x = 0.5, shape1=3, shape2=3, ncp=0.5, lowerTail=false, log=true', async () => {
        const actual = pbeta(0.5, 3, 3, 0.5, false, true);
        expect(actual).toEqualFloatingPointBinary(-0.62017078166343242);
    });
    it('ranges x = 1.5, shape1=3, shape2=3, ncp=0.5, lowerTail=true, log=false', async () => {
        const actual = pbeta(1.5, 3, 3, 0.5, true, false);
        expect(actual).toEqualFloatingPointBinary(1);
    });
    it('ranges x = 0.5, shape1=3, shape2=3, ncp=-2, lowerTail=true, log=false', async () => {
        const actual = pbeta(0.5, 3, 3, -2, true, false);
        expect(actual).toBeNaN()
        expect(ml_err_return_nan.length).toBe(1);
        ml_err_return_nan.splice(0);
    });
    it('ranges x = 0, shape1=3, shape2=3, ncp=2, lowerTail=true, log=false', async () => {
        const actual = pbeta(0, 3, 3, 2, true, false);
        expect(actual).toBe(0);
    });
    it('ranges x = 1-1e-16, shape1=4.2, shape2=4.5, ncp=0.1, lowerTail=false, log=false', async () => {
        const actual = pbeta(1 - 1e-16, 4.2, 4.5, 0.1, false, false);
        expect(actual).toEqualFloatingPointBinary(2.0791366512565995e-11, 13);
    });
});