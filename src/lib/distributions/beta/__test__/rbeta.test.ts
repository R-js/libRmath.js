// node
//import { resolve } from 'path';

//helper
import '$jest-extension';
//import { loadData } from '$test-helpers/load';

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
        setDestination(arr: unknown[]) {
            array = arr;
        },
        getDestination() {
            return array;
        }
    };
});

//const cl = require('@common/logger');
//app
import { rbeta } from '..';
import { IRNGTypeEnum } from '@rng/irng-type';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';
import { globalNorm, globalUni, RNGKind } from '@rng/globalRNG';


describe('rbeta', function () {

    beforeAll(() => {
        RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
    });
    it('sample 5 numbers, n=5, scp1=1, scp2=2', () => {
        /*
        > set.seed(1234)
        > rbeta(5,2,2)
        [1] 0.189691764891692205 0.577896080507901089
        [3] 0.783976975547130639 0.036048134677882052
        [5] 0.619700000680055485
        */
        const uni = globalUni();
        const no = globalNorm();
        uni.init(1234);
        expect(uni.kind).toBe('MERSENNE_TWISTER');
        expect(no.kind).toBe('INVERSION');
        const actual = rbeta(5, 2, 2);
        console.log(actual);
        expect(actual).toEqualFloatingPointBinary([
            0.189691764891692205,
            0.577896080507901089,
            0.783976975547130639,
            0.036048134677882052,
            0.619700000680055485
        ]);
    });
    /*it('x = 0.5, shape1=NaN, shape2=2, ncp=3', () => {
        const nan = qbeta(0.5, NaN, 2, 3);
        expect(nan).toBe(NaN);
    });
    it('x=0.5, shape1=Infinite,shape2=3, ncp=3', () => {
        const dest: unknown[] = [];
        cl.setDestination(dest);
        const nan = qbeta(0.5, Infinity, 2, 3);
        expect(nan).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('x=0.5, shape1=-2,shape2=3, ncp=3', () => {
        const dest: unknown[] = [];
        cl.setDestination(dest);
        const nan = qbeta(0.5, -2, 2, 3);
        expect(nan).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('x=1-EPSILON/2, shape1=-2, shape2=2, ncp=4', () => {
        const z = qbeta(1 - Number.EPSILON / 2, 2, 2, 4, true);
        expect(z).toBe(1);
    });*/
});