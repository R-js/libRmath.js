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

describe('pbeta, ncp = 0', function () {
    it('ranges x ∊ [0, 1], shape1=3, shape2=3', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pbeta.R'), /\s+/, 1, 2);
        const actual = x.map(_x => pbeta(_x, 3, 3, undefined, true));
        expect(actual).toEqualFloatingPointBinary(y);
    });
  
});