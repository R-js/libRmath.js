import { resolve } from 'path';
import { loadData } from '@common/test-helpers/load';


import { pentagamma } from '@special/gamma';

describe('pentagamma', function () {
    it('ranges [-1,-2] [0,10] [-30,_20]', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pentagamma.R'), /\s+/, 1, 2);
        const actual = x.map(pentagamma);
        expect(actual).toEqualFloatingPointBinary(y, 35);
    });
    it('[0, -1,-2,-3,-10] return Infinity', () => {
        const actual = [0, -1, -2, -3, -10].map(pentagamma);
        expect(actual).toEqualFloatingPointBinary(Infinity);
    });
    it('close to negative integers return large positive numbersa', () => {
        const actual = [-1.000001, -2.000001, -30.00001].map(pentagamma);
        expect(actual).toEqualFloatingPointBinary([
            6000000004424636552970240,
            5999999995182424203984896,
            600000000290317139968,
        ]);
    });
    it('single numerical values', () => {
        const ac1 = pentagamma(0);
        expect(ac1).toEqualFloatingPointBinary(Infinity);
    });
    it('FP32 arguments should return FP32 results', () => {
        const actual = pentagamma(3.30000000000000026645);
        expect(actual).toEqualFloatingPointBinary(0.085849667336884885604, 20);
    });
});
