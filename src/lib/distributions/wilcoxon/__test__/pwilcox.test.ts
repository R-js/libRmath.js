import { trunc } from '@lib/r-func';
import { pwilcox } from '..';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('pwilcox', function () {
    describe('invalid input and edge cases', () => {
        it('q=NaN|m=NaN|n=NaN', () => {
            const nan1 = pwilcox(NaN, 1, 1);
            const nan2 = pwilcox(0, NaN, 1);
            const nan3 = pwilcox(0, 1, NaN);
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
            expect(nan3).toBeNaN();
        });
        it('m = Inf | n = Inf', () => {
            const nan1 = pwilcox(0, Infinity, 1);
            const nan2 = pwilcox(0, 1, Infinity);
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
            expect(getStats().pwilcox).toBe(2);
        });
        it('m < 0 | n < 0', () => {
            const nan1 = pwilcox(3, -4, 5);
            const nan2 = pwilcox(3, 4, -5);
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
        });
        it('q < 0 || q > m*n', () => {
            const zero1 = pwilcox(-1, 4, 5);
            const one1 = pwilcox(4 * 5, 4, 5);
            const one2 = pwilcox(4 * 5 + 1, 4, 5);
            expect(zero1).toBe(0);
            expect(one1).toBe(1);
            expect(one2).toBe(1);
        });
    });
    describe('fidelity', () => {
        it('q <= (m*n)/2, n=4, m=5', () => {
            const answer = pwilcox((4 * 5) / 2, 4, 5);
            expect(answer).toEqualFloatingPointBinary(0.54761904761904767);
        });
        it('q > (m*n)/2, n=4, m=5', () => {
            const answer = pwilcox(trunc(4 * 5 * 0.8), 4, 5);
            expect(answer).toEqualFloatingPointBinary(0.94444444444444442);
        });
    });
});
