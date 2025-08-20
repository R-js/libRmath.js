import { rf } from '..';
import { globalUni, RNGkind } from '@rng/global-rng';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('rf', function () {
    beforeEach(() => {
        RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
        globalUni().init(123456);
    });
    it('n=10, df1=3, df2=55', () => {
        const actual = rf(10, 3, 55);
        expect(actual).toEqualFloatingPointBinary([
            //R fixture
            1.438532335883850877, 0.152292764263807473, 1.07512770983928041, 2.781127780111504411, 0.56168054996008554,
            0.518936008539955584, 0.208490827724434752, 0.054437343138592373, 0.293260799311292508, 0.74592557159034345
        ]);
    });
    it('n=1, df1=-3(<0), df2=55', () => {
        const nan = rf(1, -3, 55);
        const stats = getStats();
        expect(nan).toEqualFloatingPointBinary(NaN);
        expect(stats.rf).toBe(1);
    });
    it('n=1, df1=Inf, df2=Inf', () => {
        const z = rf(1, Infinity, Infinity);
        expect(z).toEqualFloatingPointBinary(1);
    });
});
