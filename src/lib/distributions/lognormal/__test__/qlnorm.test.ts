import { loadData } from '@common/load';
import { resolve } from 'path';
import { cl, select } from '@common/debug-mangos-select';

import { qlnorm } from '..';

const bounderies = select('R_Q_P01_boundaries');
const warnings = bounderies("argument out of domain in '%s'");

//  qlnorm(p: number, meanlog = 0, sdlog = 1, lower_tail = true, log_p = false):
describe('qlnorm', () => {
    describe('invalid input', () => {
        beforeEach(() => {
            cl.clear('R_Q_P01_boundaries');
        });
        it('p=NaN | meanLog=NaN | sdLog=NaN', () => {
            const nan1 = qlnorm(NaN);
            expect(nan1).toBe(NaN);
            const nan2 = qlnorm(1, NaN);
            expect(nan2).toBe(NaN);
            const nan3 = qlnorm(1, undefined, NaN);
            expect(nan3).toBe(NaN);
        });
        it('p < 0', () => {
            const nan = qlnorm(-0.5, 4, 1, true, false);
            expect(nan).toBe(NaN);
            expect(warnings()).toHaveLength(1);
        });
        it('p <= 0 | p >= 1', () => {
            const nan1 = qlnorm(-0.5, 4, 1, true);
            expect(nan1).toBe(NaN);
            //
            const nan2 = qlnorm(1.5, 4, 1, false);
            expect(nan2).toBe(NaN);
            //
            const nan3 = qlnorm(1.5, 4, 1, true);
            expect(nan3).toBe(NaN);
            // qlnorm(-Inf,4,1, FALSE, TRUE) -> 1
            const inf1 = qlnorm(-Infinity, 4, 1, false, true);
            expect(inf1).toBe(Infinity);

            const zero1 = qlnorm(-Infinity, 4, 1, true, true);
            expect(zero1).toBe(0);
            expect(warnings()).toHaveLength(3);
        });

    });
    describe('fidelity (defer to qnorm for most)', () => {
        it('x = [0,1, step 0.1], mhu=4, sd=8', async () => {
            const [x, y1, y2] = await loadData(
                resolve(__dirname, 'fixture-generation', 'qlnorm.R'),
                /\s+/,
                1, 2, 3
            );
            const actual1 = x.map(_x => qlnorm(_x, 4, 8));
            const actual2 = x.map(_x => qlnorm(Math.log(_x), 4, 8, false, true));
            expect(actual1).toEqualFloatingPointBinary(y1, 50);
            expect(actual2).toEqualFloatingPointBinary(y2, 47);
        })
    });
});
