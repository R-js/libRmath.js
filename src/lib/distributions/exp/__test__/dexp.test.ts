import { describe } from 'vitest';
import { loadData } from '@common/test-helpers/load';

import { resolve } from 'path';
import { dexp } from '..';
import { createObjectLogHarnas } from '@common/debug-backend';
import { unRegisterObjectController } from '@common/debug-frontend';

describe.concurrent('dexp', function () {
    it('x=[-0.5, 3], rate=(1, 2, 45, 0.5)', async () => {
        unRegisterObjectController();
        const [p, y1, y2, y3, y4] = await loadData(
            resolve(__dirname, 'fixture-generation', 'dexp.R'),
            /\s+/,
            1,
            2,
            3,
            4,
            5
        );

        const a1 = p.map((_p) => dexp(_p, 1));
        expect(a1).toEqualFloatingPointBinary(y1, 51);

        const a2 = p.map((_p) => dexp(_p, 2));
        expect(a2).toEqualFloatingPointBinary(y2, 50);

        const a3 = p.map((_p) => dexp(_p, 4));
        expect(a3).toEqualFloatingPointBinary(y3, 50);

        const a4 = p.map((_p) => dexp(_p, 8));
        expect(a4).toEqualFloatingPointBinary(y4, 50);
    });
    it('rate = NaN', () => {
        unRegisterObjectController();
        const nan = dexp(0, NaN);
        expect(nan).toBeNaN();
    });
    it('rate = -3 (<0)', () => {
        unRegisterObjectController();
        const { getStats } = createObjectLogHarnas();
        const nan = dexp(0, -3);
        expect(nan).toBeNaN();
        const stats = getStats();
        expect(stats.dexp).toBe(1);
    });
    it('asLog = true, rate = 5, x=0', () => {
        unRegisterObjectController();
        const z = dexp(0, 5, true);
        expect(z).toEqualFloatingPointBinary(1.6094379124341003);
    });
    it('defaults', () => {
        unRegisterObjectController();
        const z = dexp(3);
        expect(z).toEqualFloatingPointBinary(0.049787068367863944);
    });
});
