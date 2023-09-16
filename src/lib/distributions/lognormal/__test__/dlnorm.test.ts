import { loadData } from '@common/load';
import { resolve } from 'path';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';
import { dlnorm } from '..';

describe('dlnorm', () => {
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
        it('x=NaN | meanLog=NaN | sdLog=NaN, giveLog=false', () => {
            // fx: number, meanlog: number, sdlog: number, give_log: boolean
            const nan1 = dlnorm(NaN);
            expect(nan1).toBe(NaN);
            const nan2 = dlnorm(1, NaN);
            expect(nan2).toBe(NaN);
            const nan3 = dlnorm(1, undefined, NaN);
            expect(nan3).toBe(NaN);
        });
        it('sdLob = 0 and ln(y) != meanLog', () => {
            const zero = dlnorm(0.5, 0, 0, false);
            expect(zero).toBe(0);
            const negInf = dlnorm(0.5, 0, 0, true);
            expect(negInf).toBe(-Infinity);
        });
        it('sdLob = 0 and ln(y) == meanLog', () => {
            const infinity = dlnorm(1, 0, 0, false);
            expect(infinity).toBe(Infinity);
            const infinity2 = dlnorm(1, 0, 0, true);
            expect(infinity2).toBe(Infinity);
        });
        it('sdLob < 0', () => {
            const nan = dlnorm(1, 0, -1, false);
            expect(nan).toBe(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'dlnorm',
                    formatter: "argument out of domain in '%s'",
                    args: ['dlnorm']
                }
            ]);
        });
        it('x < 0', () => {
            const zero = dlnorm(-1, 0, 1, false);
            expect(zero).toBe(0);
            const negInf = dlnorm(-1, 0, 1, true);
            expect(negInf).toBe(-Infinity);
        });
    });
    describe('fidelity', () => {
        it('x = [0,100, step 1], mhu=4, sd=8', async () => {
            const [x, y1, y2] = await loadData(resolve(__dirname, 'fixture-generation', 'dlnorm.R'), /\s+/, 1, 2, 3);
            const actual1 = x.map((_x) => dlnorm(_x, 4, 8));
            const actual2 = x.map((_x) => dlnorm(_x, 4, 8, true));
            expect(actual1).toEqualFloatingPointBinary(y1);
            expect(actual2).toEqualFloatingPointBinary(y2, 51);
        });
    });
});
