
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';
import { globalUni, RNGKind } from '@rng/globalRNG';
import { IRNGTypeEnum } from '@rng/irng-type';
import { rhyper, useWasmBackends, clearBackends } from '..';

//import { resolve } from 'path';
import { cl, select } from '$test-helpers/debug-select';

const rhyperDomainWarns = select('rhyper')("argument out of domain in '%s'");

describe('rhyper', function () {
    describe('invalid input', () => {
        beforeEach(() => {
            cl.clear('rhyper');
            RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
            globalUni().init(123456);
        });
        it('n=1, other params are NaNs or Infinity', async () => {
            const nan2 = rhyper(1, NaN, 0, 0);
            const nan3 = rhyper(1, 0, NaN, 0);
            const nan4 = rhyper(1, 0, 0, Infinity);
            expect([nan2[0], nan3[0], nan4[0]]).toEqualFloatingPointBinary(NaN);
            expect(rhyperDomainWarns()).toHaveLength(3);
        });
        it('test inputs nr < 0, nb <0, n <0 n > (nb+nr)', async () => {
            const nan1 = rhyper(1, -1, 0, 0);
            const nan2 = rhyper(1, 0, -1, 0);
            const nan3 = rhyper(1, 0, 0, -1);
            const nan4 = rhyper(1, 0, 0, 2);
            expect([nan1[0], nan2[0], nan3[0], nan4[0]]).toEqualFloatingPointBinary(NaN);
            expect(rhyperDomainWarns()).toHaveLength(4);
        });
    });

    describe('edge cases', () => {
        beforeEach(() => {
            cl.clear('rhyper');
            RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
            globalUni().init(123456);
        });

        it('test with m, n, k bigger then INT_MAX (2^31-1)', async () => {
            const z = rhyper(10, 2 ** 31, 2 ** 31, 1);
            expect(z).toEqualFloatingPointBinary([1, 1, 0, 0, 0, 0, 1, 0, 1, 0]);
            const z2 = rhyper(10, 2 ** 31 - 2, 2 ** 31, 1)
            expect(z2).toEqualFloatingPointBinary([1, 1, 1, 1, 1, 1, 1, 0, 0, 1]);
            globalUni().init(1234);
            const d = Date.now();
            await useWasmBackends();
            const z3 = rhyper(
                1, //N
                2 ** 31 - 1, //nn1in
                2 ** 31 - 1, //nn2in
                2 ** 31 - 1, //kkin
                undefined,   //rng
            );
            expect(z3).toEqualFloatingPointBinary(1073761537);
            //jkf do here tomorrow
            globalUni().init(1234); // important!
            const z4 = rhyper(
                1, //N
                (2 ** 31) / 2, //nn1in
                (2 ** 31) / 2, //nn2in
                2 ** 31 - 1, //kkin
                undefined,   //rng
            );
            expect(z4).toEqualFloatingPointBinary(1073741824);
            clearBackends();

            //z3=1073761537, 459 sec
            //1073761537, wasm backend 27sec (17 times faster)
            const delay = Date.now() - d;
            console.log(`r=${z4}, delay=${delay}ms`);
        });
    });

    describe('reguler', () => {
        beforeAll(() => {
            cl.clear('rhyper');
            RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
            globalUni().init(123456);
        });
        it('n=50', async () => {
            const result = rhyper(50, 30, 15, 20);
            //R fidelity test
            expect(result).toEqualFloatingPointBinary([
                12, 12, 14, 14, 14, 15, 13, 15, 10, 15, 12, 13, 11
                , 11, 9, 11, 11, 15, 14, 12, 15, 16, 15, 15, 13, 13
                , 11, 12, 12, 15, 13, 12, 14, 15, 12, 16, 11, 12, 12
                , 13, 15, 12, 11, 14, 13, 14, 13, 12, 13, 14]);
        });
        it('n=50', async () => {
            const result = rhyper(50, 15, 30, 20);
            //R fidelity test
            console.log(result);
            /*expect(result).toEqualFloatingPointBinary([
                8, 8, 6, 6, 6, 5, 7, 5, 10, 5, 8, 7, 9,
                9, 11, 9, 9, 5, 6, 8, 5, 4, 5, 5, 7, 7,
                9, 8, 8, 5, 7, 8, 6, 5, 8, 4, 9, 8, 8,
                7, 5, 8, 9, 6, 7, 6, 7, 8, 7, 6
            ]);*/
        });
    });
});