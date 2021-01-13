import * as fs from 'fs';
import { resolve } from 'path';
import { gamma } from '../';
import '$jest-extension';

describe('gamma', function () {
    it('gamma, range "0" to "0.5703"', () => {
        /* load data from fixture */
        const lines = fs
            .readFileSync(resolve(__dirname, 'fixture-generation', 'fixture.R'), 'utf8')
            .split(/\n/)
            .filter((s) => s && s[0] !== '#');
        const x = new Float64Array(lines.length);
        const y = new Float64Array(lines.length);
        // create xy array of Float64Array
        lines.forEach((v, i) => {
            const [_x, _y] = v.split(',').map(parseFloat);
            x[i] = _x;
            y[i] = _y;
        });
        const actual = gamma(x);
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('value -1,-2  should return NaN', () => {
        const neg1 = gamma([-1]);
        const neg2 = gamma([-2]);
        expect(neg1).toEqualFloatingPointBinary(NaN);
        expect(neg2).toEqualFloatingPointBinary(NaN);
    });
    it('negative fraction -1.2 and -0.2, 1.2', () => {
        const neg1 = gamma([-1.2]);
        const neg2 = gamma([-0.2]);
        const neg3 = gamma([1.2]);
        expect(neg1).toEqualFloatingPointBinary(4.8509571405220981433);
        expect(neg2).toEqualFloatingPointBinary(-5.8211485686265156403);
        expect(neg3).toEqualFloatingPointBinary(0.9181687423997606512);
    });
    it('force number argument', () => {
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
});
