import { resolve } from 'path';

import { pnbinom } from '..';

//helper
import { loadData } from '@common/load';

import { prob2mu } from './test-helpers';

import { createLogHarnas } from '@common/debug-backend';

const { getStats } = createLogHarnas();

describe('pnbinom', function () {
    describe('invalid input', () => {
        expect(() => pnbinom(1, 10, undefined, undefined)).toThrowError('argument "prob" is missing, with no default');
        expect(() => pnbinom(1, 10, 5, 6)).toThrowError('"prob" and "mu" both specified');
    });
    describe('using prob, not "mu" parameter', () => {
        it('x=NaN, prob=0.5, size=10', () => {
            const nan = pnbinom(NaN, 10, 0.5);
            expect(nan).toBeNaN();
        });
        it('x=10, prob=NaN, size=20', () => {
            const nan = pnbinom(10, 20, NaN);
            expect(nan).toBeNaN();
        });
        it('x=10, prob=0.3, size=NaN', () => {
            const nan = pnbinom(10, NaN, 0.3);
            expect(nan).toBeNaN();
        });
        it('x=10, prob=Infinity, size=30', () => {
            const nan = pnbinom(10, 30, Infinity);
            const stats = getStats();
            expect(stats.pnbinom).toBe(1);
            expect(nan).toBeNaN();
        });
        it('x=10, prob=0, size=30', () => {
            const nan = pnbinom(10, 30, 0);
            expect(nan).toBeNaN();
            // expect(pnbinomDomainWarns()).toHaveLength(1);
        });
        it('x=10, prob=1.2, size=30', () => {
            const nan = pnbinom(10, 30, 1.2);
            expect(nan).toBeNaN();
            // expect(pnbinomDomainWarns()).toHaveLength(1);
        });
        it('x=10, prob=0.2, size=0', () => {
            const z = pnbinom(10, 0, 0.2);
            expect(z).toBe(1);
        });
        it('x=-10, prob=0.2, size=0', () => {
            const z = pnbinom(-10, 0, 0.2);
            expect(z).toBe(0);
        });
        it('x=-10, prob=0.2, size=30', () => {
            const z = pnbinom(-10, 30, 0.2);
            expect(z).toBe(0);
        });
        it('x=10, prob=0.2, size=30', () => {
            const z = pnbinom(10, 30, 0.2);
            expect(z).toEqualFloatingPointBinary(1.0619949154763469e-13, 50);
        });
        it('x=Infinity, prob=0.2, size=30', () => {
            const z = pnbinom(Infinity, 30, 0.2);
            expect(z).toBe(1);
        });
        it('x= [0,200], prob=0.2, size=30', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnbinom1.R'), /\s+/, 1, 2);
            const actual = x.map((_x) => pnbinom(_x, 30, 0.2));
            expect(actual).toEqualFloatingPointBinary(y, 15);
        });
    });
    describe('using mu, not "prob" parameter', () => {
        it('x=NaN, size=30, mu=f(size=30,prob=0.3)', () => {
            const mu = prob2mu(30, 0.3);
            const nan = pnbinom(NaN, 30, undefined, mu);
            expect(nan).toBeNaN();
        });
        it('x=4, size=NaN, mu=f(size=30,prob=0.3)', () => {
            const mu = prob2mu(30, 0.3);
            const nan = pnbinom(4, NaN, undefined, mu);
            expect(nan).toBeNaN();
        });
        it('x=4, size=30, mu=NaN', () => {
            const mu = NaN;
            const nan = pnbinom(4, 30, undefined, mu);
            expect(nan).toBeNaN();
        });
        it('x=4, size=Infinity, mu=f(size=30, prob=0.3)', () => {
            const mu = prob2mu(30, 0.3);
            const nan = pnbinom(4, Infinity, undefined, mu);
            expect(nan).toBeNaN();
            // expect(pnbinomMuDomainWarns()).toHaveLength(1);
        });
        it('x=4, size=30, mu=Infinity', () => {
            const mu = Infinity;
            const nan = pnbinom(4, 30, undefined, mu);
            expect(nan).toBeNaN();
            // expect(pnbinomMuDomainWarns()).toHaveLength(1);
        });
        it('x=4, size=-30, mu=f(size=30, prob=0.3)', () => {
            const mu = prob2mu(30, 0.3);
            const nan = pnbinom(4, -30, undefined, mu);
            expect(nan).toBeNaN();
            // expect(pnbinomMuDomainWarns()).toHaveLength(1);
        });
        it('x=4, size=30, mu=-20 (<0)', () => {
            const mu = -20;
            const nan = pnbinom(4, 30, undefined, mu);
            expect(nan).toBeNaN();
            // expect(pnbinomMuDomainWarns()).toHaveLength(1);
        });
        it('x=4, size=0, mu=f(size=30, prob=0.3)', () => {
            const mu = prob2mu(30, 0.3);
            const z = pnbinom(4, 0, undefined, mu);
            expect(z).toBe(1);
        });
        it('x=-4, size=0, mu=f(size=30, prob=0.3)', () => {
            const mu = prob2mu(30, 0.3);
            const z = pnbinom(-4, 0, undefined, mu);
            expect(z).toBe(0);
        });
        it('x=-4, size=35, mu=f(size=35, prob=0.3)', () => {
            const mu = prob2mu(35, 0.3);
            const z = pnbinom(-4, 35, undefined, mu);
            expect(z).toBe(0);
        });
        it('x=Infinity, size=35, mu=f(size=35, prob=0.3)', () => {
            const mu = prob2mu(35, 0.3);
            const z = pnbinom(Infinity, 35, undefined, mu);
            expect(z).toBe(1);
        });
        it('x=4, size=35, mu=f(size=35, prob=0.3)', () => {
            const mu = prob2mu(35, 0.3); //15
            const z = pnbinom(4, 35, undefined, mu);
            expect(z).toEqualFloatingPointBinary(0.0033180407259661144, 47);
        });
        it('x=4, size=35, mu=f(size=35, prob=0.3), log=true', () => {
            const mu = prob2mu(35, 0.3); //15
            const z = pnbinom(4, 35, undefined, mu, true, true);
            expect(z).toEqualFloatingPointBinary(-5.708380813037822, 47);
        });
        it('x=4, size=35, mu=f(size=35, prob=0.3), lower=false, log=true', () => {
            const mu = prob2mu(35, 0.3); //15
            const z = pnbinom(4, 35, undefined, mu, false, true);
            expect(z).toEqualFloatingPointBinary(-0.0033235576300175533, 45);
        });
        it('x= [0,100, step10], psize=300, mu=35 (prob=0.5384615384615384)', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnbinom2.R'), /\s+/, 1, 2);
            const actual = x.map((_x) => pnbinom(_x, 300, undefined, 350));
            expect(actual).toEqualFloatingPointBinary(y, 25);
        });
    });
});
