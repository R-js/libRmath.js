// node
import { resolve } from 'path';

import { loadData } from '@common/load';
import { dcauchy } from '..';

describe('dcauchy', function () {
    it('ranges x ∊ [-40, 40, step 1] location=2, scale=3, log=true', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dcauchy.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => dcauchy(_x, 2, 3, true));
        expect(actual).toEqualFloatingPointBinary(y, 51);
    });
    it('ranges x ∊ [-40, 40, step 1] location=2, scale=3, log=false', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dcauchy2.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => dcauchy(_x, 2, 3, false));
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('x=NaN, location=0,scale=10', () => {
        const nan = dcauchy(NaN, 0, 10);
        expect(nan).toBeNaN();
    });
    it('x=2, location=0,scale=-10 (<0)', () => {
        const nan = dcauchy(2, 0, -10);
        expect(nan).toBeNaN();
    });
    it('x=2, + defaults', () => {
        const z = dcauchy(2);
        expect(z).toEqualFloatingPointBinary(0.063661977236758135);
    });
});
