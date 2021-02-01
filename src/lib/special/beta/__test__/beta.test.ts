//helpers
import '$jest-extension';

jest.mock('@common/logger');

import { ML_ERR_return_NAN, ML_ERROR } from '@common/logger';

//app
import { beta } from '..';

describe('beta(a,b)', function () {
    it('a = 0, b > 0', async () => {
        /* load data from fixture */
        const a = 0;
        const b = 0.5;
        const actual = beta(new Float32Array([a, b]));
        expect(actual).toEqualFloatingPointBinary(Infinity);
    });
    it('a=[], b = undefined', () => {
        const empty = beta([]);
        expect(empty).toEqualFloatingPointBinary([]);
    });
    it('a=[], b[1,2] should throw', () => {
        expect(() => beta([], [1, 2])).toThrow(
            'lbeta(a,b): arguments "a" and "b" must be of equal vector length (#a=0, b=#2) of number[], Float32Array, Float64Array',
        );
    });
    it('a=[1], b[2] to be 0.5', () => {
        expect(beta([1], [2])).toEqualFloatingPointBinary(0.5);
    });

    it('a=Nan, b = Nan', () => {
        const nan = beta([NaN, NaN]);
        expect(nan).toEqualFloatingPointBinary(NaN);
    });
    it('a=Nan, b = Nan', () => {
        const nan = beta([NaN, NaN]);
        expect(nan).toEqualFloatingPointBinary(NaN);
    });
    it('a<0 or b >=0 returns NaN', () => {
        const nan = beta([-1, 0]);
        expect(ML_ERR_return_NAN).toHaveBeenCalledTimes(1);
        expect((ML_ERR_return_NAN as any).mock.calls[0][0]).toBeInstanceOf(Function);
        (ML_ERR_return_NAN as any).mockReset();
        expect(nan).toEqualFloatingPointBinary(NaN);
    });
    it('a=Infinity returns 0', () => {
        const inf = beta([Infinity, 1]);
        expect(inf).toEqualFloatingPointBinary(0);
    });
    it('a>0 and b=Infinity 0', () => {
        const inf = beta([1, Infinity]);
        expect(inf).toEqualFloatingPointBinary(0);
    });
    it('domain: (a + b) < 171.61447887182298', () => {
        const ans = beta([4, 5]);
        expect(ans).toEqualFloatingPointBinary(0.003571429, 21, false, true);
    });
    it('domain: (a + b) > 171.61447887182298', () => {
        const ans = beta([87, 87]);
        expect(ans).toEqualFloatingPointBinary(1.589462e-53, 18, false, true);
    });
    it('domain: (a + b) >>>> 171.61447887182298', () => {
        const ans = beta([520, 520]);
        expect(ML_ERROR).toHaveBeenCalledTimes(1);
        const args = (ML_ERROR as any).mock.calls[0].map((v: any) => (typeof v === 'function' ? Function : v));
        expect(args).toEqual([16, 'beta', Function]);
        (ML_ERROR as any).mockReset();
        expect(ans).toEqualFloatingPointBinary(1.319812e-314, 18, false, true);
    });
});
