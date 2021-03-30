import '$jest-extension';
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';

import { qchisq } from '..';

describe('qchisq', function () {
    it('ranges x ∊ [0, 1] df=15,1', async () => {
        const [x, y1, y2, y3, y4] = await loadData(resolve(__dirname, 'fixture-generation', 'qchisq.R'), /\s+/, 1, 2, 3, 4, 5);
        const ay1 = x.map(_x => qchisq(_x, 15, undefined, true, false));
        expect(ay1).toEqualFloatingPointBinary(y1, 48);
        const ay2 = x.map(_x => qchisq(_x, 1, undefined, true, false));
        expect(ay2).toEqualFloatingPointBinary(y2, 44);
        const ay3 = x.map(_x => qchisq(_x, 2, undefined, true, false));
        expect(ay3).toEqualFloatingPointBinary(y3, 48);
        const ay4 = x.map(_x => qchisq(_x, 5, undefined, true, false));
        expect(ay4).toEqualFloatingPointBinary(y4, 48);        
    });
});