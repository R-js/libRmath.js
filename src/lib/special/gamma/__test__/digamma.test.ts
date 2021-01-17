import * as fs from 'fs';
import { resolve } from 'path';
import { digamma } from '..';
import '$jest-extension';

describe('digamma', function () {
    it.only('ranges [0.05, 9.95] and [-1.00 , 0] and [-11.00, -10.00]', () => {
        /* load data from fixture */
        const lines = fs
            .readFileSync(resolve(__dirname, 'fixture-generation', 'digamma.R'), 'utf8')
            .split(/\n/)
            .filter((s) => s && s[0] !== '#');
        const x = new Float64Array(lines.length);
        const y = new Float64Array(lines.length);
        // create xy array of Float64Array
        lines.forEach((v, i) => {
            const [, _x, _y] = v.split(/\s+/).map(parseFloat);
            x[i] = _x;
            y[i] = _y;
        });
        const actual = digamma(x);
        expect(actual).toEqualFloatingPointBinary(y);
    });
    /* it('value -1,-2  should return NaN', () => {
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
