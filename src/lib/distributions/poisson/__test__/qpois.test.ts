import { loadData } from '@common/load';
import { resolve } from 'path';
import { cl, select } from '@common/debug-mangos-select';

import { qpois } from '..';
import { EPSILON, log } from '@lib/r-func';


const qpoisLogs = select('qpois');
const qpoisDomainWarns = qpoisLogs("argument out of domain in '%s'");

describe('qpois', function () {
    beforeEach(() => {
        cl.clear('qpois');
    });
    describe('invalid input and edge cases', () => {
        it('p = NaN | lambda = NaN', () => {
            const nan1 = qpois(NaN, 2);
            expect(nan1).toBeNaN();
            const nan2 = qpois(0.1, NaN);
            expect(nan2).toBeNaN();
        });
        it('lambda = Infinite', () => {
            const nan1 = qpois(0.5, Infinity);
            expect(nan1).toBeNaN();
            expect(qpoisDomainWarns()).toHaveLength(1);
        });
        it('lambda < 0', () => {
            const nan1 = qpois(0.5, -1);
            expect(nan1).toBeNaN();
            expect(qpoisDomainWarns()).toHaveLength(1);
        });
        it('lambda = 0', () => {
            const zero1 = qpois(0.5, 0);
            expect(zero1).toBe(0);
        });
        it('p <= 0 or p >= 1 any lambda > 0', () => {
            const nan1 = qpois(-0.1, 4);
            expect(nan1).toBeNaN();
            const nan2 = qpois(1.1, 4);
            expect(nan2).toBeNaN();
            // p = 0 | p = 1
            const inf1 = qpois(0, 4, false);
            expect(inf1).toBe(Infinity);
            const zero2 = qpois(1, 4, false);
            expect(zero2).toBe(0);
        });
        it('asLog = true, and exp(log(p < -10_000)) will go 0 or 1 (lower_tail = false)', () => {
            const zero1 = qpois(-10_000, 4, true, true);
            expect(zero1).toBe(0);
            const Inf = qpois(-10_000, 4, false, true);
            expect(Inf).toBe(Infinity);
        });
        it('1 - p < 1.01*EPSILON -> Infinity )', () => {
            const Inf = qpois(1 - EPSILON * 1.01, 4, true, false);
            expect(Inf).toBe(Infinity);
        });
    });
    describe('fidelity', () => {
        it('p = [0,1] lambda = 4', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qpois1.R'), /\s+/, 1, 2);
            const result1 = x.map(_x => qpois(_x, 4));
            expect(result1).toEqualFloatingPointBinary(y);
            const result2 = x.map(_x => qpois(log(_x), 4, true, true));
            expect(result2).toEqualFloatingPointBinary(y);
        });
        it('p = [0,1] lambda > 1e5 (1e6)', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qpois2.R'), /\s+/, 1, 2);
            const result1 = x.map(_x => qpois(_x, 1e6));
            expect(result1).toEqualFloatingPointBinary(y);
            const result2 = x.map(_x => qpois(log(_x), 1e6, true, true));
            expect(result2).toEqualFloatingPointBinary(y);
        });
    });
});