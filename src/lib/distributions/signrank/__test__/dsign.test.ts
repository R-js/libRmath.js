import { loadData } from '@common/load';
import { resolve } from 'path';

import { dsignrank, useWasmBackendSignRank, clearBackendSignRank } from '..';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_v, i) => i + a);
import { ms } from './test-helpers';

describe('dsignrank (wilcox sign rank)', function () {
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
        it('x = NaN | n = NaN', () => {
            const nan1 = dsignrank(NaN, 2);
            expect(nan1).toBeNaN();
            const nan2 = dsignrank(3, NaN);
            expect(nan2).toBeNaN();
        });
        it('n <= 0', () => {
            const nan1 = dsignrank(6, -1);
            expect(nan1).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'dsignrank',
                    formatter: "argument out of domain in '%s'",
                    args: ['dsignrank']
                }
            ]);
        });
        it('trunc(x)-x < 1e7 and trunc(x)-x > 1e7', () => {
            const zero = dsignrank(3 + 2e-7, 4);
            expect(zero).toBe(0);
            const x = dsignrank(3 + 1e-7 / 2, 4);
            expect(x).toEqualFloatingPointBinary(0.12500000000000003);
        });
        it('x < 0 or x > n*(n+1)/2', () => {
            const zero1 = dsignrank(-1, 4);
            expect(zero1).toBe(0);
            const zero2 = dsignrank((4 * (4 + 1)) / 2 + 1, 4);
            expect(zero2).toBe(0);
        });
        it.todo('run over all W+ for n=1 and n=2');
    });
    describe('fidelity', () => {
        it('for n = 3 calculate  0 < w < n*(n+1)/2 for n lambda = 0', () => {
            const x = range(0, 6);
            const result = x.map((_x) => dsignrank(_x, 3));
            expect(result).toEqualFloatingPointBinary([
                0.12500000000000003, 0.12500000000000003, 0.12500000000000003, 0.25000000000000006, 0.12500000000000003,
                0.12500000000000003, 0.12500000000000003
            ]);
        });
        it('for n = 10 all W+', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dsign1.R'), /\s+/, 1, 2);
            const result = x.map((_x) => dsignrank(_x, 10));
            expect(result).toEqualFloatingPointBinary(y, 50);
        });
        it('for n = 10 check for W=24 and W=31', () => {
            const res1 = dsignrank(24, 10);
            const res2 = dsignrank(31, 10);
            expect(res1).toEqualFloatingPointBinary(0.037109375);
            expect(res2).toEqualFloatingPointBinary(0.037109375);
        });
        it('wasm acc test large inputnumbers n = 4000, W= 4025500', () => {
            // according to large sample approximation
            //         W+ - 0.25*n*(n+1)
            // Z(W,n)= -----------------
            //         sqrt(n*(n+1)*(2*n+1)/24)
            // Z(4025500, 4000)= 0 gives 0.2561791 pnorm(z) = 0.6010937
            // R gives Inf, so does this algo
            useWasmBackendSignRank();
            const start = Date.now();
            const res = dsignrank(4025500, 4000);
            expect(res).toEqual(Infinity);
            console.log(`dsign (wasm) duration: ${ms(Date.now() - start)}`);
            clearBackendSignRank();
        });
        it('(no wasm) test large inputnumbers n = 4000, W= 4025500', () => {
            const start = Date.now();
            const res = dsignrank(4025500, 4000);
            expect(res).toEqual(Infinity);
            console.log(`dsign: (no wasm) duration: ${ms(Date.now() - start)}`);
        });
        it.todo('check why [0.037109375] differs [0.037109374999999993] is only 3 mantissa bits, should be more');
    });
});
