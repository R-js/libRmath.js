import { loadData } from '@common/load';
import { resolve } from 'path';

import { globalUni, RNGkind } from '@rng/global-rng';

import { rsignrank } from '..';

import { INT_MAX } from '@lib/r-func';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('rsignrank (wilcox sign rank)', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    describe('invalid input and edge cases', () => {
        it('n = NaN', () => {
            const nan1 = rsignrank(1, NaN);
            expect(nan1).toEqualFloatingPointBinary(NaN);
        });
        it('n > INT_MAX return 0', () => {
            const zero = rsignrank(1, INT_MAX + 1);
            expect(zero).toEqualFloatingPointBinary(0);
        });
        it('n < 0', () => {
            const nan1 = rsignrank(1, -1);
            expect(nan1).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'rsignrank',
                    formatter: "argument out of domain in '%s'",
                    args: ['rsignrank']
                }
            ]);
        });
        it('n == 0', () => {
            const zero = rsignrank(1, 0);
            expect(zero).toEqualFloatingPointBinary(0);
        });
    });
    describe('fidelity', () => {
        beforeEach(() => {
            RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
            globalUni().init(123456);
        });
        it('N = 50, n = 3000', async () => {
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rsign1.R'), /\s+/, 1);
            const actual = rsignrank(50, 3000);
            expect(actual).toEqualFloatingPointBinary(y);
        });
    });
});
