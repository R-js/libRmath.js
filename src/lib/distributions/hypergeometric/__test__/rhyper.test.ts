
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
            const z2 = rhyper(10,2**31-2,2**31,1)
            expect(z2).toEqualFloatingPointBinary([ 1, 1, 1, 1, 1, 1, 1, 0, 0, 1]);
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
                (2 ** 31)/2, //nn1in
                (2 ** 31)/2, //nn2in
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

    xdescribe('with fixtures', () => {
        beforeAll(() => {
            RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
            globalUni().init(12345);
        });
        xit('n=100', async () => {
            //rhyper(1, 23,45,10);
            //rhyper(10,23,45,10));
            rhyper(100, 2 ** 31 - 2, 2 ** 31 - 2, 2 ** 31 - 2)
            console.log(rhyper(1, 2 ** 31 - 2, 2 ** 31 - 2, 2 ** 31 - 1));
        });
        xit('n=100', async () => {
            //rhyper(1, 23,45,10);
            //rhyper(10,23,45,10));
            rhyper(100, 2 ** 31 - 2, 2 ** 31 - 2, 1E6)
            console.log(rhyper(1, 2 ** 31 - 2, 2 ** 31 - 2, 1E6));
        });
    });
});