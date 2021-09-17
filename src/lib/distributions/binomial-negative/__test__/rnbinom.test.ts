import { BoxMuller } from '@rng/normal/box-muller/index.js';
import { globalUni } from '@lib/rng/global-rng.js';
import { SuperDuper } from '@rng/super-duper/index.js';

import { cl, select } from '@common/debug-select.js';

const rnbinomDomainWarns = select('rnbinom')("argument out of domain in '%s'");
const rnbinomMuDomainWarns = select('rnbinom_mu')("argument out of domain in '%s'");
rnbinomDomainWarns;
rnbinomMuDomainWarns;

import { rnbinom } from '../index.js';

describe('rnbinom', function () {
    describe('invalid input', () => {
        expect(() => rnbinom(1, 10, undefined, undefined)).toThrowError('argument "prob" is missing, with no default');
        expect(() => rnbinom(1, 10, 5, 6)).toThrowError('"prob" and "mu" both specified');
    });
    describe('using prob, not "mu" parameter', () => {
        beforeEach(() => {
            cl.clear('rnbinom');
            cl.clear('rnbinom_mu');
            globalUni().init(97865);
        });
        it('n=10, size=4, prob=0.5', () => {
            const r = rnbinom(10, 4, 0.5);
            expect(r).toEqualFloatingPointBinary([4, 8, 3, 5, 4, 3, 6, 4, 2, 5]);
        });
        it('n=10, size=400E+3, prob=0.5', () => {
            const r = rnbinom(10, 400E3, 0.5);
            expect(r).toEqualFloatingPointBinary([
                400308,
                401016,
                399030,
                399988,
                399968,
                400430,
                401002,
                399588,
                398948,
                399601
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
            const un = new SuperDuper(1234);
            const bm = new BoxMuller(un);
            const z = rnbinom(10, 8, 0.2, undefined, bm);
            expect(z).toEqualFloatingPointBinary([
                21, 39, 44, 20, 26, 42, 59, 23, 22, 35
            ]);
        });
    });
    describe('using mu, not "prob" parameter', () => {
        beforeEach(() => {
            cl.clear('rnbinom');
            cl.clear('rnbinom_mu');
        });
        it('n=10, size=8, mu=12 (prob=0.6)', () => {
            const un = new SuperDuper(1234);
            const bm = new BoxMuller(un);
            const z = rnbinom(10, 8, undefined, 12, bm);
            expect(z).toEqualFloatingPointBinary([10, 10, 17, 6, 9, 14, 10, 12, 3, 5]);
        });
        it.todo('(check M.E.)n=1, size=8, mu=NaN', () => {
            const nan = rnbinom(1, 8, undefined, NaN);
            expect(nan).toEqualFloatingPointBinary(NaN);
            //expect(out.length).toBe(1);
        });
        it('n=1, size=8, mu=0', () => {
            const z = rnbinom(1, 8, undefined, 0);
            expect(z).toEqualFloatingPointBinary(0);
        });
    });
});