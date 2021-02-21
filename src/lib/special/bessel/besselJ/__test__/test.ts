// node
import { resolve } from 'path';

//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';

//app
import besselJn from '../';


describe('bessel function of the first kind and order 0', function () {
    it('ranges x ∊ [0, 10]', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'bessel-j-0.R'), /\s+/, 1, 2);
        const actual = besselJn(x,0);
        expect(actual).toEqualFloatingPointBinary(y);
    });
});