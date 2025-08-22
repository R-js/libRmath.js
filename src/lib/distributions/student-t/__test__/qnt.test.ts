import { loadData } from '@common/test-helpers/load';
import { resolve } from 'path';

import { DBL_EPSILON } from '@lib/r-func';

import { qt } from '..';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();


function partialQntf(p: number, df: number, ncp: number, lowerTail = true, logP = false) {
    return qt(p, df, ncp, lowerTail, logP);
}

describe('qnt(x, df, ncp, lower.tail, log.p)', () => {
    describe('invalid input and edge cases', () => {
        it('x=NaN | df=NaN | ncp=NaN', () => {
            const nan1 = partialQntf(NaN, 4, 4);
            expect(nan1).toBeNaN();
            const nan2 = partialQntf(0.5, NaN, 7);
            expect(nan2).toBeNaN();
            const nan3 = partialQntf(0.5, 4, NaN);
            expect(nan3).toBeNaN();
        });
        it('df <= 0', () => {
            const nan1 = partialQntf(0.5, -1, 7);
            expect(nan1).toBeNaN();
        });
        it('df <= 0', () => {
            const nan1 = partialQntf(0.5, -1, 7);
            expect(nan1).toBeNaN();
        });
        it('p <= 0 | p >= 1', () => {
            const negInf = partialQntf(0, 4, 7);
            expect(negInf).toEqualFloatingPointBinary(-Infinity);

            const posInf = partialQntf(1, 4, 7);
            expect(posInf).toEqualFloatingPointBinary(Infinity);

            const nan1 = partialQntf(-1, 4, 6);
            const nan2 = partialQntf(1.2, 4, 6);
            expect([nan1, nan2]).toEqualFloatingPointBinary(NaN);
            expect(getStats().qnt).toBe(2);
        });
        it('df = Infinity', () => {
            const dfInf = partialQntf(0.2, Infinity, 7);
            expect(dfInf).toEqualFloatingPointBinary(6.1583787664270861);
        });
        it('p > 1- DBL-EPSILON', () => {
            const posInf = partialQntf(1 - DBL_EPSILON / 2, 10, 7);
            expect(posInf).toBe(Infinity);
        });
        it('ncp = 0, df >= 1', () => {
            const qt = partialQntf(0.4, 1, 6, true, false);
            expect(qt).toEqualFloatingPointBinary(7.0586141707150034, 35);
        });
    });
    describe('fidelity', () => {
        it('p=seq(0,1) df=4 ncp=6', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qnt1.R'), /\s+/, 1, 2);
            const actual = x.map((_x) => {
                return partialQntf(_x, 4, 6);
            });
            expect(actual).toEqualFloatingPointBinary(y, 22);
        });
    });
});
