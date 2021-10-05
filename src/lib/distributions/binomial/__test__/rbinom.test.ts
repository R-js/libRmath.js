
import { resolve } from 'path';
import { loadData } from '@common/load';
import { cl /*, select*/ } from '@common/debug-select';


import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';
import { globalUni, RNGKind } from '@rng/global-rng';
import { IRNGTypeEnum } from '@rng/irng-type';


//const rbinomDomainWarns = select('rbinom')("argument out of domain in '%s'");
//rbinomDomainWarns;

import { rbinom } from '..';

describe('rbinom', function () {
    beforeAll(() => {
        RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
        cl.clear('_rbinom');
    });
    
    it('n=10, unifrom=Mersenne T, norm=Inversion, size=100, n=10, prob=0.2', () => {
        const uni = globalUni();
        uni.init(1234);
        const actual = rbinom(10, 100, 0.5);
        expect(actual).toEqualFloatingPointBinary([47, 40, 48, 47, 48, 53, 52, 53, 53, 47]);
    });
    it('n=10, size=Inf, prob=0.4', () => {
        const uni = globalUni();
        uni.init(12345);
        const nans = rbinom(10, Infinity, 0.4);
        expect(nans).toEqualFloatingPointBinary(Array.from({ length: 10 }, () => NaN));
    });
    it('n=10, size=10.2 prob=0.4', () => {
        const nans = rbinom(10, 10.2, 0.4);
        expect(nans).toEqualFloatingPointBinary(Array.from({ length: 10 }, () => NaN));
    });
    it('n=10, size=10 prob=1.4', () => {
        const nans = rbinom(10, 10, 1.4);
        expect(nans).toEqualFloatingPointBinary(Array.from({ length: 10 }, () => NaN));
    });
    it('n=10, size=0 prob=0.4', () => {
        const zeros = rbinom(10, 0, 0.4);
        expect(zeros).toEqualFloatingPointBinary(Array.from({ length: 10 }, () => 0));
    });
    it('n=10, size=4 prob=1', () => {
        const fours = rbinom(10, 4, 1);
        expect(fours).toEqualFloatingPointBinary(
            Array.from({ length: 10 }, () => 4));
    });
    it('n=10, size=Number.MAX_SAFE_INTEGER * 2, prob=0.5', () => {
        globalUni().init(12345);
        const z = rbinom(10, 2147483647, 0.5);
        expect(z).toEqualFloatingPointBinary([
            1073728257,
            1073715082,
            1073725385,
            1073713876,
            1073744356,
            1073764266,
            1073752331,
            1073741288,
            1073727785,
            1073688147
        ]);
    });
    it('n=100, size=500, prob=0.9', async () => {
        const uni = globalUni();
        uni.init(12345);
        const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rbinom1.R'), /\s+/, 1);
        const actual = rbinom(100, 500, 0.9);
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('n=100, size=500, prob=0.001', async () => {
        const uni = globalUni();
        uni.init(12345);
        const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rbinom2.R'), /\s+/, 1);
        const actual = rbinom(100, 500, 0.001);
        expect(actual).toEqualFloatingPointBinary(y);
    });
});