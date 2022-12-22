import { loadData } from '@common/load';
import { resolve } from 'path';
import { cl, select } from '@common/debug-mangos-select';

const logs = select('rlnorm');
const logDomainWanrs = logs("argument out of domain in '%s'");
//  rlnormOne(meanlog = 0, sdlog = 1, rng: IRNGNormal);

import { globalUni, RNGkind } from '@rng/global-rng';

import { rlnorm } from '..';

describe('rlnorm', () => {
    describe('invalid input', () => {
        beforeEach(() => {
            cl.clear('rlnorm');
        });
        it('p=NaN | meanLog=NaN | sdLog=NaN | sdLog < 0', () => {
            const nan1 = rlnorm(1, NaN);
            expect(nan1).toEqualFloatingPointBinary(NaN);
            const nan2 = rlnorm(1, undefined, NaN);
            expect(nan2).toEqualFloatingPointBinary(NaN);
            const nan3 = rlnorm(1, undefined, -1);
            expect(nan3).toEqualFloatingPointBinary(NaN);
            expect(logDomainWanrs()).toHaveLength(3);
        });
    });
    describe('fidelity (defer to rnorm[One] for most)', () => {
        beforeEach(() => {
            RNGkind({ uniform: "MERSENNE_TWISTER", normal: "INVERSION" });
            globalUni().init(123456);
        });
        it('n=50, mhu=4, sd=8', async () => {
            const [ y ] = await loadData(
                resolve(__dirname, 'fixture-generation', 'rlnorm.R'),
                /\s+/,
                1
            );
            const actual = rlnorm(50, 4, 8);
            expect(actual).toEqualFloatingPointBinary(y, 50);
            
        })
    });
});
