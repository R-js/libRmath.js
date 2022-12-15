import { loadData } from '@common/load';
import { resolve } from 'path';
import { cl, select } from '@common/debug-mangos-select';

import { rpois } from '..';

const rpoisLogs = select('rpois');
const rpoisDomainWarns = rpoisLogs("argument out of domain in '%s'");

import { IRNGTypeEnum } from '@rng/irng-type';
import { globalUni, RNGKind } from '@rng/global-rng';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';

describe('rpois', function () {
    beforeEach(() => {
        cl.clear('rpois');
    });
    describe('invalid input and edge cases', () => {
        it('mhu = Infinity | mhu = NaN | mhu < 0', () => {
            const nan1 = rpois(1, NaN);
            expect(nan1).toEqualFloatingPointBinary(NaN);
            const nan2 = rpois(1, Infinity);
            expect(nan2).toEqualFloatingPointBinary(NaN);
            const nan3 = rpois(1, -1);
            expect(nan3).toEqualFloatingPointBinary(NaN);
            expect(rpoisDomainWarns()).toHaveLength(3);
        });
        it('mhu = 0 -> 0', () => {
            const zero1 = rpois(1, 0);
            expect(zero1).toEqualFloatingPointBinary(0);
        });
    });
    describe('fidelity', () => {
        beforeEach(() => {
            RNGKind({ uniform: IRNGTypeEnum.MERSENNE_TWISTER, normal: IRNGNormalTypeEnum.INVERSION});
            globalUni().init(123456);
        });
        it('mhu = 15', async () => {
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rpois1.R'), /\s+/, 1);
            const res1 = rpois(50, 15);
            expect(res1).toEqualFloatingPointBinary(y);
        });
        it('mhu = 5', async () => {
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rpois2.R'), /\s+/, 1);
            const res1 = rpois(50, 5);
            expect(res1).toEqualFloatingPointBinary(y);
        });
        it('mhu = 150', async () => {
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rpois3.R'), /\s+/, 1);
            const res1 = rpois(50, 150);
            expect(res1).toEqualFloatingPointBinary(y);
        });
        it('mhu = 0.5', async () => {
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rpois4.R'), /\s+/, 1);
            const res1 = rpois(50, 0.5);
            expect(res1).toEqualFloatingPointBinary(y);
        });
    });
});