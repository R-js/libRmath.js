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
    /*it('force number argument', () => {
        const neg1 = gamma(-1.2 as any);
        expect(neg1).toEqualFloatingPointBinary(4.8509571405220981433);
    });
    it('force empty array', () => {
        const neg1 = gamma([]);
        const neg2 = gamma(new Float32Array(0));
        expect(neg1).toEqualFloatingPointBinary([]);
        expect(neg2).toEqualFloatingPointBinary([]);
    });
    it('process float32Array', () => {
        const neg1 = gamma(new Float32Array([-4.1, -5.1]));
        expect(neg1 instanceof Float32Array).toBe(true);
        expect(neg1).toEqualFloatingPointBinary([-0.363973113892433530747, 0.071367277233810505477], 18);
    });
    it('invalid argument should throw', () => {
        expect(() => {
            gamma('hello' as any);
        }).toThrow('gammafn: argument not of number, number[], Float64Array, Float32Array');
    });
    it('1E-308 should become Infinity', () => {
        expect(gamma([1e-308])).toEqualFloatingPointBinary(Infinity);
    });
    it('-1E-308 should become -1.000000000000000011e+308', () => {
        expect(gamma([-1e-308])).toEqualFloatingPointBinary(-1e308);
    });
    it('5e-309  should become -Infinity', () => {
        expect(gamma([-5e-309])).toEqualFloatingPointBinary(-Infinity);
    });
    it('-1+1E-16  should become -9007199254740992', () => {
        expect(gamma([-1 + 1e-16])).toEqualFloatingPointBinary(-9007199254740992);
    });
    it('-1.0000000000000002 should become 4503599627370495.5', () => {
        expect(gamma([-1.0000000000000002])).toEqualFloatingPointBinary(4503599627370495.5);
    });
    it('overflow x > 171.61447887182298', () => {
        expect(gamma([171.71447887182298])).toEqualFloatingPointBinary(Infinity);
    });
    it('underflow x < -170.5674972726612', () => {
        expect(gamma([-170.6674972726612])).toEqualFloatingPointBinary(0);
    });
    it('2, 4, 5, 6', () => {
        expect(gamma([2, 4, 5, 6])).toEqualFloatingPointBinary([1, 6, 24, 120]);
    });
    it('30, 35, 40, 45, 50', () => {
        expect(gamma([30, 35, 40, 45, 50])).toEqualFloatingPointBinary([
            8.8417619937397007727e30,
            2.9523279903960411956e38,
            2.0397882081197441588e46,
            2.6582715747884485291e54,
            6.0828186403426752249e62,
        ]);
    });
    it('130, 135, 140, 145, 150', () => {
        expect(gamma([130, 135, 140, 145, 150])).toEqualFloatingPointBinary([
            4.9745042224770297777e217,
            1.9929427461617248218e228,
            9.6157231969405526369e238,
            5.5502938327392392576e249,
            3.8089226376305588645e260,
        ]);
    });
    it('-50.5, -1.000000000000004, -55.000000000000004', () => {
        expect(gamma([-50.5, -1.000000000000004, -55.000000000000004])).toEqualFloatingPointBinary([
            -1.4499543939077312447e-65,
            2.5019997929836046875e14,
            1.1082563917023920068e-59,
        ]);
        //gamma([55]);
    });*/
});
