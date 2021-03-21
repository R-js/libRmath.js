//helper
import '$jest-extension';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';
import { globalUni, RNGKind } from '@rng/globalRNG';
import { IRNGTypeEnum } from '@rng/irng-type';
//import { loadData } from '$test-helpers/load';
//import { resolve } from 'path';

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

const cl = require('@common/logger');
cl.setDestination([]);
//app
import { rbinom } from '..';

describe('rbinom', function () {
    beforeAll(() => {
        RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
    });
    it('n=10, unifrom=Mersenne T, norm=Inversion, size=100, n=10, prob=0.2', () => {
        const uni = globalUni();
        uni.init(1234);
        const actual = rbinom(10, 100, 0.5);
        expect(actual).toEqualFloatingPointBinary([47, 40, 48, 47, 48, 53, 52, 53, 53, 47]);
    });
    it('p = NaN, size=NaN, prob=0.01', () => {
        rbinom(10,Infinity,0.4);
        rbinom(10,10.2,0.4);
        rbinom(10,10,1.4);
        rbinom(10,0,0.5);
        rbinom(10,4,1);
        rbinom(10,Number.MAX_SAFE_INTEGER*2,0.5);
        rbinom(100, 500,0.90);
        rbinom(100, 500,0.001);
        
    });
    /*it('p = Infinity, size=10, prob=0.5', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = qbinom(Infinity, 10, 0.5);
        expect(actual).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('p = 0.5, size=Infinity, prob=0.5', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = qbinom(0.5, Infinity, 0.5);
        expect(actual).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('p = 0.5, size=5.2 (non integer), prob=0.5', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = qbinom(0.5, 5.2, 0.5);
        expect(actual).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('p = 0.5, size=-5 (<0), prob=0.5', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = qbinom(0.5, -5, 0.5);
        expect(actual).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('p = 0.5, size=5 , prob=0', () => {
        const actual = qbinom(0.5, 5, 0);
        expect(actual).toBe(0);
    });
    it('p = 0.5, size=5 , prob=1', () => {
        const actual = qbinom(0.5, 5, 1);
        expect(actual).toBe(5);
    });
    it('p=-2.302, size=50 , prob=0.5, tail=TRUE, logp=TRUE', () => {
        const z0 = qbinom(-2.302, 50, 0.5, true, true);
        expect(z0).toBe(20);
    });
    it('p=(1-EPSILON/2), size=50 , prob=0.3', () => {
        const z0 = qbinom(1 - Number.EPSILON / 2, 50, 0.3);
        console.log(z0);
        expect(z0).toBe(50);
    });
    it('p=0.99, size=50 , prob=0.99', () => {
        const z0 = qbinom(0.9999999, 50, 0.99);
        expect(z0).toBe(50);
    });
    it('p=0.99, size=1e6 , prob=0.99', () => {
        const z0 = qbinom(0.9999999, 1e6, 0.99);
        expect(z0).toBe(990513);
    });


    /* it('x = 5, size=Infinity, prob=0.01', () => {
         const dest: string[] = [];
         cl.setDestination(dest);
         const actual = pbinom(5, Infinity, 0.01);
         expect(actual).toBeNaN();
         expect(dest.length).toBe(1);
         console.log(dest);
     });
     */
});