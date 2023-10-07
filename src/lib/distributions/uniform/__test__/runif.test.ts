import { loadData } from '@common/load';
import { resolve } from 'path';

import { runif } from '..';

import { globalUni, RNGkind } from '@rng/global-rng';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('runif', function () {
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
        it('n=Nan', () => {
            // qunif(p: number, a = 0, b = 1, lowerTail = true, logP = false)
            expect(() => runif(NaN)).toThrowError('"n=NaN" is not a positive finite number');
        });
        it('n=0', () => {
            expect(runif(0)).toEqualFloatingPointBinary([]);
        });
        it('n=0', () => {
            expect(runif(0)).toEqualFloatingPointBinary([]);
        });
        it('a = Infinite| b = Infinite| a > b', () => {
            const nan1 = runif(1, Infinity);
            // its a Float64Array
            expect(nan1).toEqualFloatingPointBinary(NaN);

            const nan2 = runif(1, 10, Infinity);
            // its a Float64Array
            expect(nan2).toEqualFloatingPointBinary(NaN);

            const nan3 = runif(1, 20, 10);
            // its a Float64Array
            expect(nan3).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'runif',
                    formatter: "argument out of domain in '%s'",
                    args: ['runif']
                },
                {
                    prefix: '',
                    namespace: 'runif',
                    formatter: "argument out of domain in '%s'",
                    args: ['runif']
                },
                {
                    prefix: '',
                    namespace: 'runif',
                    formatter: "argument out of domain in '%s'",
                    args: ['runif']
                }
            ]);
        });

        it('a = Infinite| b = Infinite| a > b', () => {
            const nan1 = runif(1, Infinity);
            // its a Float64Array
            expect(nan1).toEqualFloatingPointBinary(NaN);
            const nan2 = runif(1, 10, Infinity);
            // its a Float64Array
            expect(nan2).toEqualFloatingPointBinary(NaN);
            const nan3 = runif(1, 20, 10);
            // its a Float64Array
            expect(nan3).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'runif',
                    formatter: "argument out of domain in '%s'",
                    args: ['runif']
                },
                {
                    prefix: '',
                    namespace: 'runif',
                    formatter: "argument out of domain in '%s'",
                    args: ['runif']
                },
                {
                    prefix: '',
                    namespace: 'runif',
                    formatter: "argument out of domain in '%s'",
                    args: ['runif']
                }
            ]);
        });
    });
    describe('fidelity', () => {
        beforeEach(() => {
            RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
            globalUni().init(111111);
        });
        it('default input', async () => {
            const [x] = await loadData(resolve(__dirname, 'fixture-generation', 'runif1.R'), /\s+/, 1);
            const ans = runif(30);
            expect(ans).toEqualFloatingPointBinary(x);
        });
    });
});
