import { loadData } from '@common/load';
import { resolve } from 'path';

import { cl, select } from '@common/debug-select';

import { runif } from '../index';


import { IRNGTypeEnum } from '@rng/irng-type';
import { globalUni, RNGKind } from '@rng/global-rng';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';

const runifDomainWarns = select('runif')("argument out of domain in '%s'");


describe('runif', function () {
    describe('invalid input and edge cases', () => {
        beforeEach(() => {
            cl.clear('runif');
        });
        it('n=Nan', () => {
            // qunif(p: number, a = 0, b = 1, lowerTail = true, logP = false)
            expect(() => runif(NaN)).toThrowError('"n=NaN" is not a positive finite number');
        });
        it('n=0', () => {
            expect(runif(0)).toEqualFloatingPointBinary([]);
        });
        it('n=0', () => {
            expect(runif(0)).toEqualFloatingPointBinary([]);
        });
        it('a = Infinite| b = Infinite| a > b',()=>{
            const nan1 = runif(1, Infinity);
            // its a Float64Array
            expect(nan1).toEqualFloatingPointBinary(NaN);

            const nan2 = runif(1, 10, Infinity);
            // its a Float64Array
            expect(nan2).toEqualFloatingPointBinary(NaN);

            const nan3 = runif(1, 20, 10);
            // its a Float64Array
            expect(nan3).toEqualFloatingPointBinary(NaN);

            expect(runifDomainWarns()).toHaveLength(3);

        });

        it('a = Infinite| b = Infinite| a > b',()=>{
            const nan1 = runif(1, Infinity);
            // its a Float64Array
            expect(nan1).toEqualFloatingPointBinary(NaN);
            const nan2 = runif(1, 10, Infinity);
            // its a Float64Array
            expect(nan2).toEqualFloatingPointBinary(NaN);
            const nan3 = runif(1, 20, 10);
            // its a Float64Array
            expect(nan3).toEqualFloatingPointBinary(NaN);
            expect(runifDomainWarns()).toHaveLength(3);
        });
    });
    describe('fidelity', () => {
        beforeEach(()=>{
            RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
            globalUni().init(111111);
        });
        it('default input', async ()=>{
            const [x] = await loadData(resolve(__dirname, 'fixture-generation', 'runif1.R'), /\s+/, 1);
            const ans = runif(30);
            expect(ans).toEqualFloatingPointBinary(x)
        });
    });
});


        