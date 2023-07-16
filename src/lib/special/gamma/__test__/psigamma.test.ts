import { resolve } from 'path';
import { loadData } from '@common/load';

//app
import { psigamma } from '..';

describe('psigamma', function () {
    it('deriv > 100 always returns NaN', () => {
        const actual = psigamma(1, 1001);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('ranges (1,2,3)', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'psigamma.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => psigamma(_x, 6));
        expect(actual).toEqualFloatingPointBinary(y, 10);
    });
    it('deriv=-1 should return NaN', () => {
        /* load data from fixture */
        const actual = psigamma(65, -1);
        expect(actual).toEqualFloatingPointBinary(NaN, undefined, false, true);
    });
    it('-1.5 deriv=3 makes 194.5943', () => {
        const actual = psigamma(-1.5, 3);
        expect(actual).toEqualFloatingPointBinary(194.5943, 20);
    });
    it('-1.5 deriv=4 makes NaN', () => {
        const actual = psigamma(-1.5, 4);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('n=0 and x*ln(x) > 0.5/Number.EPSILON should use shortcut', () => {
        const actual = psigamma(1e24, 0);
        expect(actual).toEqualFloatingPointBinary(55.262042231857094521);
    });
    it('n=3 and x > n*0.5/Number.EPSILON should use shortcut', () => {
        const actual = psigamma(6855399441055744, 3);
        expect(actual).toEqualFloatingPointBinary(6.2077140202995528676e-48);
    });
    it('n=33 and x = Number.EPSILON * 0.25, trigger overflow', () => {
        const actual = psigamma(Number.EPSILON * 0.25, 33);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('n=3 and x  =  Number.EPSILON * 0.25, trigger overflow', () => {
        const actual = psigamma(Number.EPSILON * 0.25, 3);
        expect(actual).toEqualFloatingPointBinary(6.3187375001134312019e65);
    });
    it('flush test', async () => {
        /* load data from fixture */
        const [y, x, n] = await loadData(resolve(__dirname, 'fixture-generation', 'psigamma.flush.R'), /\s+/, 1, 2, 3);
        const actual = new Float64Array(y.length);
        for (let i = 0; i < x.length; i++) {
            actual[i] = psigamma(x[i], n[i]);
        }
        expect(actual).toEqualFloatingPointBinary(y, 19);
    });
});
