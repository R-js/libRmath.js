//helper
import '$jest-extension';
import { BoxMuller } from '@rng/normal/box-muller';
import { globalUni } from '@rng/globalRNG';
import { SuperDuper } from '@rng/super-duper';
//import { loadData } from '$test-helpers/load';
//import { resolve } from 'path';

import { rnbinom } from '..';


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


describe('rnbinom', function () {
    describe('invalid input', () => {
        expect(() => rnbinom(1, 10, undefined, undefined)).toThrowError('argument "prob" is missing, with no default');
        expect(() => rnbinom(1, 10, 5, 6)).toThrowError('"prob" and "mu" both specified');
    });
    describe('using prob, not "mu" parameter', () => {
        beforeEach(() => {
            out.splice(0);//clear out
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
            out.splice(0);//clear out
        });
        it('n=10, size=8, mu=12 (prob=0.6)', () => {
            const un = new SuperDuper(1234);
            const bm = new BoxMuller(un);
            const z = rnbinom(10, 8, undefined, 12, bm);
            expect(z).toEqualFloatingPointBinary([10, 10, 17, 6, 9, 14, 10, 12, 3, 5]);
        });
        it('n=1, size=8, mu=NaN', () => {
            const nan = rnbinom(1, 8, undefined, NaN);
            expect(nan).toEqualFloatingPointBinary(NaN);
            expect(out.length).toBe(1);
        });
        it('n=1, size=8, mu=0', () => {
            const z = rnbinom(1, 8, undefined, 0);
            expect(z).toEqualFloatingPointBinary(0);
        });
    });
});