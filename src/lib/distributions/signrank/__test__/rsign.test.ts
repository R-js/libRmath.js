import { loadData } from '@common/load';
import { resolve } from 'path';

import { globalUni, RNGkind } from '@rng/global-rng';

import { cl, select } from '@common/debug-mangos-select';

import { rsignrank } from '..';

import { INT_MAX } from '@lib/r-func';

const rsignrankLogs = select('rsignrank');
const rsignrankDomainWarns = rsignrankLogs("argument out of domain in '%s'");

describe('rsignrank (wilcox sign rank)', function () {
    beforeEach(() => {
        cl.clear('rsignrank');
    });
    describe('invalid input and edge cases', () => {
        it('n = NaN', () => {
            const nan1 = rsignrank(1, NaN);
            expect(nan1).toEqualFloatingPointBinary(NaN);
        });
        it('n > INT_MAX return 0', () => {
            const zero = rsignrank(1, INT_MAX + 1);
            expect(zero).toEqualFloatingPointBinary(0);
        });
        it('n < 0', () => {
            const nan1 = rsignrank(1, -1);
            expect(nan1).toEqualFloatingPointBinary(NaN);
            expect(rsignrankDomainWarns()).toHaveLength(1);
        });
        it('n == 0', () => {
            const zero = rsignrank(1, 0);
            expect(zero).toEqualFloatingPointBinary(0);
        });
    });
    describe('fidelity', () => {
        beforeEach(() => {
            RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
            globalUni().init(123456);
        });
        it('N = 50, n = 3000', async () => {
            const [y] = await loadData(resolve(__dirname, 'fixture-generation', 'rsign1.R'), /\s+/, 1);
            const actual = rsignrank(50, 3000);
            expect(actual).toEqualFloatingPointBinary(y);
        });
    });
});
