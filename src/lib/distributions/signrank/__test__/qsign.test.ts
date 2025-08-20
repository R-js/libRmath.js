import ms from 'ms';

import { loadData } from '@common/load';
import { resolve } from 'path';
import { qsignrank, useWasmBackendSignRank, clearBackendSignRank, psignrank } from '..';
import { log, DBL_EPSILON } from '@lib/r-func';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('qsignrank (wilcox sign rank)', function () {
    describe('invalid input and edge cases', () => {
        it('p = NaN | n = NaN', () => {
            const nan1 = qsignrank(NaN, 2);
            expect(nan1).toBeNaN();
            const nan2 = qsignrank(0.5, NaN);
            expect(nan2).toBeNaN();
        });
        it('p = Infinite | n = Inf', () => {
            const nan1 = qsignrank(Infinity, 4);
            expect(nan1).toBeNaN();
            const nan2 = qsignrank(0.5, Infinity);
            expect(nan2).toBeNaN();
            expect(getStats().qsignrank).toBe(2);
        });
        it('p < 0 | p > 1', () => {
            const nan1 = qsignrank(-1, 4);
            expect(nan1).toBeNaN();
            const nan2 = qsignrank(1.1, 5);
            expect(nan2).toBeNaN();
            const stats = getStats();
            expect(stats.R_Q_P01_check).toBe(2);
        });
        it('n <= 0', () => {
            const stats0 = getStats();
            const nan1 = qsignrank(0.2, -4);
            expect(nan1).toBeNaN();
            const nan2 = qsignrank(0.2, 0);
            expect(nan2).toBeNaN();
            const stats1 = getStats();
            expect(stats1.qsignrank - stats0.qsignrank).toBe(2);
        });
        it('p = 0 | p = log(exp(1)) if pAsLog=true && lowerTail = true', () => {
            const zero1 = qsignrank(0, 4, true, false);
            expect(zero1).toBe(0);
            const zero3 = qsignrank(log(0), 4, true, true);
            expect(zero3).toBe(0);
        });
        it('p = 1 | p = 0 if lowerTail=false (with all combinations of pAsLog)', () => {
            const res1 = qsignrank(1, 4, true, false);
            expect(res1).toBe(10);
            const res2 = qsignrank(log(1), 4, true, true);
            expect(res2).toBe(10);
            const zero2 = qsignrank(log(1), 4, false, true);
            expect(zero2).toBe(0);
            const ten = qsignrank(log(0), 4, false, true);
            expect(ten).toBe(10);
        });
        it('n > DBL_MIN_VALUE_LN/M_LN2 (=1074), should give NaN', () => {
            const nan = qsignrank(DBL_EPSILON * 10, 1075);
            expect(nan).toBeNaN();
        });
        it('n === DBL_MIN_VALUE_LN/M_LN2 (=1074), p=eps*12 should give 207584', () => {
            const res = qsignrank(DBL_EPSILON * 12, 1074);
            expect(res).toEqualFloatingPointBinary(207584);
        });
        it.todo('(diverge from fedility) qsignrank((log(0), 4, lowerTail=true, pAsLog = TRUE) sould be 0 not a NaN');
        it.todo('n > 1074 should give NaN add to upstream');
    });
    describe('fidelity', () => {
        it('qsignrank(psignrank(X, 40, T), 40) == X', () => {
            expect(qsignrank(psignrank(219, 40, true), 40)).toBe(219);
            expect(qsignrank(psignrank(261, 40, true), 40)).toBe(261);
            expect(qsignrank(psignrank(260, 40, true), 40)).toBe(260);
        });
        it('n = 40, check via qsignrank(psignrank(x, 40) === x, 40)', async () => {
            const [x] = await loadData(resolve(__dirname, 'fixture-generation', 'qsign1a.R'), /\s+/, 1);
            const p = x.map((_x) => psignrank(_x, 40));
            // reverse
            const xCalc = p.map((_p) => qsignrank(_p, 40));
            expect(x).toEqual(xCalc);
        });
        it('n = 40, check via qsignrank(psignrank(x, 40) === x, 40)', async () => {
            const [x] = await loadData(resolve(__dirname, 'fixture-generation', 'qsign1a.R'), /\s+/, 1);
            const p = x.map((_x) => psignrank(_x, 40));
            // reverse
            const xCalc = p.map((_p) => qsignrank(_p, 40));
            const xCalc2 = p.map((_p) => qsignrank(log(_p), 40, undefined, true));
            expect(x).toEqual(xCalc);
            expect(x).toEqual(xCalc2);
        });
        it.todo('upstream qsignrank(log(0), asLogP=true) should not return a NaN');
        it('(wasm) n = 1074', async () => {
            useWasmBackendSignRank();
            const start0 = Date.now();
            const [x, xCalc] = await loadData(resolve(__dirname, 'fixture-generation', 'qsign1b.R'), /\s+/, 1, 2);
            const p = x.map((_x) => psignrank(_x, 1074));
            const start1 = Date.now();
            const xCalcActual = p.map((_p) => qsignrank(_p, 1074));
            console.log(
                `(wasm) psignrank lasted ${ms(Date.now() - start0)} and qsignrank lasted ${ms(Date.now() - start1)}`
            );
            expect(xCalcActual).toEqualFloatingPointBinary(xCalc);
            clearBackendSignRank();
        });
        it.skip('(no wasm) n = 1074', async () => {
            const start0 = Date.now();
            const [x, xCalc] = await loadData(resolve(__dirname, 'fixture-generation', 'qsign1b.R'), /\s+/, 1, 2);
            const p = x.map((_x) => psignrank(_x, 1074));
            const start1 = Date.now();
            const xCalcActual = p.map((_p) => qsignrank(_p, 1074));
            console.log(
                `(no wasm) psignrank lasted ${ms(Date.now() - start0)} and qsignrank lasted ${ms(Date.now() - start1)}`
            );
            expect(xCalcActual).toEqualFloatingPointBinary(xCalc);
        });
    });
});
