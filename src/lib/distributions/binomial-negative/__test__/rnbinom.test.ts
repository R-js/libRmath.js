import { globalUni, RNGkind, setSeed } from '@rng/global-rng';

import { rnbinom } from '..';

import { createObjectLogHarnas } from '@common/debug-backend';


describe('rnbinom', function () {
    it('invalid input', () => {
        expect(() => rnbinom(1, 10, undefined, undefined)).toThrowError('argument "prob" is missing, with no default');
        expect(() => rnbinom(1, 10, 5, 6)).toThrowError('"prob" and "mu" both specified');
    });
    describe('using prob, not "mu" parameter', () => {
        beforeEach(() => {
            globalUni().init(97865);
        })
        it('n=10, size=4, prob=0.5', () => {
            const r = rnbinom(10, 4, 0.5);
            expect(r).toEqualFloatingPointBinary([4, 8, 3, 5, 4, 3, 6, 4, 2, 5]);
        });
        it('n=10, size=400E+3, prob=0.5', () => {
            const r = rnbinom(10, 400e3, 0.5);
            expect(r).toEqualFloatingPointBinary([
                400308, 401016, 399030, 399988, 399968, 400430, 401002, 399588, 398948, 399601
            ]);
        });
        it('n=1, size=Infinity, prob=0.5', () => {
            const nan = rnbinom(10, Infinity, 0.5);
            expect(nan).toEqualFloatingPointBinary(NaN);
        });
        it('n=1, size=1, prob=1', () => {
            const z = rnbinom(2, 1, 1);
            expect(z).toEqualFloatingPointBinary(0);
        });
        it('n=1, size=1, prob=1', () => {
            RNGkind({ uniform: 'SUPER_DUPER', normal: 'BOX_MULLER' });
            setSeed(1234);
            const z = rnbinom(10, 8, 0.2, undefined);
            expect(z).toEqualFloatingPointBinary([21, 39, 44, 20, 26, 42, 59, 23, 22, 35]);
        });
    });
    describe('using mu, not "prob" parameter', () => {
        it('n=10, size=8, mu=12 (prob=0.6)', () => {
            RNGkind({ uniform: 'SUPER_DUPER', normal: 'BOX_MULLER' });
            setSeed(1234);
            const z = rnbinom(10, 8, undefined, 12);
            expect(z).toEqualFloatingPointBinary([10, 10, 17, 6, 9, 14, 10, 12, 3, 5]);
        });
        it('(check M.E.)n=1, size=8, mu=NaN', () => {
            const { getStats } = createObjectLogHarnas();
            const nan = rnbinom(1, 8, undefined, NaN);
            const stats = getStats();
            expect(stats.rnbinom_mu).toBe(1);
            expect(nan).toEqualFloatingPointBinary(NaN);
        });
        it('n=1, size=8, mu=0', () => {
            const z = rnbinom(1, 8, undefined, 0);
            expect(z).toEqualFloatingPointBinary(0);
        });
    });
});
