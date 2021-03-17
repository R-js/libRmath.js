// node
import { resolve } from 'path';

//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';

jest.mock('@common/logger');

import { ML_ERR_return_NAN } from '@common/logger';
const ML_ERR_return_NANMocked = <jest.Mock<number, [debug.Debugger]>>(ML_ERR_return_NAN);
ML_ERR_return_NANMocked;
//const ML_ERRORMocked = <jest.Mock<typeof ML_ERROR>>(ML_ERROR as unknown);
//app
import { dbeta } from '..';

describe('dbeta, ncp != undefined', function () {
    it('ranges x ∊ [0, 1], shape1=3, shape2=3, ncp=2', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dnbeta.R'), /\s+/, 1, 2);
        const actual = x.map(_x => dbeta(_x, 3, 3, 2));
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('ranges x = NaN, shape1=3, shape2=3, ncp=2', async () => {
        const nan = dbeta(NaN, 3, 3, 2);
        expect(nan).toBe(NaN);
    });
    it('ranges x = 0.5, shape1=3, shape2=3, ncp=-2', async () => {
        ML_ERR_return_NANMocked.mockReset();
        ML_ERR_return_NANMocked.mockReturnValue(NaN);
        const nan = dbeta(0.5, 3, 3, -2);
        expect(ML_ERR_return_NANMocked).toHaveBeenCalledTimes(1);
        expect(nan).toBe(NaN);
    });
    it('ranges x = 0.5, shape1=3, shape2=3, ncp=-2', async () => {
        ML_ERR_return_NANMocked.mockReset();
        ML_ERR_return_NANMocked.mockReturnValue(NaN);
        const nan = dbeta(0.5, 3, 3, Infinity);
        expect(ML_ERR_return_NANMocked).toHaveBeenCalledTimes(1);
        expect(nan).toBe(NaN);
    });
    it('ranges x = -1, shape1=3, shape2=3, ncp=2', async () => {
        const z = dbeta(-1, 3, 3, 2);
        expect(z).toBe(0);
    });
    it('ranges x = -1, shape1=3, shape2=3, ncp=2, log=true', async () => {
        const z = dbeta(-1, 3, 3, 2, true);
        expect(z).toBe(-Infinity);
    });
    it('ranges x = 0.5, shape1=3, shape2=3, ncp=0.02', async () => {
        const z = dbeta(0, 1, 0.01, 4);
        expect(z).toEqualFloatingPointBinary(0.0013533528323661276);
    });
});