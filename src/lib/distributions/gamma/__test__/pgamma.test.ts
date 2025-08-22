import { loadData } from '@common/test-helpers/load';
import { resolve } from 'path';

import { pgamma } from '..';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('pgamma', function () {
    describe('invalid input', () => {
        it('x=NaN, shape=1.6, defaults', () => {
            const z = pgamma(NaN, 1.6);
            expect(z).toBeNaN();
        });
        it('x=0, shape=-5(<0), defaults', () => {
            const nan = pgamma(0, -5);
            expect(nan).toBeNaN();
            const stats = getStats();
            expect(stats.pgamma).toBe(1);
        });
    });
    describe('edge cases', () => {
        it('x=4(>0), shape=0, log=true', () => {
            expect(pgamma(4, 0, undefined, undefined, undefined, true)).toBe(0);
        });
        it('x=0|x=1, shape=0, defaults', () => {
            const z1 = pgamma(0, 0);
            expect(z1).toBe(0);
            const z2 = pgamma(1, 0);
            expect(z2).toBe(1);
        });
        it('x=-1(<0), shape=34', () => {
            const z1 = pgamma(0, 34);
            expect(z1).toBe(0);
        });
        it('x=Infinity, shape=34', () => {
            const z1 = pgamma(Infinity, 34);
            expect(z1).toBe(1);
        });
        it('x=1e-308, shape=1', () => {
            const z = pgamma(1e-308, 1);
            expect(z).toEqualFloatingPointBinary(9.9999999999998657e-309);
        });
    });
    describe('with fixtures', () => {
        describe('region: 0 < x < 1', () => {
            it('0 < x < 1, various shape={5,0.8}, lower=true, log={false,true}', async () => {
                const [p, y1, y2, y3, y4, y5, y6, y7] = await loadData(
                    resolve(__dirname, 'fixture-generation', 'pgamma-region1-1.R'),
                    /\s+/,
                    1,
                    /*y1*/ 2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8
                );
                // lower=true
                const a1 = p.map((_p) => pgamma(_p, 5));
                const a2 = p.map((_p) => pgamma(_p, 5, undefined, undefined, undefined, true));
                const a3 = p.map((_p) => pgamma(_p, 0.8, undefined, undefined, undefined, false));
                const a4 = p.map((_p) => pgamma(_p, 0.8, undefined, undefined, undefined, true));

                // lower=false
                const a5 = p.map((_p) => pgamma(_p, 0.8, undefined, undefined, false, false));
                const a6 = p.map((_p) => pgamma(_p, 0.8, undefined, undefined, false, true));
                const a7 = p.map((_p) => pgamma(_p, 0.4, undefined, undefined, false, true));

                //checks
                expect(a1).toEqualFloatingPointBinary(y1, 49);
                expect(a2).toEqualFloatingPointBinary(y2);
                expect(a3).toEqualFloatingPointBinary(y3);
                expect(a4).toEqualFloatingPointBinary(y4);
                expect(a5).toEqualFloatingPointBinary(y5);
                expect(a6).toEqualFloatingPointBinary(y6, 45);
                expect(a7).toEqualFloatingPointBinary(y7, 45);
            });
        });
        describe('region A: x >=1 && x > shape - 1  && x < 0.8*(shape + 50)', () => {
            it('shape=196, 4 < x < 195, variations: log={true, false}, lower={true,false}', async () => {
                const [p, y1, y2, y3, y4] = await loadData(
                    resolve(__dirname, 'fixture-generation', 'pgamma-region2-1.R'),
                    /\s+/,
                    1,
                    /*y1*/ 2,
                    3,
                    4,
                    5
                );
                const a1 = p.map((_p) => pgamma(_p, 196));
                expect(a1).toEqualFloatingPointBinary(y1, 45);
                const a2 = p.map((_p) => pgamma(_p, 196, undefined, undefined, false));
                expect(a2).toEqualFloatingPointBinary(y2, 45);
                const a3 = p.map((_p) => pgamma(_p, 196, undefined, undefined, false, true));
                expect(a3).toEqualFloatingPointBinary(y3, 45);
                const a4 = p.map((_p) => pgamma(_p, 196, undefined, undefined, true, true));
                expect(a4).toEqualFloatingPointBinary(y4, 45);
            });
        });
        describe('region B: 1 <= x && shape - 1 < x && shape*1.25 -50 < x', () => {
            it('shape={0.5, 1.5} x ∈ [2,10], variations: log={true, false}, lower={true,false}', async () => {
                const [p, y1, y2, y3, y4, y5, y6] = await loadData(
                    resolve(__dirname, 'fixture-generation', 'pgamma-region3-1.R'),
                    /\s+/,
                    1,
                    /*y1*/ 2,
                    3,
                    4,
                    5,
                    6,
                    7
                );
                const a1 = p.map((_p) => pgamma(_p, 0.5));
                const a2 = p.map((_p) => pgamma(_p, 0.5, undefined, undefined, undefined, true));
                expect(a1).toEqualFloatingPointBinary(y1);
                expect(a2).toEqualFloatingPointBinary(y2, 48);

                const a3 = p.map((_p) => pgamma(_p, 1.5));
                expect(a3).toEqualFloatingPointBinary(y3, 48);

                const a4 = p.map((_p) => pgamma(_p, 1.5, undefined, undefined, undefined, true));
                expect(a4).toEqualFloatingPointBinary(y4, 48);
                //lower = false
                const a5 = p.map((_p) => pgamma(_p, 1.5, undefined, undefined, false, true));
                expect(a5).toEqualFloatingPointBinary(y5, 48);
                const a6 = p.map((_p) => pgamma(_p, 1.5, undefined, undefined, false, false));
                expect(a6).toEqualFloatingPointBinary(y6, 48);
            });
            it('shape = 0.5, x=(1-shape)/EPSILON*1.2', () => {
                const z = pgamma((0.5 * 1.2) / Number.EPSILON, 0.5);
                expect(z).toBe(1);
            });
        });
        describe('regionC:1 <= x && (not in region A and region B, aka shape >= 196)', () => {
            it('shape=300(>196) for this shape, x must be ∈ [200,325]', async () => {
                const [x, y1, y2] = await loadData(
                    resolve(__dirname, 'fixture-generation', 'pgamma-region4-1.R'),
                    /\s+/,
                    1,
                    /*y1*/ 2,
                    3,
                    4,
                    5,
                    6,
                    7
                );
                const a1 = x.map((_x) => pgamma(_x, 300));
                expect(a1).toEqualFloatingPointBinary(y1, 44);
                const a2 = x.map((_x) => pgamma(_x, 300, undefined, undefined, false, true));
                expect(a2).toEqualFloatingPointBinary(y2, 35);
            });
        });
    });
});
