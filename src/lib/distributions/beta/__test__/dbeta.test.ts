// node
import { resolve } from 'path';

//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';

//app
import { dbeta } from '..';

describe('dbeta', function () {
    it('ranges x ∊ [0, 1]', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dbeta.R'), /\s+/, 1, 2);
        const actual = x.map(_x => dbeta(_x, 2, 3));
        expect(actual).toEqualFloatingPointBinary(y);
    });
});