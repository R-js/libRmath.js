//helper
import '$jest-extension';
//import { loadData } from '$test-helpers/load';
//import { resolve } from 'path';

import { qnbinom } from '..';


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

describe('qnbinom', function () {
    describe('invalid input', () => {
        expect(() => qnbinom(1, 10, undefined, undefined)).toThrowError('argument "prob" is missing, with no default');
        expect(() => qnbinom(1, 10, 5, 6)).toThrowError('"prob" and "mu" both specified');
    });
    describe('using prob, not "mu" parameter', () => {
        beforeEach(() => {
            out.splice(0);//clear out
        });
        it('p=NaN, prob=0.5, size=10', () => {
            const nan = qnbinom(NaN, 10, 0.5);
            expect(nan).toBeNaN();
        });
        it('p=1, prob=NaN, size=10', () => {
            const nan = qnbinom(1, 10, NaN);
            expect(nan).toBeNaN();
        });
        it('p=1, prob=0.5, size=NaN', () => {
            const nan = qnbinom(1, NaN, 0.5);
            expect(nan).toBeNaN();
        });
        it('p=1, prob=0, size=0', () => {
            const z = qnbinom(1, 0, 0);
            expect(z).toBe(0);
        });
        it('p=0.5, prob=-1(<0), size=0', () => {
            const nan = qnbinom(0.5, 4, -1);
            expect(nan).toBeNaN();
            expect(out.length).toBe(1);
        });
        it('p=1, prob=0.3, size=-4', () => {
            const nan = qnbinom(1, -4, 0.3);
            expect(nan).toBeNaN();
            expect(out.length).toBe(1);
        });
        it('p=1, prob=1, size=4', () => {
            const z = qnbinom(1, 4, 1);
            expect(z).toBe(0);
        });
        it('p=1, prob=0.5, size=0', () => {
            const z = qnbinom(1, 0, 0.5);
            expect(z).toBe(0);
        });
        it('p=1, prob=0.3, size=5', () => {
            const inf = qnbinom(1, 5, 0.3);
            expect(inf).toBe(Infinity);
        });
        it('p=0.8, prob=0.3, size=5', () => {
            const z = qnbinom(0.8, 5, 0.3);
            expect(z).toBe(16);
        });
        it('p=0.8, prob=0.3, size=5, lower=false', () => {
            const z = qnbinom(0.8, 5, 0.3, undefined, false);
            expect(z).toBe(6);
        });
        it('p=log(1), prob=0.3, size=5, lower=true, log.p=true', () => {
            const z = qnbinom(0 ,5,0.3, undefined, true, true);
            expect(z).toBe(Infinity);
        });
        it('p=log(1), prob=0.3, size=5, lower=false, log.p=true', () => {
            const z = qnbinom(0 ,5,0.3, undefined, false, true);
            expect(z).toBe(0);
        });
        it('p=1-epsilon/2, prob=0.3, size=5', () => {
            const z = qnbinom(1-Number.EPSILON/2 ,5,0.3);
            expect(z).toBe(Infinity);
        });
        it('p=0.8, prob=0.0003, size=50', () => {
            const z = qnbinom(0.8 ,50,0.0003);
            expect(z).toBe(186128);
        });
    });
    describe('using mu, not "prob" parameter', () => {
        beforeEach(() => {
            out.splice(0);//clear out
        });
        it('p=0.8, size=500, mu=600, (prob=0.5454545454545454)', () => {
            const z = qnbinom(0.8,500,undefined, 600);
            expect(z).toBe(630);
        });
    });
});