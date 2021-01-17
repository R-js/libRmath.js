import * as fs from 'fs';
import { resolve } from 'path';
import { lgamma, lgamma_internal } from '..';
import '$jest-extension';

describe('lgamma', () => {
    it('ranges [0.09, 3.99] and [-0.09,-3.99]', () => {
        const lines = fs
            .readFileSync(resolve(__dirname, 'fixture-generation', 'lgamma-fixture.R'), 'utf8')
            .split(/\n/)
            .filter((s) => s && s[0] !== '#');

        const x = new Float64Array(lines.length);
        const y = new Float64Array(lines.length);
        lines.forEach((line, i) => {
            const [, _x, _y] = line.split(/\s+/).map(parseFloat);
            x[i] = _x;
            y[i] = _y;
        });
        const received = lgamma(x);
        expect(received).toEqualFloatingPointBinary(y);
    });
    it('force number argument', () => {
        const neg1 = lgamma(-1.2 as any);
        expect(neg1).toEqualFloatingPointBinary(1.5791760340399834117);
    });
    it('force empty array', () => {
        const neg1 = lgamma([]);
        const neg2 = lgamma(new Float32Array(0));
        expect(neg1).toEqualFloatingPointBinary([]);
        expect(neg2).toEqualFloatingPointBinary([]);
    });
    it('process float32Array', () => {
        const neg1 = lgamma(new Float32Array([-4.1, -5.1]));
        expect(neg1 instanceof Float32Array).toBe(true);
        expect(neg1).toEqualFloatingPointBinary([-1.0106752770062721325, -2.6399158167365519567], 17);
    });
    it('invalid argument should throw', () => {
        expect(() => {
            lgamma('hello' as any);
        }).toThrow('lgammafn: argument not of number, number[], Float64Array, Float32Array');
    });
    it('-1,-2,-10 should return +Infinity', () => {
        expect(lgamma([-1, -2, -10])).toEqualFloatingPointBinary([Infinity, Infinity, Infinity]);
    });
    it('x < 1e-306', () => {
        expect(lgamma([0.5e-306])).toEqualFloatingPointBinary(705.28418563673790231);
    });
    it('|x| > 2.53e+305', () => {
        expect(lgamma([2.6e305])).toEqualFloatingPointBinary(Infinity);
        expect(lgamma([-2.6e305])).toEqualFloatingPointBinary(Infinity);
    });
    it('x > 10', () => {
        expect(lgamma([20, 40, 50, 60])).toEqualFloatingPointBinary([
            39.339884187199494647,
            106.63176026064346047,
            144.565743946344866799,
            184.533828861449478609,
        ]);
    });
    it('x > 1e17', () => {
        expect(lgamma([1.1e17])).toEqualFloatingPointBinary(4206318243677341184);
    });
    it('x > 4934720', () => {
        expect(lgamma([4934721])).toEqualFloatingPointBinary(71118238.355323925614);
    });
    it('NaN should return NaN', () => {
        expect(lgamma([NaN])).toEqualFloatingPointBinary(NaN);
    });
    it('x < -10', () => {
        expect(lgamma([-11.5, -20.5, -30.5, -40.5])).toEqualFloatingPointBinary([
            -17.589617626087044044,
            -42.707195974825765461,
            -75.226467981933367923,
            -111.02964715732846912,
        ]);
    });
    it('x = -19.999999999 very close to negative integer should trigger warning', () => {
        expect(lgamma([-19.999999999])).toEqualFloatingPointBinary(-21.612350703526914231);
    });
    it('x=-0.5 should return sign -1, x=-1.5 should return sign 1', () => {
        const sign = new Int8Array(1);
        const s1 = lgamma_internal(-0.5, sign);
        expect(sign[0]).toBe(-1);
        expect(s1).toEqualFloatingPointBinary(1.26551212348465);
        const s2 = lgamma_internal(-1.5, sign);
        expect(s2).toEqualFloatingPointBinary(0.860047015376481);
        expect(sign[0]).toBe(1);
    });
});
