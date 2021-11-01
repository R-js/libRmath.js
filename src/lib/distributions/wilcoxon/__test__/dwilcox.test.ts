import { loadData } from '@common/load';
import { resolve } from 'path';

import { cl, select } from '@common/debug-select';

import { dwilcox } from '../index';

import { exp } from '@lib/r-func';

const dwilcoxDomainWarns = select('dwilcox')("argument out of domain in '%s'");

describe('dweibull', function () {
    describe('invalid input and edge cases', () => {
        beforeEach(() => {
            cl.clear('dwilcox');
        });
        it('x=NaN|m=NaN|n=NaN', () => {
            const nan1 = dwilcox(NaN, 1, 1);
            const nan2 = dwilcox(0, NaN, 1);
            const nan3 = dwilcox(0, 1, NaN);
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
            expect(nan3).toBeNaN();
        });
        it('m <= 0 | n <= 0', () => {
            const nan1 = dwilcox(0, -1, 1);
            const nan2 = dwilcox(0, 1, -1);
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
            expect(dwilcoxDomainWarns()).toHaveLength(2);
        });
        it('if x is larger then an integer by 1e-7 return 0', () => {
            const nonZero1 = dwilcox(3 + 1e-7, 4, 5);
            const nonZero2 = dwilcox(3 - 1e-7, 4, 5);
            const zero1 = dwilcox(3 - 1e-7 * 2, 4, 5);
            const zero2 = dwilcox(3 + 1e-7 * 2, 4, 5);
            expect(nonZero1).not.toBe(0);
            expect(nonZero2).not.toBe(0);
            expect(zero1).toBe(0);
            expect(zero2).toBe(0);
        });
        it('x < 0 || x > m*n', () => {
            const zero1 = dwilcox(-1, 4, 5);
            const nonZero1 = dwilcox(4 * 5, 4, 5);
            const zero2 = dwilcox(4 * 5 + 1, 4, 5);
            expect(zero1).toBe(0);
            expect(zero2).toBe(0);
            expect(nonZero1).not.toBe(1);
        });
    });
    describe('fidelity', () => {
        it('n=4, m=5', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dwilcox1.R'), /\s+/, 1, 2);
            const answer = x.map(_x => dwilcox(_x, 4, 5));
            expect(answer).toEqualFloatingPointBinary(y);
            const answer2 = x.map(_x => exp(dwilcox(_x, 4, 5, true)));
            expect(answer2).toEqualFloatingPointBinary(y, 51);
        });
    });
});