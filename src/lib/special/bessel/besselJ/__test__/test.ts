// node
import { resolve } from 'path';

//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';

//app
import besselJn from '../';

describe('bessel function of order 0', function () {
    it('ranges x ∊ [0, 10]', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'bessel-j-0.R'), /\s+/, 1, 2);
        const actual = besselJn(x, 0);
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('single value', async () => {
        const actual = besselJn(4 as any, 0);
        expect(actual).toEqualFloatingPointBinary(-0.3971498098638474028);
    });
    it('empty array', async () => {
        const actual = besselJn([], 0);
        expect(actual).toEqualFloatingPointBinary([]);
    });
    it('missing nu', async () => {
        expect(() => besselJn([], undefined as any)).toThrow('argument "nu" is missing/not a number, Execution halted');
    });
    it('not a "NumArray"', async () => {
        expect(() => besselJn('something' as any, 1)).toThrow('argument not of number, number[], Float64Array, Float32Array');
    });
    it('fp32 in, fp32 out', async () => {
        const actual = besselJn(new Float32Array([4, 5, 6]), 0);
        expect(actual instanceof Float32Array).toEqual(true);
    });
    it('fp64 in, fp64 out', async () => {
        const actual = besselJn(new Float64Array([4, 5, 6]), 0);
        expect(actual instanceof Float64Array).toEqual(true);
    });
    it('number[] in, fp64 out', async () => {
        const actual = besselJn([4, 5, 6], 0);
        expect(actual instanceof Float64Array).toEqual(true);
    });
});