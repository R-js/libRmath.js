import { qunif } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('qunif', function () {
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
        it('p=Nan|a=NaN|b=NaN', () => {
            // qunif(p: number, a = 0, b = 1, lowerTail = true, logP = false)
            const nan1 = qunif(NaN, 4, 3);
            expect(nan1).toBeNaN();
            const nan2 = qunif(0.9, NaN, 3);
            expect(nan2).toBeNaN();
            const nan3 = qunif(0.9, 4, NaN);
            expect(nan3).toBeNaN();
        });
        it('x < min=(0) | x > max=(1)', () => {
            const nan1 = qunif(-0.9);
            expect(nan1).toBeNaN();
            const nan2 = qunif(1.2);
            expect(nan2).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'R_Q_P01_check',
                    formatter: "argument out of domain in '%s'",
                    args: ['R_Q_P01_check']
                },
                {
                    prefix: '',
                    namespace: 'R_Q_P01_check',
                    formatter: "argument out of domain in '%s'",
                    args: ['R_Q_P01_check']
                }
            ]);
        });
        it('min=Infinity|max=Infinity', () => {
            const nan1 = qunif(0.9, Infinity);
            expect(nan1).toBeNaN();
            const nan2 = qunif(0.9, 0, Infinity);
            expect(nan2).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qunif',
                    formatter: "argument out of domain in '%s'",
                    args: ['qunif']
                },
                {
                    prefix: '',
                    namespace: 'qunif',
                    formatter: "argument out of domain in '%s'",
                    args: ['qunif']
                }
            ]);
        });
        it('min > max', () => {
            const nan1 = qunif(0.9, 10, 4);
            expect(nan1).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qunif',
                    formatter: "argument out of domain in '%s'",
                    args: ['qunif']
                }
            ]);
        });
        it('min = max', () => {
            const ans = qunif(0.9, 4, 4);
            expect(ans).toBe(4);
        });
    });
    describe('fidelity', () => {
        it('p=log(0.8), min=11, max=11.5 lowerTail=false, pAslog=true', () => {
            const ans = qunif(Math.log(0.8), 11, 11.5, false, true);
            expect(ans).toBe(11.1);
        });
    });
});
