import { loadData } from '@common/load';
import { resolve } from 'path';
import { cl, select } from '@common/debug-mangos-select';

import { rnorm } from '..';

const rnormLogs = select('rnorm');
const rnormDomainWarns = rnormLogs("argument out of domain in '%s'");

//const boundaries = select('R_Q_P01_boundaries')("argument out of domain in '%s'");
import { globalUni, RNGkind } from '@rng/global-rng';

describe('rnorm', function () {
    describe('invalid input check and edge cases', () => {
        beforeAll(()=>{
            RNGkind({ uniform: "MERSENNE_TWISTER", normal: "INVERSION"});
            globalUni().init(123456);
            cl.clear('rnorm');
        });
        it('mhu = NaN | sigma = NaN | sigma < 0',()=>{
            const nan1 = rnorm(1, NaN);
            const nan2 = rnorm(1, undefined, NaN);
            const nan3 = rnorm(1, undefined, -1);
            expect(nan1).toEqualFloatingPointBinary(NaN);
            expect(nan2).toEqualFloatingPointBinary(NaN);
            expect(nan3).toEqualFloatingPointBinary(NaN);
            expect(rnormDomainWarns()).toHaveLength(3);
        });
        it('mhu = Infinity | sigma = 0',()=>{
            const mhu1 = rnorm(1, Infinity);
            const mhu2 = rnorm(1, 3, 0);
            expect(mhu1).toEqualFloatingPointBinary(Infinity);
            expect(mhu2).toEqualFloatingPointBinary(3);
        })
    });
    describe('fidelity',()=>{
        beforeAll(()=>{
            RNGkind({ uniform: "MERSENNE_TWISTER", normal: "INVERSION"});
            globalUni().init(123456);
        });
        it('100 samples', async () => {
            const [expected] = await loadData(resolve(__dirname, 'fixture-generation', 'rnorm.R'), /\s+/, 1);
            const actual = rnorm(100);
            expect(actual).toEqualFloatingPointBinary(expected);
        });
    });
});