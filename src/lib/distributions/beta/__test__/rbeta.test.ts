//app
import { rbeta } from '..';

import { globalNorm, globalUni, RNGkind } from '@rng/global-rng';

import { createObjectLogHarnas } from '@common/debug-backend';

const { getStats } = createObjectLogHarnas();

describe('rbeta', function () {
    beforeAll(() => {
        RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
    });
    it('sample 5 numbers, n=5, scp1=2, scp2=2', () => {
        /*
        > set.seed(1234)
        > rbeta(5,2,2)
        [1] 0.189691764891692205 0.577896080507901089
        [3] 0.783976975547130639 0.036048134677882052
        [5] 0.619700000680055485
        */
        const uni = globalUni();
        const no = globalNorm();
        uni.init(1234);
        expect(uni.name).toBe('Mersenne-Twister');
        expect(no.name).toBe('Inversion');
        const actual = rbeta(5, 2, 2);
        expect(actual).toEqualFloatingPointBinary([
            0.189691764891692205, 0.577896080507901089, 0.783976975547130639, 0.036048134677882052, 0.619700000680055485
        ]);
    });
    it('scp1=-1, scp2=2', () => {
        const actual = rbeta(1, -1, 2);
        const stats1 = getStats();
        expect(actual).toEqualFloatingPointBinary(NaN);
        expect(stats1.rbeta).toBe(1);
    });
    it('scp1=NAN, scp2=2', () => {
        const actual = rbeta(1, NaN, 2);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('scp1=Inf, scp2=Inf', () => {
        const actual = rbeta(1, Infinity, Infinity);
        expect(actual).toEqualFloatingPointBinary(0.5);
    });
    it('scp1=0, scp2=0', () => {
        const uni = globalUni();
        const no = globalNorm();
        uni.init(1234);
        expect(uni.name).toBe('Mersenne-Twister');
        expect(no.name).toBe('Inversion');
        //> set.seed(1234)
        //> rbeta(40,0,0)
        // [1] 0 1 1 1 1 1 0 0 1 1 1 1 0 1 0 1 0 0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 1 0 1 0 0
        //[39] 1 1
        const actual = rbeta(40, 0, 0);
        expect(actual).toEqualFloatingPointBinary([
            0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1,
            0, 0, 1, 1
        ]);
    });
    it('scp1=Inf, scp2=4', () => {
        const actual = rbeta(1, Infinity, 4);
        expect(actual).toEqualFloatingPointBinary(1);
    });
    it('scp1=Inf, scp2=4', () => {
        const actual = rbeta(1, 0.2, Infinity);
        expect(actual).toEqualFloatingPointBinary(0);
    });

    it('scp1=.2,scp2=8.2', () => {
        const uni = globalUni();
        const no = globalNorm();
        uni.init(1234);
        expect(uni.name).toBe('Mersenne-Twister');
        expect(no.name).toBe('Inversion');

        const actual = rbeta(10, 0.2, 8.2);
        expect(actual).toEqualFloatingPointBinary([
            2.6385199256583115e-3, 7.7165715328026546e-4, 4.1022800723002035e-4, 1.4372295851080399e-2,
            8.3811079909799024e-6, 5.5559730466607102e-2, 8.2905224011662424e-3, 6.0129201610609076e-4,
            2.3202929870389292e-4, 2.6784435398568788e-2
        ]);
    });
    it('n=12, scp1=2,scp2=5, ncp=4', () => {
        const uni = globalUni();
        const no = globalNorm();
        uni.init(12345);
        expect(uni.name).toBe('Mersenne-Twister');
        expect(no.name).toBe('Inversion');
        const actual = rbeta(12, 2, 5, 4);
        expect(actual).toEqualFloatingPointBinary(
            [
                0.588099435516149627, 0.606215223801127245, 0.301138033143182826, 0.164688655960936736,
                0.424809413668907343, 0.048744713047327734, 0.436441221070007712, 0.626410267291842904,
                0.083090139689396048, 0.418669670150109474, 0.504225708172377995, 0.54914997171031088
            ],
            22
        );
    });
});
