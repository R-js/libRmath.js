import { loadData } from '@common/load';
import { resolve } from 'path';

import { pnorm } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('pnorm', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    describe('invalid input check and edge cases', () => {
        it('q = NaN or mu = Nan, or sigma = NaN', () => {
            const nan1 = pnorm(NaN);
            expect(nan1).toBeNaN();
            const nan2 = pnorm(0, NaN);
            expect(nan2).toBeNaN();
            const nan3 = pnorm(0, 1, NaN);
            expect(nan3).toBeNaN();
        });
        it('x = ± Infinity and equal to µ (= ± Infinity) gives NaN', () => {
            expect(pnorm(Infinity, Infinity, 1)).toBeNaN();
            expect(pnorm(-Infinity, -Infinity, 1)).toBeNaN();
        });
        it('sd < 0', () => {
            expect(pnorm(0, 0, -1)).toBe(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'pnorm',
                    formatter: "argument out of domain in '%s'",
                    args: ['pnorm']
                }
            ]);
        });
        it('sd == 0, (unit step function)', () => {
            expect(pnorm(0, 0, 0)).toBe(1);
            expect(pnorm(-Number.EPSILON, 0, 0)).toBe(0);

            expect(pnorm(0, 0, 0, false)).toBe(0);
            expect(pnorm(-Number.EPSILON, 0, 0, false)).toBe(1);

            expect(pnorm(0, 0, 0, false, true)).toBe(-Infinity);
            expect(pnorm(-Number.EPSILON, 0, 0, false, true)).toBe(0);
        });
        it('limit q < u,  u= Number.MAX_VALUE and sd == Number.MIN_VALUE', () => {
            expect(pnorm(0, Number.MAX_VALUE, Number.MIN_VALUE, true, false)).toBe(0);
            expect(pnorm(0, Number.MAX_VALUE, Number.MIN_VALUE, false, false)).toBe(1);

            expect(pnorm(0, Number.MAX_VALUE, Number.MIN_VALUE, true, true)).toBe(-Infinity);
            expect(pnorm(0, Number.MAX_VALUE, Number.MIN_VALUE, false, true)).toBe(0);

            expect(pnorm(Number.MAX_VALUE, 0, Number.MIN_VALUE, true, false)).toBe(1);
            expect(pnorm(Number.MAX_VALUE, 0, Number.MIN_VALUE, false, false)).toBe(0);

            expect(pnorm(Number.MAX_VALUE, 0, Number.MIN_VALUE, true, true)).toBe(0);
            expect(pnorm(Number.MAX_VALUE, 0, Number.MIN_VALUE, false, true)).toBe(-Infinity);
        });
    });
    describe('fidelity', () => {
        it('-10 < z < 10, mhu=0, sd=1, lower=T, aslog=F', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnorm1.R'), /\s+/, 1, 2);
            const result = x.map((_x) => pnorm(_x, 0, 1, true, false));
            expect(result).toEqualFloatingPointBinary(y, 45);
        });
        it('-10 < z < 10, mhu=0, sd=1, lower=F, aslog=F', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnorm2.R'), /\s+/, 1, 2);
            const result = x.map((_x) => pnorm(_x, 0, 1, false, false));
            expect(result).toEqualFloatingPointBinary(y, 45);
        });
        it('-10 < z < 10, mhu=0, sd=1, lower=T, aslog=T', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnorm3.R'), /\s+/, 1, 2);
            const result = x.map((_x) => pnorm(_x, 0, 1, true, true));
            expect(result).toEqualFloatingPointBinary(y, 45);
        });
        it('-10 < z < 10, mhu=0, sd=1, lower=F, aslog=T', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnorm4.R'), /\s+/, 1, 2);
            const result = x.map((_x) => pnorm(_x, 0, 1, false, true));
            expect(result).toEqualFloatingPointBinary(y, 42);
        });
    });
});
