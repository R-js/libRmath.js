import * as fs from 'fs';
import { resolve } from 'path';
import { psigamma } from '..';
import '$jest-extension';

function load(fixture: string) {
    const lines = fs
        .readFileSync(resolve(__dirname, 'fixture-generation', fixture), 'utf8')
        .split(/\n/)
        .filter((s) => s && s[0] !== '#');
    const x = new Float64Array(lines.length);
    const y = new Float64Array(lines.length);
    // create xy array of Float64Array
    lines.forEach((v, i) => {
        const [, _x, _y] = v.split(/\s+/).map((v) => {
            if (v === 'Inf') {
                return Infinity;
            }
            if (v === '-Inf') {
                return -Infinity;
            }
            return parseFloat(v);
        });
        x[i] = _x;
        y[i] = _y;
    });
    return [x, y];
}

describe('psigamma', function () {
    it('deriv > 100 always returns NaN', () => {
        const actual = psigamma(1 as any, 1001);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('ranges (1,2,3)', () => {
        /* load data from fixture */
        const [x, y] = load('psigamma.R');
        const actual = psigamma(x, 6);
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('deriv=-1 should return NaN', () => {
        /* load data from fixture */
        const actual = psigamma(65 as any, -1);
        expect(actual).toEqualFloatingPointBinary(NaN, undefined, false, true);
    });
    /* it('[0, -1,-2,-3,-10] return Infinity', () => {
        const actual = psigamma([0, -1, -2, -3, -10], 0);
        expect(actual).toEqualFloatingPointBinary(Infinity);
    });
    it('close to negative integers return large positive numbersa', () => {
        const actual = psigamma([-1.000001, -2.000001, -30.00001], 0);
        expect(actual).toEqualFloatingPointBinary([
            6000000004424636552970240,
            5999999995182424203984896,
            600000000290317139968,
        ]);
    });
    it('single numerical values', () => {
        const ac1 = psigamma(0 as any, 0);
        expect(ac1).toEqualFloatingPointBinary(Infinity);
    });
    it('empty array should return empty array', () => {
        const neg1 = psigamma([], 0);
        expect(neg1.length).toBe(0);
    });
    it('non array should throw', () => {
        const toThrow = () => psigamma({} as number[], 0);
        expect(toThrow).toThrow('argument not of number, number[], Float64Array, Float32Array');
    });
    it('FP32 arguments should return FP23 results', () => {
        const actual = psigamma(new Float32Array([3.30000000000000026645]), 0);
        expect(actual instanceof Float32Array).toBe(true);
        expect(actual).toEqualFloatingPointBinary(0.085849667336884885604, 20);
    });*/
});
