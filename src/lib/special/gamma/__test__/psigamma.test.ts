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

function load2(fixture: string) {
    const lines = fs
        .readFileSync(resolve(__dirname, 'fixture-generation', fixture), 'utf8')
        .split(/\n/)
        .filter((s) => s && s[0] !== '#');
    const x = new Float64Array(lines.length);
    const y = new Float64Array(lines.length);
    const n = new Int8Array(lines.length);
    // create xy array of Float64Array
    lines.forEach((v, i) => {
        const [, _y, _x, _n] = v.split(/\s+/).map((v) => {
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
        n[i] = _n;
    });
    return { x, y, n };
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
    it('-1.5 deriv=3 makes 194.5943', () => {
        const actual = psigamma(-1.5 as any, 3);
        expect(actual).toEqualFloatingPointBinary(194.5943, 20);
    });
    it('-1.5 deriv=4 makes NaN', () => {
        const actual = psigamma(-1.5 as any, 4);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('n=0 and x*ln(x) > 0.5/Number.EPSILON should use shortcut', () => {
        const actual = psigamma(1e24 as any, 0);
        expect(actual).toEqualFloatingPointBinary(55.262042231857094521);
    });
    it('n=3 and x > n*0.5/Number.EPSILON should use shortcut', () => {
        const actual = psigamma(6855399441055744 as any, 3);
        expect(actual).toEqualFloatingPointBinary(6.2077140202995528676e-48);
    });
    it('n=33 and x = Number.EPSILON * 0.25, trigger overflow', () => {
        const actual = psigamma((Number.EPSILON * 0.25) as any, 33);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('n=3 and x  =  Number.EPSILON * 0.25, trigger overflow', () => {
        const actual = psigamma((Number.EPSILON * 0.25) as any, 3);
        expect(actual).toEqualFloatingPointBinary(6.3187375001134312019e65);
    });
    it('flush test', () => {
        /* load data from fixture */
        const { y, x, n } = load2('psigamma.flush.R');
        const actual = new Float64Array(y.length);
        for (let i = 0; i < x.length; i++) {
            actual[i] = psigamma(x[i] as any, n[i] as number)[0];
        }
        expect(actual).toEqualFloatingPointBinary(y, 19);
    });
});
