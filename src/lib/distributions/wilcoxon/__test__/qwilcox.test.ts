import { loadData } from '@common/test-helpers/load';
import { resolve } from 'path';

import { qwilcox } from '..';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('qwilcox', function () {
    describe('invalid input and edge cases', () => {
        it('x=NaN|m=NaN|n=NaN', () => {
            const nan1 = qwilcox(NaN, 1, 1);
            const nan2 = qwilcox(0, NaN, 1);
            const nan3 = qwilcox(0, 1, NaN);
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
            expect(nan3).toBeNaN();
        });
        it('x=Inf | m = Inf | n = Inf', () => {
            const nan1 = qwilcox(Infinity, 2, 1);
            const nan2 = qwilcox(0.5, Infinity, 1);
            const nan3 = qwilcox(0.5, 1, Infinity);
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
            expect(nan3).toBeNaN();
            expect(getStats().qwilcox).toBe(3);
        });
        it('m <= 0 | n <= 0', () => {
            const stats0 = getStats();
            const nan1 = qwilcox(0.1, -4, 5);
            const nan2 = qwilcox(0.5, 4, -5);
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
            //
            const nan3 = qwilcox(0.1, -4, 5);
            const nan4 = qwilcox(0.5, 4, -5);
            expect(nan3).toBeNaN();
            expect(nan4).toBeNaN();
            const stats1 = getStats();
            expect(stats1.qwilcox - stats0.qwilcox).toBe(4);
        });
        it('q < 0 || q > 1', () => {
            const nan1 = qwilcox(-1, 4, 5);
            const nan2 = qwilcox(1.2, 4, 5);
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
            const stats = getStats();
            expect(stats.R_Q_P01_check).toBe(2);
        });
        it('q = 0 | q = 1', () => {
            const ans1 = qwilcox(0, 4, 5);
            const ans2 = qwilcox(1, 4, 5);
            expect(ans1).toBe(0);
            expect(ans2).toBe(20);
        });
    });
    describe('fidelity', () => {
        it('p=(0,1) qwilcox(p, 10, 10)', async () => {
            const [p, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qwilcox1.R'), /\s+/, 1, 2);
            const answer = p.map((_p) => qwilcox(_p, 10, 10));
            expect(answer).toEqualFloatingPointBinary(y);
        });
    });
});
