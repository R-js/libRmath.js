// node
import { resolve } from 'path';

//helpers
import '$jest-extension';
import { loadData } from '$test-helpers/load';

//app
import { tetragamma } from '..';

describe('tetragamma', function () {
    it('ranges [0.009, 4]', () => {
        /* load data from fixture */
        const [x, y] = loadData(resolve(__dirname, 'fixture-generation', 'tetragamma.R'), /\s+/, 1, 2);
        const actual = tetragamma(x);
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('[0, -1,-2,-3,-10] return NaNs', () => {
        const actual = tetragamma([0, -1, -2, -3, -10]);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('close to negative integers return large positive numbersa', () => {
        const actual = tetragamma([-1.000001, -2.000001, -30.00001]);
        expect(actual).toEqualFloatingPointBinary([2000000001106159104, 1999999998795606016, 2000000000725793]);
    });
    it('single numerical values -1.5, 100', () => {
        const ac1 = tetragamma(-1.5 as any);
        const ac2 = tetragamma(100 as any);
        expect(ac1).toEqualFloatingPointBinary(-0.23620405164171604);
        expect(ac2).toEqualFloatingPointBinary(-0.00010100499983335);
    });
    it('empty array should return empty array', () => {
        const neg1 = tetragamma([]);
        expect(neg1.length).toBe(0);
    });
    it('non array should throw', () => {
        const toThrow = () => tetragamma({} as number[]);
        expect(toThrow).toThrow('argument not of number, number[], Float64Array, Float32Array');
    });
    it('FP32 arguments should return FP23 results', () => {
        const actual = tetragamma(new Float32Array([-1.5, 100]));
        expect(actual instanceof Float32Array).toBe(true);
        expect(actual).toEqualFloatingPointBinary([-0.23620405164171604, -0.00010100499983335], 18);
    });
    it('NaNs should return NaNs', () => {
        const actual = tetragamma(NaN as any);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
});
