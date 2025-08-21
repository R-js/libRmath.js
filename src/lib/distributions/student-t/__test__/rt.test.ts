import { loadData } from '@common/test-helpers/load';
import { resolve } from 'path';
import { globalUni, RNGkind } from '@rng/global-rng';
import { rt } from '..';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('rt (n,df,ncp)', function () {
    describe('invalid input and edge cases', () => {
        describe('ncp = undefined', () => {
            beforeEach(() => {
                RNGkind({ uniform: "MERSENNE_TWISTER", normal: "INVERSION" });
                globalUni().init(123456);
            });
            it('n=NaN', () => {
                expect(() => rt(NaN, 4, 2)).toThrowError('"n=NaN" is not a positive finite number');
            });
            it('df = NaN | df <= 0', () => {
                const nan1 = rt(1, NaN);
                expect(nan1).toEqualFloatingPointBinary(NaN);
                const nan2 = rt(1, -4);
                expect(nan2).toEqualFloatingPointBinary(NaN);
                const stats = getStats();
                expect(stats.rt).toBe(2);
            });
            it('df = Infinity, ncp = undefined', async () => {
                const [expected] = await loadData(resolve(__dirname, 'fixture-generation', 'rt1.R'), /\s+/, 1);
                const actual = rt(50, Infinity);
                expect(actual).toEqualFloatingPointBinary(expected);
            });
        });
        describe('ncp defined', () => {
            beforeEach(() => {
                RNGkind({ uniform: "MERSENNE_TWISTER", normal: "INVERSION" });
                globalUni().init(123456);
            });
            it('ncp=0, n = NaN', () => {
                expect(() => rt(NaN, 4, 2)).toThrowError('"n=NaN" is not a positive finite number');
            });
            it('ncp=0, n = 1, df = NaN', () => {
                const stats = getStats();
                expect(rt(1, NaN, 0)).toEqualFloatingPointBinary(NaN);
                const stats1 = getStats();
                expect(stats1.rchisq).toBe(1);
                expect(stats1.rt - stats.rt).toBe(0);
            });
        });
    });
    describe('fidelity', () => {
        describe('ncp = undefined', () => {
            beforeEach(() => {
                RNGkind({ uniform: "MERSENNE_TWISTER", normal: "INVERSION" });
                globalUni().init(123456);
            });
            it('samples for df = 0.5|df = 5| df=50| df=500', async () => {
                const [y1, y2, y3, y4] = await loadData(resolve(__dirname, 'fixture-generation', 'rt2.R'), /\s+/, 1, 2, 3, 4);
                const actual1 = rt(20, 0.5);
                globalUni().init(123456);
                const actual2 = rt(20, 5);
                globalUni().init(123456);
                const actual3 = rt(20, 50);
                globalUni().init(123456);
                const actual4 = rt(20, 500);
                // 
                expect(actual1).toEqualFloatingPointBinary(y1, 50);
                expect(actual2).toEqualFloatingPointBinary(y2);
                expect(actual3).toEqualFloatingPointBinary(y3);
                expect(actual4).toEqualFloatingPointBinary(y4);
            });
            it('(ncp=0 | ncp=10) n = 10, df = 0.5', () => {
                const resp1 = rt(10, 0.5, 0);
                expect(resp1).toEqualFloatingPointBinary([
                    13.726034413862386430, -6.578338626394375943,
                    -0.652119676794231773, 0.054037011269919118,
                    0.898785291867694625, 6.885293440582267444,
                    2.072102582030028284, 2.281747057421521507,
                    4.376594139569460751, -0.696254987483779231
                ]);
                globalUni().init(123456);
                const resp2 = rt(10, 0.5, 10);
                expect(resp2).toEqualFloatingPointBinary([
                    178.3594554570755975, 231.7260153549004542,
                    17.7173535745771424, 6.2305831844494897,
                    4.8893858248316651, 89.3972457819183148,
                    17.8605671991419612, 11.3990876532059477,
                    41.8400012448266310, 15.6414086902848037,
                ]);

            });
            it('(ncp=20 | ncp=30) n = 10, df = 15', () => {
                const resp1 = rt(10, 15, 20);
                expect(resp1).toEqualFloatingPointBinary([
                    26.566042014626834, 24.864559418881228,
                    16.641071402516136, 17.340982499216615,
                    22.785221513778279, 25.044671673271637,
                    30.021643261264288, 21.064442315213761,
                    25.552059204844547, 22.565316360541186
                ]);
                globalUni().init(123456);
                const resp2 = rt(10, 15, 30);
                expect(resp2).toEqualFloatingPointBinary([
                    39.317497453212511, 37.470835855261534,
                    25.111966266092065, 25.973710990021839,
                    33.024732415364539, 37.065463917487584,
                    44.108100635918028, 30.425316085116116,
                    37.623005665845092, 34.093622911711236
                ]);
            });
        })
    })
});