// node
import { resolve } from 'path';

//helpers
import '$jest-extension';
import { loadData } from '$test-helpers/load';

import { pentagamma } from '@special/gamma';

describe('pentagamma', function () {
    it('ranges [-1,-2] [0,10] [-30,_20]', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pentagamma.R'), /\s+/, 1, 2);
        const actual = pentagamma(x);
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('[0, -1,-2,-3,-10] return Infinity', () => {
        const actual = pentagamma([0, -1, -2, -3, -10]);
        expect(actual).toEqualFloatingPointBinary(Infinity);
    });
    it('close to negative integers return large positive numbersa', () => {
        const actual = pentagamma([-1.000001, -2.000001, -30.00001]);
        expect(actual).toEqualFloatingPointBinary([
            6000000004424636552970240,
            5999999995182424203984896,
            600000000290317139968,
        ]);
    });
    it('single numerical values', () => {
        const ac1 = pentagamma(0);
        expect(ac1).toEqualFloatingPointBinary(Infinity);
    });
    it('empty array should return empty array', () => {
        const neg1 = pentagamma([]);
        expect(neg1.length).toBe(0);
    });
    it('non array should throw', () => {
        const toThrow = () => pentagamma({} as number[]);
        expect(toThrow).toThrow('argument not of number, number[], Float64Array, Float32Array');
    });
    it('FP32 arguments should return FP23 results', () => {
        const actual = pentagamma(new Float32Array([3.30000000000000026645]));
        expect(actual instanceof Float32Array).toBe(true);
        expect(actual).toEqualFloatingPointBinary(0.085849667336884885604, 20);
    });
});
