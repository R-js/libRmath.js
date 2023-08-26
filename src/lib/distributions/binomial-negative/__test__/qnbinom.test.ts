import { register, unRegister } from '@mangos/debug-frontend';

//mocks
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

import { qnbinom } from '..';

describe('qnbinom', function () {
    describe('invalid input', () => {
        expect(() => qnbinom(1, 10, undefined, undefined)).toThrowError('argument "prob" is missing, with no default');
        expect(() => qnbinom(1, 10, 5, 6)).toThrowError('"prob" and "mu" both specified');
    });
    describe('using prob, not "mu" parameter', () => {
        const logs: MockLogs[] = [];
        beforeEach(() => {
            const backend = createBackEndMock(logs);
            register(backend);
        });
        afterEach(() => {
            unRegister();
            logs.splice(0);
        });
        it('p=NaN, prob=0.5, size=10', () => {
            const nan = qnbinom(NaN, 10, 0.5);
            expect(nan).toBeNaN();
        });
        it('p=1, prob=NaN, size=10', () => {
            const nan = qnbinom(1, 10, NaN);
            expect(nan).toBeNaN();
        });
        it('p=1, prob=0.5, size=NaN', () => {
            const nan = qnbinom(1, NaN, 0.5);
            expect(nan).toBeNaN();
        });
        it('p=1, prob=0, size=0', () => {
            const z = qnbinom(1, 0, 0);
            expect(z).toBe(0);
        });
        it('p=0.5, prob=-1(<0), size=0', () => {
            const nan = qnbinom(0.5, 4, -1);
            expect(nan).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qnbinom',
                    formatter: "argument out of domain in '%s'",
                    args: ['qnbinom']
                }
            ]);
        });
        it('p=1, prob=0.3, size=-4', () => {
            const nan = qnbinom(1, -4, 0.3);
            expect(nan).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qnbinom',
                    formatter: "argument out of domain in '%s'",
                    args: ['qnbinom']
                }
            ]);
        });
        it('p=1, prob=1, size=4', () => {
            const z = qnbinom(1, 4, 1);
            expect(z).toBe(0);
        });
        it('p=1, prob=0.5, size=0', () => {
            const z = qnbinom(1, 0, 0.5);
            expect(z).toBe(0);
        });
        it('p=1, prob=0.3, size=5', () => {
            const inf = qnbinom(1, 5, 0.3);
            expect(inf).toBe(Infinity);
        });
        it('p=0.8, prob=0.3, size=5', () => {
            const z = qnbinom(0.8, 5, 0.3);
            expect(z).toBe(16);
        });
        it('p=0.8, prob=0.3, size=5, lower=false', () => {
            const z = qnbinom(0.8, 5, 0.3, undefined, false);
            expect(z).toBe(6);
        });
        it('p=log(1), prob=0.3, size=5, lower=true, log.p=true', () => {
            const z = qnbinom(0, 5, 0.3, undefined, true, true);
            expect(z).toBe(Infinity);
        });
        it('p=log(1), prob=0.3, size=5, lower=false, log.p=true', () => {
            const z = qnbinom(0, 5, 0.3, undefined, false, true);
            expect(z).toBe(0);
        });
        it('p=1-epsilon/2, prob=0.3, size=5', () => {
            const z = qnbinom(1 - Number.EPSILON / 2, 5, 0.3);
            expect(z).toBe(Infinity);
        });
        it('p=0.8, prob=0.0003, size=50', () => {
            const z = qnbinom(0.8, 50, 0.0003);
            expect(z).toBe(186128);
        });
    });
    describe('using mu, not "prob" parameter', () => {
        it('p=0.8, size=500, mu=600, (prob=0.5454545454545454)', () => {
            const z = qnbinom(0.8, 500, undefined, 600);
            expect(z).toBe(630);
        });
    });
});
