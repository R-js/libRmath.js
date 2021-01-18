import * as fs from 'fs';
import { resolve } from 'path';
import { trigamma } from '..';
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

describe('trigamma', function () {
    it('ranges [0.0005, 0.9005] [1,50]', () => {
        /* load data from fixture */
        const [x, y] = load('trigamma.R');
        const actual = trigamma(x);
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('return infinity at -4,-3,-2,-1,0', () => {
        const actual = trigamma([-4, -3, -2, -1, 0]);
        expect(actual).toEqualFloatingPointBinary(Infinity);
    });
    it('ranges [-4,-3], [-2,-1] [-1,0]', () => {
        const [x, y] = load('trigamma-negative.R');
        const actual = trigamma(x);
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('single numerical values -1.5, 100', () => {
        const ac1 = trigamma(-1.5 as any);
        const ac2 = trigamma(100 as any);
        expect(ac1).toEqualFloatingPointBinary(9.37924664498912363797);
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
