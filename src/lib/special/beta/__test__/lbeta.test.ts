//helpers
import '$jest-extension';

jest.mock('@common/logger');

import { ML_ERR_return_NAN  } from '@common/logger';

//app
import { lbeta } from '..';

describe('lbeta(a,b)', function () {
    it('a = 0, b > 0', async () => {
        /* load data from fixture */
        const a = 0;
        const b = 0.5;
        const actual = lbeta(new Float32Array([a, b]));
        expect(actual).toEqualFloatingPointBinary(Infinity);
    });
    it('a=[], b = undefined', () => {
        const empty = lbeta([]);
        expect(empty).toEqualFloatingPointBinary([]);
    });
    it('a=undefined, b = undefined', () => {
        const fn = () => lbeta(undefined as any);
        expect(fn).toThrow('lbeta(a,b): argument "a" be an array of number[], Float32Array, Float64Array');
    });
    it('a=[1,3], b=[1,2,3] should throw', () => {
        const a = [1, 3];
        const b = {};
        const fn = () => lbeta(a, b as any);
        expect(fn).toThrow(
            'lbeta(a,b): argument "b" (if defined) must be an array of number[], Float32Array, Float64Array',
        );
    });
    it('a=[1,3,4] (uneven), b=undefined should throw', () => {
        const a = [1, 3, 4];
        const fn = () => lbeta(a);
        expect(fn).toThrow(
            'lbeta(a,b): ("b"=onevent elements of a), error cannot interleave data from a because array length of a(3) is not multiple of 2',
        );
    });
    it('a=[1,3], b[4,2] (uneven), b=undefined should throw', () => {
        const a = [1, 3];
        const b = [4, 2];
        const rc = lbeta(a, b);
        expect(rc).toEqualFloatingPointBinary([-1.386294361, -2.484906650]);
    });
    it('a=[NaN, NaN] should return NaN', () => {
        const rc = lbeta([NaN, NaN]);
        expect(rc).toEqualFloatingPointBinary(NaN);
    });
    it('a < 0, b > 0 should return NaN', () => {
        (ML_ERR_return_NAN as any).mockReset();
        const rc = lbeta([-1,0.5]);
        expect(ML_ERR_return_NAN).toHaveBeenCalledTimes(1);
        expect((ML_ERR_return_NAN as any).mock.calls[0][0]).toBeInstanceOf(Function);
        expect(rc).toEqualFloatingPointBinary(NaN);
    });
    it('a > 0, b = +Inf should -Infinity', () => {
        const rc = lbeta([1,Infinity]);
        expect(rc).toEqualFloatingPointBinary(-Infinity);
    });
    it('a >= 5, b = 20', () => {
        const rc = lbeta([5,20]);
        expect(rc).toEqualFloatingPointBinary(-12.26679138);
    });
    it('a = 1E-307, b = 5', () => {
        const rc = lbeta([1e-307,5]);
        expect(rc).toEqualFloatingPointBinary(706.8936235);
    });

    /*it('a=[1], b[2] to be 0.5', () => {
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
    });*/
});
