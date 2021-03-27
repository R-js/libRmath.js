//helper
import '$jest-extension';
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';

import { dnbinom } from '..';


jest.mock('@common/logger', () => {
    // Require the original module to not be mocked...
    const originalModule = jest.requireActual('@common/logger');
    const { ML_ERROR, ML_ERR_return_NAN } = originalModule;
    let array: unknown[];
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
cl.setDestination();
const out = cl.getDestination();

import { prob2mu } from './test-helpers';


describe('dnbinom', function () {
    describe('using prob, not "mu" parameter', () => {
        beforeEach(()=>{
            out.splice(0);//clear out
        })
        it('ranges x ∊ [0, 200] size=34, prob=0.2', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dnbinom1.R'), /\s+/, 1, 2);
            const actual = x.map(_x => dnbinom(_x, 34, 0.2));
            expect(actual).toEqualFloatingPointBinary(y, 43);
        });
        it('x=NaN, prob=0.5, size=10', () => {
            const nan = dnbinom(NaN, 10, 0.5);
            expect(nan).toBeNaN();
            expect(out.length).toBe(0);
        });
        it('x=10, prob=0, size=20', () => {
            const nan = dnbinom(10, 20, 0);
            expect(nan).toBeNaN();
            expect(out.length).toBe(1);
        });
        it('x=23.4 (non integer), prob=0.3, size=20', () => {
            const z = dnbinom(23.4, 20, 0.3);
            expect(z).toBe(0);
        });
        it('x=-4 (non integer), prob=0.3, size=20', () => {
            const z = dnbinom(-4, 20, 0.3);
            expect(z).toBe(0);
        });
        it('x=0, size=0, prob=0.3', () => {
            const z = dnbinom(0, 0, 0.3);
            expect(z).toBe(1);
        });
        it('x=0, size=0, prob=0.3, aslog=true', () => {
            const z = dnbinom(0, 0, 0.3, undefined, true);
            expect(z).toBe(0);
        });
        it('x=15, size=23, prob=0.3, aslog=true', () => {
            const z = dnbinom(15, 23, 0.3, undefined, true);
            expect(z).toEqualFloatingPointBinary(-10.081338939466201);
        });
    });
    describe('using mu, not "prob" parameter', () => {
        it('x=NaN, size=30, mu=f(size=30,prob=0.3)', () => {
            const mu = prob2mu(30, 0.3);
            const nan = dnbinom(NaN, 30, undefined, mu);
            expect(nan).toBeNaN();
        });
        it('x=4, size=NaN, mu=f(size=30,prob=0.3)', () => {
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
        });
    });
});