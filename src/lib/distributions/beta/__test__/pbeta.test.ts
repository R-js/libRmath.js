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
import { pbeta } from '..';

describe('pbeta, ncp != undefined', function () {
    it('ranges x ∊ [0, 1], shape1=3, shape2=3, ncp=2', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnbeta.R'), /\s+/, 1, 2);
        const actual = x.map(_x => pbeta(_x, 3, 3, 0.5, true));
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('ranges x = NaN, shape1=3, shape2=3, ncp=2', async () => {
        const actual = pbeta(NaN, 3, 3, 0.5, true);
        expect(actual).toBe(NaN);
    });
    it('ranges x = 0.5, shape1=3, shape2=3, ncp=2', async () => {
        const actual = pbeta(0.5, 3, 3, 0.5, true, true);
        expect(actual).toEqualFloatingPointBinary(-0.77187133575811151);
    });
    it('ranges x = 0.5, shape1=3, shape2=3, ncp=2', async () => {
        const actual = pbeta(0.5, 3, 3, 0.5, false, false);
        expect(actual).toEqualFloatingPointBinary(0.53785257439328626);
    });
});