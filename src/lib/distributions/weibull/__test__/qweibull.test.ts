import { qweibull } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('qweibull', function () {
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
        it('p=NaN|shape=NaN|scale=NaN', () => {
            const nan1 = qweibull(NaN, 0.5);
            expect(nan1).toBeNaN();
            const nan2 = qweibull(4, NaN, 0.5);
            expect(nan2).toBeNaN();
            const nan3 = qweibull(4, 0.5, NaN);
            expect(nan3).toBeNaN();
        });
        it('shape <= 0 | scale <= 0', () => {
            const nan1 = qweibull(3, -0.5, 0.5);
            expect(nan1).toBeNaN();
            const nan2 = qweibull(4, 0.5, -0.5);
            expect(nan2).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qweibull',
                    formatter: "argument out of domain in '%s'",
                    args: ['qweibull']
                },
                {
                    prefix: '',
                    namespace: 'qweibull',
                    formatter: "argument out of domain in '%s'",
                    args: ['qweibull']
                }
            ]);
        });
        it('p < 0 | p > 1.2', () => {
            const nan1 = qweibull(-0.2, 0.5, 0.5);
            expect(nan1).toBeNaN();
            const nan2 = qweibull(1.2, 0.5, 0.5);
            expect(nan2).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'R_Q_P01_boundaries',
                    formatter: "argument out of domain in '%s'",
                    args: ['R_Q_P01_boundaries']
                },
                {
                    prefix: '',
                    namespace: 'R_Q_P01_boundaries',
                    formatter: "argument out of domain in '%s'",
                    args: ['R_Q_P01_boundaries']
                }
            ]);
        });
        it('p=1|p = 1', () => {
            const zero1 = qweibull(0, 0.5, 0.5);
            expect(zero1).toBe(0);
            const inf = qweibull(1, 0.5, 0.5);
            expect(inf).toBe(Infinity);
        });
    });

    describe('fidelity', () => {
        it('p=0.567, shape=23.9, scale=45', () => {
            const ans = qweibull(0.567, 23.9, 45);
            expect(ans).toEqualFloatingPointBinary(44.666266249645645);
        });
    });
});
