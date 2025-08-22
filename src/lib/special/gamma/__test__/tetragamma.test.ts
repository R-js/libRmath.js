import { resolve } from 'path';
import { loadData } from '@common/test-helpers/load';

//app
import { tetragamma } from '@special/gamma';

describe('tetragamma', function () {
    it('ranges [0.009, 4]', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'tetragamma.R'), /\s+/, 1, 2);
        const actual = x.map(tetragamma);
        expect(actual).toEqualFloatingPointBinary(y, 35);
    });
    it('[0, -1,-2,-3,-10] return NaNs', () => {
        const actual = [0, -1, -2, -3, -10].map(tetragamma);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('close to negative integers return large positive numbersa', () => {
        const actual = [-1.000001, -2.000001, -30.00001].map(tetragamma);
        expect(actual).toEqualFloatingPointBinary([2000000001106159104, 1999999998795606016, 2000000000725793], 49);
    });
    it('single numerical values -1.5, 100', () => {
        const ac1 = tetragamma(-1.5);
        const ac2 = tetragamma(100);
        expect(ac1).toEqualFloatingPointBinary(-0.23620405164171604, 40);
        expect(ac2).toEqualFloatingPointBinary(-0.00010100499983335, 48);
    });
    it('NaNs should return NaNs', () => {
        const actual = tetragamma(NaN);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
});
