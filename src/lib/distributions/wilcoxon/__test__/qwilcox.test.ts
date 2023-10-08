import { loadData } from '@common/load';
import { resolve } from 'path';

import { qwilcox } from '..';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('qwilcox', function () {
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
        it('x=NaN|m=NaN|n=NaN', () => {
            const nan1 = qwilcox(NaN, 1, 1);
            const nan2 = qwilcox(0, NaN, 1);
            const nan3 = qwilcox(0, 1, NaN);
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
            expect(nan3).toBeNaN();
        });
        it('x=Inf | m = Inf | n = Inf', () => {
            const nan1 = qwilcox(Infinity, 2, 1);
            const nan2 = qwilcox(0.5, Infinity, 1);
            const nan3 = qwilcox(0.5, 1, Infinity);
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
            expect(nan3).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qwilcox',
                    formatter: "argument out of domain in '%s'",
                    args: ['qwilcox']
                },
                {
                    prefix: '',
                    namespace: 'qwilcox',
                    formatter: "argument out of domain in '%s'",
                    args: ['qwilcox']
                },
                {
                    prefix: '',
                    namespace: 'qwilcox',
                    formatter: "argument out of domain in '%s'",
                    args: ['qwilcox']
                }
            ]);
        });
        it('m <= 0 | n <= 0', () => {
            const nan1 = qwilcox(0.1, -4, 5);
            const nan2 = qwilcox(0.5, 4, -5);
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
            //
            const nan3 = qwilcox(0.1, -4, 5);
            const nan4 = qwilcox(0.5, 4, -5);
            expect(nan3).toBeNaN();
            expect(nan4).toBeNaN();
            //
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qwilcox',
                    formatter: "argument out of domain in '%s'",
                    args: ['qwilcox']
                },
                {
                    prefix: '',
                    namespace: 'qwilcox',
                    formatter: "argument out of domain in '%s'",
                    args: ['qwilcox']
                },
                {
                    prefix: '',
                    namespace: 'qwilcox',
                    formatter: "argument out of domain in '%s'",
                    args: ['qwilcox']
                },
                {
                    prefix: '',
                    namespace: 'qwilcox',
                    formatter: "argument out of domain in '%s'",
                    args: ['qwilcox']
                }
            ]);
        });
        it('q < 0 || q > 1', () => {
            const nan1 = qwilcox(-1, 4, 5);
            const nan2 = qwilcox(1.2, 4, 5);
            expect(nan1).toBeNaN();
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
        it('q = 0 | q = 1', () => {
            const ans1 = qwilcox(0, 4, 5);
            const ans2 = qwilcox(1, 4, 5);
            expect(ans1).toBe(0);
            expect(ans2).toBe(20);
        });
    });
    describe('fidelity', () => {
        it('p=(0,1) qwilcox(p, 10, 10)', async () => {
            const [p, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qwilcox1.R'), /\s+/, 1, 2);
            const answer = p.map((_p) => qwilcox(_p, 10, 10));
            expect(answer).toEqualFloatingPointBinary(y);
        });
    });
});
