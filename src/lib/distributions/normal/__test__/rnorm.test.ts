import { loadData } from '@common/load';
import { resolve } from 'node:path';

import { rnorm } from '..';

import { globalUni, RNGkind } from '@rng/global-rng';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('rnorm', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
        globalUni().init(123456);
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    describe('invalid input check and edge cases', () => {
        it('mhu = NaN | sigma = NaN | sigma < 0', () => {
            const nan1 = rnorm(1, NaN);
            const nan2 = rnorm(1, undefined, NaN);
            const nan3 = rnorm(1, undefined, -1);
            expect(nan1).toEqualFloatingPointBinary(NaN);
            expect(nan2).toEqualFloatingPointBinary(NaN);
            expect(nan3).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'rnorm',
                    formatter: "argument out of domain in '%s'",
                    args: ['rnorm']
                },
                {
                    prefix: '',
                    namespace: 'rnorm',
                    formatter: "argument out of domain in '%s'",
                    args: ['rnorm']
                },
                {
                    prefix: '',
                    namespace: 'rnorm',
                    formatter: "argument out of domain in '%s'",
                    args: ['rnorm']
                }
            ]);
        });
        it('mhu = Infinity | sigma = 0', () => {
            const mhu1 = rnorm(1, Infinity);
            const mhu2 = rnorm(1, 3, 0);
            expect(mhu1).toEqualFloatingPointBinary(Infinity);
            expect(mhu2).toEqualFloatingPointBinary(3);
        });
    });
    describe('fidelity', () => {
        it('100 samples', async () => {
            const [expected] = await loadData(resolve(__dirname, 'fixture-generation', 'rnorm.R'), /\s+/, 1);
            const actual = rnorm(100);
            expect(actual).toEqualFloatingPointBinary(expected);
        });
    });
});
