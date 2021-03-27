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

const cl = require('@common/logger');
//app
import { rbeta } from '..';
import { IRNGTypeEnum } from '@rng/irng-type';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';
import { globalNorm, globalUni, RNGKind } from '@rng/globalRNG';


describe('rbeta', function () {

    beforeAll(() => {
        RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
    });
    it('sample 5 numbers, n=5, scp1=2, scp2=2', () => {
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
        expect(actual).toEqualFloatingPointBinary([
            0.189691764891692205,
            0.577896080507901089,
            0.783976975547130639,
            0.036048134677882052,
            0.619700000680055485
        ]);
    });
    it('scp1=-1, scp2=2', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = rbeta(1, -1, 2);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('scp1=NAN, scp2=2', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = rbeta(1, NaN, 2);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('scp1=Inf, scp2=Inf', () => {
        const actual = rbeta(1, Infinity, Infinity);
        expect(actual).toEqualFloatingPointBinary(0.5);
    });
    it('scp1=0, scp2=0', () => {
        const uni = globalUni();
        const no = globalNorm();
        uni.init(1234);
        expect(uni.kind).toBe('MERSENNE_TWISTER');
        expect(no.kind).toBe('INVERSION');
        //> set.seed(1234)
        //> rbeta(40,0,0)
        // [1] 0 1 1 1 1 1 0 0 1 1 1 1 0 1 0 1 0 0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 1 0 1 0 0
        //[39] 1 1
        const actual = rbeta(40, 0, 0);
        expect(actual).toEqualFloatingPointBinary([
            0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0,
            1, 1
        ]);
    });
    it('scp1=Inf, scp2=4', () => {

        const actual = rbeta(1, Infinity, 4);
        expect(actual).toEqualFloatingPointBinary(1);
    });
    it('scp1=Inf, scp2=4', () => {

        const actual = rbeta(1, .2, Infinity);
        expect(actual).toEqualFloatingPointBinary(0);
    });

    it('scp1=.2,scp2=8.2', () => {
        const uni = globalUni();
        const no = globalNorm();
        uni.init(1234);
        expect(uni.kind).toBe('MERSENNE_TWISTER');
        expect(no.kind).toBe('INVERSION');

        const actual = rbeta(10, .2, 8.2);
        expect(actual).toEqualFloatingPointBinary([
            2.6385199256583115e-03,
            7.7165715328026546e-04,
            4.1022800723002035e-04,
            1.4372295851080399e-02,
            8.3811079909799024e-06,
            5.5559730466607102e-02,
            8.2905224011662424e-03,
            6.0129201610609076e-04,
            2.3202929870389292e-04,
            2.6784435398568788e-02])
    });
    it('n=12, scp1=2,scp2=5, ncp=4', () => {
        const uni = globalUni();
        const no = globalNorm();
        uni.init(12345);
        expect(uni.kind).toBe('MERSENNE_TWISTER');
        expect(no.kind).toBe('INVERSION');
        const actual = rbeta(12, 2, 5, 4);
        expect(actual).toEqualFloatingPointBinary([
            0.588099435516149627,
            0.606215223801127245,
            0.301138033143182826,
            0.164688655960936736,
            0.424809413668907343,
            0.048744713047327734,
            0.436441221070007712,
            0.626410267291842904,
            0.083090139689396048,
            0.418669670150109474,
            0.504225708172377995,
            0.549149971710310880
        ],
        22)
    });
    /*
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