import { loadData } from '@common/load';
import { resolve } from 'path';
import { qgamma } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('qgamma', function () {
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
        it('p=NaN, shape=1.6, defaults', () => {
            const z = qgamma(NaN, 1.6);
            expect(z).toBeNaN();
        });
        it('p=0.5, shape<0 or scale<0, defaults', () => {
            const nan = qgamma(0.5, -5);
            const nan2 = qgamma(0.5, 2, -3);
            expect(nan).toBeNaN();
            expect(nan2).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qgamma',
                    formatter: "argument out of domain in '%s'",
                    args: ['qgamma']
                },
                {
                    prefix: '',
                    namespace: 'qgamma',
                    formatter: "argument out of domain in '%s'",
                    args: ['qgamma']
                }
            ]);
        });
        it('p=-2 shape=1.6, defaults', () => {
            const nan = qgamma(-2, 1.6);
            expect(nan).toBe(nan);
            expect(logs).toEqual([
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
        it('p=0 or p=1, shape=1.6, defaults', () => {
            const z = qgamma(0, 1.6);
            expect(z).toBe(0);
            const inf = qgamma(1, 1.6);
            expect(inf).toBe(Infinity);
        });
        it('shape=0, p=0.5 (0,1) defaults', () => {
            const z = qgamma(0.5, 0);
            expect(z).toBe(0);
        });
        it('shape<1e-10, p=0.9 (0,1) defaults', () => {
            const z = qgamma(0.9, 0.5e-10);
            expect(z).toBe(0);
        });
        it('shape=5, (1 - 1e-14) < p < 1, defaults', () => {
            const z = qgamma(1 - 0.5e-14, 5);
            expect(z).toEqualFloatingPointBinary(45.076173899165994);
        });
        it('shape=1e9 (shape high because p<<<1 and need to skip some checks), 0 < p < 1e-100, defaults', () => {
            const z = qgamma(0.5e-100, 1e9);
            expect(z).toEqualFloatingPointBinary(999326397.98956001);
        });
    });
    describe('with fixtures', () => {
        it('0 < p < 1, various shape={9}, lower={false,true}, log={false,true}', async () => {
            const [p, y1, y2] = await loadData(
                resolve(__dirname, 'fixture-generation', 'qgamma1.R'),
                /\s+/,
                1,
                /*y1*/ 2,
                3,
                4
            );
            const a1 = p.map((_p) => qgamma(_p, 9));
            expect(a1).toEqualFloatingPointBinary(y1, 45);

            const a2 = p.map((_p) => qgamma(_p, 9, undefined, undefined, false));
            expect(a2).toEqualFloatingPointBinary(y2, 45);

            const a3 = p.map((_p) => qgamma(Math.log(_p), 9, undefined, undefined, false, true));
            expect(a3).toEqualFloatingPointBinary(y2, 45);
        });
    });
});
