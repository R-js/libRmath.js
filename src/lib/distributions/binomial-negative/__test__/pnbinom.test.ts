//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';

import { pnbinom } from '..';


jest.mock('@common/logger', () => {
    // Require the original module to not be mocked...
    const originalModule = jest.requireActual('@common/logger');
    const { ML_ERROR, ML_ERR_return_NAN } = originalModule;
    let array: unknown[] = [];
    function pr(...args: unknown[]): void {
        array.push([...args]);
    }

    return {
        __esModule: true, // Use it when dealing with esModules
        ...originalModule,
        ML_ERROR: jest.fn((x: unknown, s: unknown) => ML_ERROR(x, s, pr)),
        ML_ERR_return_NAN: jest.fn(() => ML_ERR_return_NAN(pr)),
        setDestination(arr: unknown[] = []) {
            array = arr;
        },
        getDestination() {
            return array;
        }
    };
});
//app
const cl = require('@common/logger');
const out = cl.getDestination();

import { prob2mu } from './test-helpers';


describe('pnbinom', function () {
    describe('using prob, not "mu" parameter', () => {
        beforeEach(() => {
            out.splice(0);//clear out
        });
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
            expect(nan).toBeNaN();
            expect(out.length).toBe(1);
        });
        it('x=10, prob=0, size=30', () => {
            const nan = pnbinom(10, 30, 0);
            expect(nan).toBeNaN();
            expect(out.length).toBe(1);
        });
        it('x=10, prob=1.2, size=30', () => {
            const nan = pnbinom(10, 30, 1.2);
            expect(nan).toBeNaN();
            expect(out.length).toBe(1);
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
            const actual = x.map(_x => pnbinom(_x, 30, 0.2));
            expect(actual).toEqualFloatingPointBinary(y, 15);
        });
    });
    describe('using mu, not "prob" parameter', () => {
        beforeEach(() => {
            out.splice(0);//clear out
        });
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
            expect(out.length).toBe(1);
        });
        it('x=4, size=30, mu=Infinity', () => {
            const mu = Infinity;
            const nan = pnbinom(4, 30, undefined, mu);
            expect(nan).toBeNaN();
            expect(out.length).toBe(1);
        });
        it('x=4, size=-30, mu=f(size=30, prob=0.3)', () => {
            const mu = prob2mu(30, 0.3);
            const nan = pnbinom(4, -30, undefined, mu);
            expect(nan).toBeNaN();
            expect(out.length).toBe(1);
        });
        it('x=4, size=30, mu=-20 (<0)', () => {
            const mu = -20;
            const nan = pnbinom(4, 30, undefined, mu);
            expect(nan).toBeNaN();
            expect(out.length).toBe(1);
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
            expect(z).toEqualFloatingPointBinary( -0.0033235576300175533, 45);
        });
       /* it('x=4, size=NaN, mu=f(size=30,prob=0.3)', () => {
            const mu = prob2mu(30, 0.3);
            const nan = dnbinom(4, NaN, undefined, mu);
            expect(nan).toBeNaN();
        });
        it('x=4, size=30, mu=NaN', () => {
            const nan = dnbinom(4, 30, undefined, NaN);
            expect(nan).toBeNaN();
        });
        it('x=4, size = -30 (<0), mu=45', () => {
            const nan = dnbinom(4, -30, undefined, 45);
            expect(nan).toBeNaN();
        });
        it('x=4, size = 30, mu=20(prob=0.4)', () => {
            const z0 = dnbinom(4, 30, undefined, 20);
            expect(z0).toEqualFloatingPointBinary(0.0002315864267512938);
        });
        it('x=4.2 (non int), size = 30, mu=20(prob=0.4)', () => {
            const z0 = dnbinom(4.2, 30, undefined, 20);
            expect(z0).toBe(0);
        });
        it('x=4.2, size = 30, mu=20(prob=0.4), log=true', () => {
            const z0 = dnbinom(4.2, 30, undefined, 20, true);
            expect(z0).toBe(-Infinity);
        });
        it('x=-1(<0), size = 30, mu=20(prob=0.4), log=true', () => {
            const z0 = dnbinom(-1, 30, undefined, 20, true);
            expect(z0).toBe(-Infinity);
        });
        it('x=0, size=0, mu=20(prob=0.4), log=true', () => {
            const z0 = dnbinom(0, 0, undefined, 20, true);
            expect(z0).toBe(0);
        });
        it('x=0, size=30, mu=20(prob=0.4), log=true', () => {
            const z0 = dnbinom(0, 30, undefined, 20, true);
            expect(z0).toEqualFloatingPointBinary(-15.324768712979722);
        });
        it('x=0, size=40, mu=45(prob=0.52941176), log=true', () => {
            const z0 = dnbinom(0, 40, undefined, 45, true);
            expect(z0).toEqualFloatingPointBinary(-30.150872095055206);
        });
        it('x<size*1e-10 =3, size=40000000000, mu=size*1.5(prob=0.6)', () => {
            const z = dnbinom(3, 40000000000, undefined, 40000000000*1.5);
            expect(z).toBe(0);
        });
        it('x<size*1e-10 =3, size=40000000000, mu=size*0.5(prob=1/3)', () => {
            const z = dnbinom(3, 40000000000, undefined, 40000000000*0.5);
            expect(z).toBe(0);
        });
        it('x=size/2, size=40000000000, mu=size*0.5(prob=1/3)', () => {
            const z = dnbinom(40000000000/2, 40000000000, undefined, 40000000000*0.5);
            expect(z).toBe(2.3032943297977065e-06);
        });
        it('x=size/2, size=40000000000, mu=size*0.5(prob=1/3), log=true', () => {
            const size=40000000000;
            const z = dnbinom(size/2, size, undefined, size*0.5, true);
            expect(z).toEqualFloatingPointBinary(-12.981170142513816);
        });*/
    });
});