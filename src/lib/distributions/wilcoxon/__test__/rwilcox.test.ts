import { loadData } from '@common/load';
import { resolve } from 'path';

import { cl, select } from '@common/debug-mangos-select';
import { rwilcoxOne, rwilcox } from '..';

import { globalUni, globalSampleKind } from '@rng/global-rng';

import { IRNGSampleKindTypeEnum } from '@rng/sample-kind-type';

const rwilcoxDomainWarns = select('rwilcox')("argument out of domain in '%s'");

describe('rwilcox', function () {
    describe('invalid input and edge cases', () => {
        beforeEach(() => {
            cl.clear('rwilcox');
            globalUni().init(12345);
            globalSampleKind(IRNGSampleKindTypeEnum.ROUNDING);
        });
        it('m=NaN|m=NaN|n=NaN', () => {
            const nan1 = rwilcoxOne(NaN, 4, globalUni(), globalSampleKind());
            const nan2 = rwilcoxOne(4, NaN, globalUni(), globalSampleKind());
            expect(nan1).toBeNaN();
            expect(nan2).toBeNaN();
        });
        it('m < 0 | n < 0', () => {
            const nan1 = rwilcoxOne(-1, 3,  globalUni(), globalSampleKind());
            const nan2 = rwilcoxOne(5, -4,  globalUni(), globalSampleKind());
            expect(nan1).toBeNaN()
            expect(nan2).toBeNaN();
            expect(rwilcoxDomainWarns()).toHaveLength(2);
        });
        it('m == 0 | n == 0', () => {
            const z1 = rwilcoxOne(0, 3,  globalUni(), globalSampleKind());
            const z2 = rwilcoxOne(1, 0,  globalUni(), globalSampleKind());
            expect(z1).toBe(0);
            expect(z2).toBe(0);
        });
        it('( m + n ) > 800_000_000', () => {
            const nan = rwilcoxOne(400_000_000, 400_000_000,  globalUni(), globalSampleKind());
            expect(nan).toBeNaN();
            expect(rwilcoxDomainWarns()).toHaveLength(2);
        });
    });
    describe('fidelity', () => {
        it('n=100, m = 100 & n= 20, sample.kind=rounding', async () => {
            const [r] = await loadData(resolve(__dirname, 'fixture-generation', 'rwilcox1.R'), /\s+/, 1);
            globalSampleKind(IRNGSampleKindTypeEnum.ROUNDING);
            const unif_ran = globalUni();
            unif_ran.init(12345);
            const ans = rwilcox(100, 100, 20);
            expect(ans).toEqualFloatingPointBinary(r);
        });
        it('n=100, m = 100 & n= 20, sample.kind=rejection', async () => {
            const [r] = await loadData(resolve(__dirname, 'fixture-generation', 'rwilcox2.R'), /\s+/, 1);
            globalSampleKind(IRNGSampleKindTypeEnum.REJECTION);
            const unif_ran = globalUni();
            unif_ran.init(12345);
            const ans = rwilcox(100, 100, 20);
            expect(ans).toEqualFloatingPointBinary(r);
        });
        it.todo('for rwilcox we are diverging for R for high population number 2**20 etc, investigate')
        /*it.only('(takes time) n=4, sample.kind=rounding, (m+n) > cut (2^25-1) of Marsaglia multicarry', async () => {
            const rc = RNGKind({ uniform: IRNGTypeEnum.KNUTH_TAOCP2002, normal: IRNGSampleKindTypeEnum.ROUNDING});
            rc.uniform.init(12345);
            //const [r] = await loadData(resolve(__dirname, 'fixture-generation', 'rwilcox3.R'), /\s+/, 1);
            const ans = rwilcox(4, 2**20, 5);
            console.log(ans);
            //8483063091 8581659696 8204401718 8584827454
            //8483063296, 8581659648, 8204401664, 8584827392
        });*/
    });
});