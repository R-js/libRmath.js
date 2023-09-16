import { loadData } from '@common/load';
import { resolve } from 'path';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

import { globalUni, RNGkind } from '@rng/global-rng';

import { rlnorm } from '..';

describe('rlnorm', () => {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    describe('invalid input', () => {
        it('p=NaN | meanLog=NaN | sdLog=NaN | sdLog < 0', () => {
            const nan1 = rlnorm(1, NaN);
            expect(nan1).toEqualFloatingPointBinary(NaN);
            const nan2 = rlnorm(1, undefined, NaN);
            expect(nan2).toEqualFloatingPointBinary(NaN);
            const nan3 = rlnorm(1, undefined, -1);
            expect(nan3).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'rlnorm',
                    formatter: "argument out of domain in '%s'",
                    args: ['rlnorm']
                },
                {
                    prefix: '',
                    namespace: 'rlnorm',
                    formatter: "argument out of domain in '%s'",
                    args: ['rlnorm']
                },
                {
                    prefix: '',
                    namespace: 'rlnorm',
                    formatter: "argument out of domain in '%s'",
                    args: ['rlnorm']
                }
            ]);
        });
    });
    describe('fidelity (defer to rnorm[One] for most)', () => {
        beforeEach(() => {
            RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
            globalUni().init(123456);
        });
        it('n=50, mhu=4, sd=8', async () => {
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rlnorm.R'), /\s+/, 1);
            const actual = rlnorm(50, 4, 8);
            expect(actual).toEqualFloatingPointBinary(y, 50);
        });
    });
});
