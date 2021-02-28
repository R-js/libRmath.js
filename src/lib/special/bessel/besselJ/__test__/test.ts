// node
import { resolve } from 'path';

//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';

//mock


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
    it('[NaN] in, NaN', async () => {
        const actual = besselJn([NaN], 0);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('[-1] in, NaN', async () => {
        const actual = besselJn([-1], 0);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('besselJ(x=4,nu=1e9) = NaN', async () => {
        const actual = besselJn([4], 1e9);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('besselJ(x=4,nu=-0.5)', async () => {
        const actual = besselJn([4], -0.5);
        expect(actual).toEqualFloatingPointBinary(-0.26076607667717883);
    });
    it('besselJ(x=4,nu=-0.6)', async () => {
        const actual = besselJn([4], -0.6);
        expect(actual).toEqualFloatingPointBinary(-0.20609743783497769);
    });
    it('besselJ(x=1e6,nu=3.6)', async () => {
        const actual = besselJn([1e6], 3.6);
        expect(actual).toEqualFloatingPointBinary(0);
        //check with mock of ML_ERROR "In besselJ(1e+06, 3.6) : value out of range in 'J_bessel'"
    });
    it('besselJ(x=45,nu=15)', async () => {
        const actual = besselJn([45], 15);
        expect(actual).toEqualFloatingPointBinary(-0.046442262826576784);
    });
    it('besselJ(x=45,nu=0)', async () => {
        const actual = besselJn([45], 0);
        expect(actual).toEqualFloatingPointBinary(0.11581867067325632);
    });
});