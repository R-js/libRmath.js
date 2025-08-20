import { loadData } from '@common/load';
import { resolve } from 'path';

import { plnorm } from '..';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('plnorm', () => {
    describe('invalid input', () => {
        it('x=NaN | meanLog=NaN | sdLog=NaN', () => {
            const nan1 = plnorm(NaN);
            expect(nan1).toBe(NaN);
            const nan2 = plnorm(1, NaN);
            expect(nan2).toBe(NaN);
            const nan3 = plnorm(1, undefined, NaN);
            expect(nan3).toBe(NaN);
        });
        it('sdLob < 0', () => {
            const nan = plnorm(0.5, 4, -1);
            expect(nan).toBe(NaN);
            expect(getStats().plnorm).toBe(1);
        });
        it('x <= 0', () => {
            const zero = plnorm(-1.5);
            expect(zero).toBe(0);
            const negInf = plnorm(0, 0, 1, true, true);
            expect(negInf).toBe(-Infinity);
        });
    });
    describe('fidelity (defer rest to pnorm)', () => {
        it('x = [0.5,100, step 10], mhu=4, sd=8', async () => {
            const [x, y1, y2] = await loadData(resolve(__dirname, 'fixture-generation', 'plnorm.R'), /\s+/, 1, 2, 3);
            const actual1 = x.map((_x) => plnorm(_x, 4, 8));
            const actual2 = x.map((_x) => plnorm(_x, 4, 8, false, true));
            expect(actual1).toEqualFloatingPointBinary(y1);
            expect(actual2).toEqualFloatingPointBinary(y2);
        });
    });
});
