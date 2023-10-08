import { dweibull } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('dweibull', function () {
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
        it('x=NaN|shape=NaN|scale=NaN', () => {
            const nan1 = dweibull(NaN, 0.5, 0.5);
            expect(nan1).toBeNaN();
            const nan2 = dweibull(4, NaN, 0.5);
            expect(nan2).toBeNaN();
            const nan3 = dweibull(4, 0.5, NaN);
            expect(nan3).toBeNaN();
        });
        it('shape < 0 | scale < 0', () => {
            const nan1 = dweibull(3, -0.5, 0.5);
            expect(nan1).toBeNaN();
            const nan2 = dweibull(4, 0.5, -0.5);
            expect(nan2).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'dweibull',
                    formatter: "argument out of domain in '%s'",
                    args: ['dweibull']
                },
                {
                    prefix: '',
                    namespace: 'dweibull',
                    formatter: "argument out of domain in '%s'",
                    args: ['dweibull']
                }
            ]);
        });
        it('x < 0', () => {
            const zero = dweibull(-3, 0.5, 0.5);
            expect(zero).toBe(0);
        });
        it('x = Infinite', () => {
            const zero = dweibull(Infinity, 0.5, 0.5);
            expect(zero).toBe(0);
            const inf = dweibull(Infinity, 0.5, 0.5, true);
            expect(inf).toBe(-Infinity);
        });
        it('x == 0 && shape < 1', () => {
            const inf = dweibull(0, 0.5, 0.5);
            expect(inf).toBe(Infinity);
        });
    });

    describe('fidelity', () => {
        it('x=34, shape=23.9, scale=45', () => {
            const ans = dweibull(34, 23.9, 45);
            expect(ans).toEqualFloatingPointBinary(0.00086487038258106698);
        });
        it('x=22, shape=0.123, scale= 10, givelog=true', () => {
            const ans = dweibull(22, 0.123, 10, true);
            expect(ans).toEqualFloatingPointBinary(-6.1914717396038341);
        });
    });
});
