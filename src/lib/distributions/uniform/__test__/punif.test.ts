import { punif } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('punif', function () {
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
        it('x=Nan|min=NaN|max=NaN', () => {
            // dunif(x: number, min = 0, max = 1, logP = false):
            const nan1 = punif(NaN, 4, 3);
            const nan2 = punif(0.9, NaN, 3);
            const nan3 = punif(0.9, 4, NaN);
            expect([nan1, nan2, nan3]).toEqualFloatingPointBinary(NaN);
        });
        it('x < min=(0) | x > max=(1)', () => {
            const zero1 = punif(-0.9);
            expect(zero1).toBe(0);
            const one1 = punif(1.2);
            expect(one1).toBe(1);
        });
        it('x = min | x = max', () => {
            const ans1 = punif(4, 4, 9);
            expect(ans1).toBe(0);
            const ans2 = punif(9, 4, 9);
            expect(ans2).toBe(1);
        });
        it('min >= max', () => {
            const nan1 = punif(4, 9, 4);
            expect(nan1).toBeNaN();
            const nan2 = punif(4, 9, 9);
            expect(nan2).toBe(0);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'punif',
                    formatter: "argument out of domain in '%s'",
                    args: ['punif']
                }
            ]);
        });
        it('min = Infinity | max = Infinity', () => {
            const nan1 = punif(4, Infinity, 4);
            expect(nan1).toBeNaN();
            const nan2 = punif(4, 9, Infinity);
            expect(nan2).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'punif',
                    formatter: "argument out of domain in '%s'",
                    args: ['punif']
                },
                {
                    prefix: '',
                    namespace: 'punif',
                    formatter: "argument out of domain in '%s'",
                    args: ['punif']
                }
            ]);
        });
    });
    describe('fidelity', () => {
        //
        it('x = 9, a=10, b=11, lowerTail=false|log=true', () => {
            const zero = punif(9, 10, 11, false, true);
            expect(zero).toBe(zero);
        });
        it('4 < x < 4.001, lowerTail=false, giveLog=True', () => {
            const ans = punif(4.00001, 4, 4.001, false, true);
            expect(ans).toEqualFloatingPointBinary(-0.010050335853115676, 35);
        });
        it('4 < x < 4.001, lowerTail=true, giveLog=True', () => {
            const ans = punif(4.00001, 4, 4.001, true, true);
            expect(ans).toEqualFloatingPointBinary(-4.6051701860262826, 37);
        });
    });
});
