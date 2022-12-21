import { cl, select } from '@common/debug-mangos-select';

import { rweibullOne } from '../rweibull';
import { rweibull } from '..';

import { IRNGTypeEnum } from '@rng/irng-type';
import { RNGKind, setSeed } from '@rng/global-rng';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type'

const qweibullDomainWarns = select('rweibull')("argument out of domain in '%s'");


describe('rweibull', function () {
    describe('invalid input and edge cases', () => {
        beforeEach(() => {
            cl.clear('rweibull');
        });
        it('shape=NaN|scale=NaN', () => {
            const nan1 = rweibullOne(NaN, 0.5);
            expect(nan1).toBeNaN();
            const nan2 = rweibullOne(4, NaN);
            expect(nan2).toBeNaN();
        });
        it('shape <= 0 | scale <= 0', () => {
            const nan1 = rweibullOne(3, -0.5);
            expect(nan1).toBeNaN();
            const nan2 = rweibullOne(-4, 0.5);
            expect(nan2).toBeNaN();
            expect(qweibullDomainWarns()).toHaveLength(2);
        });
        it('shape <= 0 | scale = 0', () => {
            const zero = rweibullOne(-3, 0);
            expect(zero).toBe(0);
        });
    });

    describe('fidelity', () => {
        beforeEach(() => {
            RNGKind({ uniform: IRNGTypeEnum.MERSENNE_TWISTER, normal: IRNGNormalTypeEnum.INVERSION});
            setSeed(111_111);
        });
        it('n=10, scale=0.5, shape=4', () => {
            const ans = rweibull(10, 4, 0.5);
            /*
            > set.seed(111111)
            > x=rweibull(10,4,0.5);
            > data.frame(x)

            */
            expect(ans).toEqualFloatingPointBinary([
                0.398435704026611937,
                0.443965176838183928,
                0.063657754510879225,
                0.460309561235067666,
                0.216327263228885708,
                0.418756289335991294,
                0.454827509456368295,
                0.496260623621667896,
                0.417812433744034151,
                0.332115242278925915,
            ], 51);
        });
    });
});