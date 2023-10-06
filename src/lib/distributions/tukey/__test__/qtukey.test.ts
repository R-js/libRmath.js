import { qtukey } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('qtukey', function () {
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
        it('p=Nan|nmeans=NaN|df=NaN|ranges=NaN', () => {
            const nan1 = qtukey(NaN, 4, 3, 2);
            const nan2 = qtukey(0.9, NaN, 3, 2);
            const nan3 = qtukey(0.9, 4, NaN);
            const nan4 = qtukey(0.9, 4, 3, NaN);
            expect([nan1, nan2, nan3, nan4]).toEqualFloatingPointBinary(NaN);
        });
        it('df < 2 | ranges < 1 | nmeans < 2', () => {
            const nan1 = qtukey(0.9, 4, 1, 2);
            const nan2 = qtukey(0.9, 4, 2, 0);
            const nan3 = qtukey(0.9, 1, 2, 0);
            expect([nan1, nan2, nan3]).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qtukey',
                    formatter: "argument out of domain in '%s'",
                    args: ['qtukey']
                },
                {
                    prefix: '',
                    namespace: 'qtukey',
                    formatter: "argument out of domain in '%s'",
                    args: ['qtukey']
                },
                {
                    prefix: '',
                    namespace: 'qtukey',
                    formatter: "argument out of domain in '%s'",
                    args: ['qtukey']
                }
            ]);
        });
        it('p > 1 | p < 0', () => {
            const nan1 = qtukey(-1, 4, 2);
            const nan2 = qtukey(1.2, 4, 2);
            expect([nan1, nan2]).toEqualFloatingPointBinary(NaN);
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
        it('p =0  | p = 1', () => {
            const b1 = qtukey(0, 4, 2);
            const b2 = qtukey(1, 4, 2);
            expect(b1).toBe(0);
            expect(b2).toBe(Infinity);
        });
    });
    describe('fidelity', () => {
        it('p=0.01,nmeans=2,df=2,nranges=1,lower_tail=true,log_p=false', () => {
            const ans = qtukey(0.01, 2, 2, 1, true, false);
            expect(ans).toEqualFloatingPointBinary(0.020000480186752309, 51);
        });
        it('p=0.01,nmeans=4,df=2,nranges=1,lower_tail=true,log_p=false', () => {
            const ans = qtukey(0.01, 4, 2, 1, true, false);
            expect(ans).toEqualFloatingPointBinary(0.3994104987821519);
        });
        it('p=0.01,nmeans=4,df=2,nranges=1,lower_tail=true,log_p=false', () => {
            const ans = qtukey(0.01, 4, 2, 1, true, false);
            expect(ans).toEqualFloatingPointBinary(0.3994104987821519);
        });

        it('p=0.02,nmeans=4,df=2,nranges=1,lower_tail=true,log_p=false', () => {
            const ans = qtukey(0.02, 4, 2, 1, true, false);
            expect(ans).toEqualFloatingPointBinary(0.51073597468881515);
        });

        it('p=0.01,nmeans=62,df=2,nranges=1,lower_tail=true,log_p=false', () => {
            const nan = qtukey(0.01, 62, 2, 1, true, false);
            expect(nan).toBe(NaN);
        });

        it('p=0.01,nmeans=72,df=8,nranges=1,lower_tail=true,log_p=false', () => {
            const nan = qtukey(0.01, 72, 8, 1, true, false);
            expect(nan).toBe(NaN);
        });

        it('p=0.9 means=3, df=2', () => {
            const ans = qtukey(0.9, 3, 2);
            expect(ans).toEqualFloatingPointBinary(5.732649, 24);
        });
    });
});
