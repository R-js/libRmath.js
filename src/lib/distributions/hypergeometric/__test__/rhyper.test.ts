import { loadData } from '@common/load';
import { resolve } from 'path';
import { cl, select } from '@common/debug-select';

import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';
import { globalUni, RNGKind } from '@rng/global-rng';
import { IRNGTypeEnum } from '@rng/irng-type';
import { rhyper, useWasmBackends, clearBackends } from '..';
import { humanize } from '@common/humanize-time';

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

        it('test with k=1 AND m, n, bigger then INT_MAX (2^31-1)', () => {
            const z = rhyper(10, 2 ** 31, 2 ** 31, 1);
            expect(z).toEqualFloatingPointBinary([1, 1, 0, 0, 0, 0, 1, 0, 1, 0]);
            const z2 = rhyper(10, 2 ** 31 - 2, 2 ** 31, 1)
            expect(z2).toEqualFloatingPointBinary([1, 1, 1, 1, 1, 1, 1, 0, 0, 1]);
        });
        it('(wasm) with k=2^31-1 AND m, n, bigger then INT_MAX (2^31-1', async () => { 
            globalUni().init(1234);
            await useWasmBackends();
            const t0 = Date.now();
            const z3 = rhyper(
                1, //N
                2 ** 31 - 1, //nn1in
                2 ** 31 - 1, //nn2in
                2 ** 31 - 1, //kkin
                undefined,   //rng
            );
            expect(z3).toEqualFloatingPointBinary(1073761537);
            const t1 = Date.now();
            globalUni().init(1234); // important!
            const z4 = rhyper(
                1, //N
                (2 ** 31) / 2, //nn1in
                (2 ** 31) / 2, //nn2in
                2 ** 31 - 1, //kkin
                undefined,   //rng
            );
            const t2 = Date.now();
            expect(z4).toEqualFloatingPointBinary(1073741824);
            clearBackends();
            console.log(`rhyper: (wasm) ${humanize.humanize(t1-t0)}`);
            console.log(`rhyper: (wasm) ${humanize.humanize(t2-t1)}`);
        });
    });

    describe('reguler', () => {
        beforeEach(() => {
            cl.clear('rhyper');
            RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
            globalUni().init(123456);
        });
        it('n=50, NR=30, NB=15, K=20', async () => {

            const result = rhyper(50, 30, 15, 20);
            //R fidelity test

            expect(result).toEqualFloatingPointBinary([
                12, 12, 14, 14, 14, 15, 13, 15, 10, 15, 12, 13, 11
                , 11, 9, 11, 11, 15, 14, 12, 15, 16, 15, 15, 13, 13
                , 11, 12, 12, 15, 13, 12, 14, 15, 12, 16, 11, 12, 12
                , 13, 15, 12, 11, 14, 13, 14, 13, 12, 13, 14
            ]);
        });
        it('n=50, NR=15, NB=30,k=20', async () => {
            const result = rhyper(50, 15, 30, 20);
            //R fidelity test
            expect(result).toEqualFloatingPointBinary([
                8, 8, 6, 6, 6, 5, 7, 5, 10, 5, 8, 7, 9,
                9, 11, 9, 9, 5, 6, 8, 5, 4, 5, 5, 7, 7,
                9, 8, 8, 5, 7, 8, 6, 5, 8, 4, 9, 8, 8,
                7, 5, 8, 9, 6, 7, 6, 7, 8, 7, 6
            ]);
        });
        it('n=50, 2*K > (NR+NB) and swap NR and NB', () => {
            // change K only so it will partly re-use cache
            const result = rhyper(50, 15, 30, 40);
            expect(result).toEqualFloatingPointBinary([
                13, 13, 14, 14, 14, 14, 13, 15, 11, 14, 13, 13, 12, 12, 11, 12, 12,
                14, 14, 13, 14, 15, 14, 14, 13, 13, 12, 12, 12, 14, 13, 12, 14, 14,
                12, 15, 12, 12, 13, 13, 14, 13, 12, 14, 13, 14, 13, 13, 13, 14
            ]);

            //console.log(result2);
            const result2 = rhyper(10, 30, 15, 40);
            expect(result2).toEqualFloatingPointBinary([
                26, 27, 27, 28, 27, 29, 28, 28, 26, 26
            ]);
        });
        it('solution I: degeneracy', () => {
            const result = rhyper(1, 50, 150, 200);
            expect(result).toEqualFloatingPointBinary(50);
            const result2 = rhyper(1, 150, 50, 200);
            expect(result2).toEqualFloatingPointBinary(150);
        });
        it('solution III:  III : H2PE Algorithm', () => {
            const result = rhyper(50, 100, 200, 199);
            expect(result).toEqualFloatingPointBinary([
                66, 67, 64, 67, 69, 70, 65, 72, 68, 79, 60, 68, 65, 64, 62, 67, 65,
                72, 68, 69, 64, 70, 71, 70, 69, 58, 77, 76, 70, 70, 72, 64, 69, 64,
                67, 69, 65, 72, 70, 67, 63, 53, 59, 67, 70, 71, 66, 68, 64, 69
            ]);
        });
        it('solution(2) III:  III : H2PE Algorithm', async () => {
            const [expected] = await loadData(
                resolve(__dirname, 'fixture-generation', 'rhyper.R'),
                /\s+/,
                1
            );
            const actual = rhyper(50, 1900, 2000, 599);
            expect(actual).toEqualFloatingPointBinary(expected);
        });
    });
});