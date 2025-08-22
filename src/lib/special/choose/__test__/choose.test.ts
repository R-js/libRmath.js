//app
import { choose } from '..';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('combinatorics (choose)', function () {
    describe('invalid input and edge cases', () => {
        it('a = NaN|b = NaN', () => {
            const nan1 = choose(NaN, 5);
            const nan2 = choose(4, NaN);
            expect([nan1, nan2]).toEqualFloatingPointBinary(NaN);
        });
        it('warning if int(k)-k > 1e-7', () => {
            expect(choose(5, 4 - 1e-7 * 2)).toBe(5);
            expect(getStats()).toEqual({ choose: 1 })
        });
        it('k < 0', () => {
            expect(choose(5, -1)).toBe(0);
        });
    });
});
