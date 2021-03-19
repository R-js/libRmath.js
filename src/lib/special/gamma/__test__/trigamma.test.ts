// node
import { resolve } from 'path';

//helpers
import '$jest-extension';
import { loadData } from '$test-helpers/load';

//app
import { trigamma } from '@special/gamma';

describe('trigamma', function () {
    it('ranges [0.0005, 0.9005] [1,50]', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'trigamma.R'), /\s+/, 1, 2);
        const actual = trigamma(x);
        expect(actual).toEqualFloatingPointBinary(y,35);
    });
    it('return infinity at -4,-3,-2,-1,0', () => {
        const actual = trigamma([-4, -3, -2, -1, 0]);
        expect(actual).toEqualFloatingPointBinary(Infinity);
    });
    it('ranges [-4,-3], [-2,-1] [-1,0]', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'trigamma-negative.R'), /\s+/, 1, 2);
        const actual = trigamma(x);
        expect(actual).toEqualFloatingPointBinary(y, 42);
    });
    it('single numerical values -1.5, 100', () => {
        const ac1 = trigamma(-1.5);
        const ac2 = trigamma(100);
        expect(ac1).toEqualFloatingPointBinary(9.37924664498912363797, 50);
        expect(ac2).toEqualFloatingPointBinary(0.010050166663333566161);
    });
    it('empty array should return empty array', () => {
        const neg1 = trigamma([]);
        expect(neg1.length).toBe(0);
    });
    it('non array should throw', () => {
        const toThrow = () => trigamma({} as number[]);
        expect(toThrow).toThrow('argument not of number, number[], Float64Array, Float32Array');
    });
    it('FP32 arguments should return FP23 results', () => {
        const actual = trigamma(new Float32Array([-1.5, 100]));
        expect(actual instanceof Float32Array).toBe(true);
        expect(actual).toEqualFloatingPointBinary([9.3792466, 0.01005016], 18);
    });
});
