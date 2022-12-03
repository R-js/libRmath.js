import { loadData } from '@common/load';
import { resolve } from 'path';

import { cl , select } from '@common/debug-mangos-select';
import { ppois } from '..';

const ppoisLogs = select('ppois');
const ppoisDomainWarns = ppoisLogs("argument out of domain in '%s'");

describe('ppois', function () {
    beforeEach(() => {
        cl.clear('ppois');
    });
    describe('invalid input and edge cases', () => {
        it('x and lambda are NaN', () => {
            const nan1 = ppois(NaN, 2);
            expect(nan1).toBeNaN();
            const nan2 = ppois(0.1, NaN);
            expect(nan2).toBeNaN();
        });
        it('lambda < 0', () => {
            const nan1 = ppois(0.5, -1);
            expect(nan1).toBeNaN();
            expect(ppoisDomainWarns()).toHaveLength(1);
        });
        it('x < 0', () => {
            const zero1 = ppois(-0.5, 1);
            expect(zero1).toBe(0);
            const zero2 = ppois(-0.5, 1, true, true);
            expect(zero2).toBe(-Infinity);
        });
        it('lambda = 0', () => {
            const zero1 = ppois(2, 0);
            expect(zero1).toBe(1);
            const zero2 = ppois(2, 0, true, true);
            expect(zero2).toBe(0);
        });
        it('x = Infinity lambda = 4', () => {
            const one1 = ppois(Infinity, 4);
            expect(one1).toBe(1);
            const zero1 = ppois(Infinity, 4, false);
            expect(zero1).toBe(0);
        });
    });
    describe('fidelity', () => {
        it('x > 0 lambda = 10', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'ppois1.R'), /\s+/, 1, 2);
            const result = x.map(_x => ppois(_x, 10));
            expect(result).toEqualFloatingPointBinary(y, 51);
        });
        it('x > 0 lambda = 5', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'ppois2.R'), /\s+/, 1, 2);
            const result = x.map(_x => ppois(_x, 5, false));
            expect(result).toEqualFloatingPointBinary(y, 44);
        });
        it('x > 0 lambda = 20', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'ppois3.R'), /\s+/, 1, 2);
            const result = x.map(_x => ppois(_x, 20, false, true));
            expect(result).toEqualFloatingPointBinary(y, 49);
        });
    });
});