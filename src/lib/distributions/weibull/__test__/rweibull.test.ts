import { rweibullOne } from '../rweibull';
import { rweibull } from '..';

import { RNGkind, setSeed } from '@rng/global-rng';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('rweibull', function () {
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
        it('shape=NaN|scale=NaN', () => {
            const nan1 = rweibullOne(NaN, 0.5);
            expect(nan1).toBeNaN();
            const nan2 = rweibullOne(4, NaN);
            expect(nan2).toBeNaN();
        });
        it('shape <= 0 | scale <= 0', () => {
            const nan1 = rweibullOne(3, -0.5);
            expect(nan1).toBeNaN();
            const nan2 = rweibullOne(-4, 0.5);
            expect(nan2).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'rweibull',
                    formatter: "argument out of domain in '%s'",
                    args: ['rweibull']
                },
                {
                    prefix: '',
                    namespace: 'rweibull',
                    formatter: "argument out of domain in '%s'",
                    args: ['rweibull']
                }
            ]);
        });
        it('shape <= 0 | scale = 0', () => {
            const zero = rweibullOne(-3, 0);
            expect(zero).toBe(0);
        });
    });

    describe('fidelity', () => {
        beforeEach(() => {
            RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
            setSeed(111_111);
        });
        it('n=10, scale=0.5, shape=4', () => {
            const ans = rweibull(10, 4, 0.5);
            /*
            > set.seed(111111)
            > x=rweibull(10,4,0.5);
            > data.frame(x)

            */
            expect(ans).toEqualFloatingPointBinary(
                [
                    0.398435704026611937, 0.443965176838183928, 0.063657754510879225, 0.460309561235067666,
                    0.216327263228885708, 0.418756289335991294, 0.454827509456368295, 0.496260623621667896,
                    0.417812433744034151, 0.332115242278925915
                ],
                51
            );
        });
    });
});
