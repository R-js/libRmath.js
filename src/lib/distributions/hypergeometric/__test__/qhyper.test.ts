import { loadData } from '@common/load';
import { resolve } from 'node:path';
import { qhyper, useWasmBackendHyperGeom, clearBackendHyperGeom } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

/**
 * function qhyper(p, m, n, k, lower.tail = TRUE, log.p = FALSE)
 * p            = vector of probailities
 * m            = number of white balls in the population
 * n            = number of black balls in the population
 * k            = total number of balls drawn (k-x)=number of non-white balls
 * lower.tail   =  if TRUE (default), probabilities are P[X <= x], otherwise, P[X > x].
 * log.p        =  probabilities as log(p);
 *
 * return descrete quantile
 */

describe('qhyper(p,m,n,k,log)', function () {
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
        it('test inputs p, nr, ,b, n on NaN', () => {
            const nan1 = qhyper(NaN, 0, 0, 0);
            const nan2 = qhyper(0, NaN, 0, 0);
            const nan3 = qhyper(0, 0, NaN, 0);
            const nan4 = qhyper(0, 0, 0, NaN);
            expect([nan1, nan2, nan3, nan4]).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([]);
        });
        it('test inputs p,nr, nb, n on infinity', () => {
            const I = Infinity;
            const nan1 = qhyper(I, 0, 0, 0);
            const nan2 = qhyper(0, I, 0, 0);
            const nan3 = qhyper(0, 0, I, 0);
            const nan4 = qhyper(0, 0, 0, I);
            expect([nan1, nan2, nan3, nan4]).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qhyper',
                    formatter: "argument out of domain in '%s'",
                    args: ['qhyper']
                },
                {
                    prefix: '',
                    namespace: 'qhyper',
                    formatter: "argument out of domain in '%s'",
                    args: ['qhyper']
                },
                {
                    prefix: '',
                    namespace: 'qhyper',
                    formatter: "argument out of domain in '%s'",
                    args: ['qhyper']
                },
                {
                    prefix: '',
                    namespace: 'qhyper',
                    formatter: "argument out of domain in '%s'",
                    args: ['qhyper']
                }
            ]);
        });
        it('test inputs nr < 0, nb <0, n <0 n > (nb+nr)', () => {
            const nan1 = qhyper(0.1, -1, 0, 0);
            const nan2 = qhyper(0.1, 0, -1, 0);
            const nan3 = qhyper(0.1, 0, 0, -1);
            const nan4 = qhyper(0.1, 0, 0, 2);
            expect([nan1, nan2, nan3, nan4]).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qhyper',
                    formatter: "argument out of domain in '%s'",
                    args: ['qhyper']
                },
                {
                    prefix: '',
                    namespace: 'qhyper',
                    formatter: "argument out of domain in '%s'",
                    args: ['qhyper']
                },
                {
                    prefix: '',
                    namespace: 'qhyper',
                    formatter: "argument out of domain in '%s'",
                    args: ['qhyper']
                },
                {
                    prefix: '',
                    namespace: 'qhyper',
                    formatter: "argument out of domain in '%s'",
                    args: ['qhyper']
                }
            ]);
        });
        it('p < 0 || p > 1', () => {
            const nan1 = qhyper(-1, 2, 3, 2);
            const nan2 = qhyper(1.21, 2, 3, 2);
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
    });
    describe('edge cases', () => {
        it('(p=1 and p=1, m=300 n=150, k=400', () => {
            // the minimum output is Max(0,  (nn-nb) )
            // the maximum output is min(nn, nr)
            // xstart = max(0, 400-150) = 250, so p=0 will output 250
            // xstop = min(400, 300) = 300, so if p=1 will output 300
            const z2 = qhyper(0, 300, 150, 400);
            const z3 = qhyper(1, 300, 150, 400);
            expect(z2).toBe(250);
            expect(z3).toBe(300);
        });
    });
    describe('with fixtures', () => {
        it('p ∈ [0,1], m=300, n=150, k=400 (k < 1000, "small"), lower={true|false}, log={true|false}', async () => {
            const [p, y1, y2, y3, y4] = await loadData(
                resolve(__dirname, 'fixture-generation', 'qhyper.R'),
                /\s+/,
                1,
                2,
                3,
                4,
                5
            );
            // log.p = false
            const a1 = p.map((_p) => qhyper(_p, 300, 150, 400));
            const a2 = p.map((_p) => qhyper(_p, 300, 150, 400, false));
            // log.p = true
            const a3 = p.map((_p) => qhyper(Math.log(_p), 300, 150, 400, true, true));
            const a4 = p.map((_p) => qhyper(Math.log(_p), 300, 150, 400, false, true));
            expect(a1).toEqualFloatingPointBinary(y1, 45);
            expect(a2).toEqualFloatingPointBinary(y2, 45);
            expect(a3).toEqualFloatingPointBinary(y3, 45);
            expect(a4).toEqualFloatingPointBinary(y4, 45);
        });
        it('p ∈ [0,1], m=1300, n=150, k=1400 (k >= 1000, "big"), lower={true|false}, log={true|false}', async () => {
            const [p, y1, y2, y3, y4] = await loadData(
                resolve(__dirname, 'fixture-generation', 'qhyper2.R'),
                /\s+/,
                1,
                2,
                3,
                4,
                5
            );

            const m = 1300;
            const n = 150;
            const k = 1400;

            // log.p = false
            const a1 = p.map((_p) => qhyper(_p, m, n, k));
            const a2 = p.map((_p) => qhyper(_p, m, n, k, false));
            // log.p = true
            const a3 = p.map((_p) => qhyper(Math.log(_p), m, n, k, true, true));
            const a4 = p.map((_p) => qhyper(Math.log(_p), m, n, k, false, true));
            expect(a1).toEqualFloatingPointBinary(y1, 45);
            expect(a2).toEqualFloatingPointBinary(y2, 45);
            expect(a3).toEqualFloatingPointBinary(y3, 45);
            expect(a4).toEqualFloatingPointBinary(y4, 45);
        });
    });
    describe('wasm accelerator test', () => {
        it('js & wasm-accelerated test, n=1, nr=2**31-1, nb=2**31-1, n=2**31-1', () => {
            clearBackendHyperGeom();
            const t0 = Date.now();
            const result1 = qhyper(0.5, 2 ** 31 - 1, 2 ** 31 - 1, 2 ** 31 - 1);
            const t1 = Date.now();
            console.log('qhyper: (non wasm) duration: %s sec', Math.round((t1 - t0) / 10) / 100);
            console.log('qhyper: (non wasm) duration: %s ms', t1 - t0);
            expect(result1).toBe(1073741806);
            // initialize wasm
            useWasmBackendHyperGeom();
            const t2 = Date.now();
            const result = qhyper(0.5, 2 ** 31 - 1, 2 ** 31 - 1, 2 ** 31 - 1);
            const t3 = Date.now();
            console.log('qhyper: (wasm) duration: %s sec', Math.round((t3 - t2) / 10) / 100);
            console.log('qhyper: (wasm) duration: %s ms', t3 - t2);
            clearBackendHyperGeom();
            expect(result).toBe(1073741806);
        });
    });
});
