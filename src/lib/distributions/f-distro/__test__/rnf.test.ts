import { rf } from '..';
import { globalUni, RNGkind } from '@rng/global-rng';

describe('rnf with ncp defined', function () {
    beforeEach(() => {
        RNGkind({ uniform: "MERSENNE_TWISTER", normal: "INVERSION"});
        globalUni().init(123456);
    })
    it('n=2 df1=3, df2=55 ncp=NaN', () => {
        const actual = rf(2, 3, 55, NaN);
        expect(actual).toEqualFloatingPointBinary([NaN,NaN]);
    });
    it('n=10 df1=3, df2=55 ncp=103', () => {
        const actual = rf(10, 3, 55, 103);
        expect(actual).toEqualFloatingPointBinary([
            36.086018122592449,
            57.142263266447628,
            63.933651254769231,
            23.738717907188740,
            33.824969929551663,
            31.170841402172535,
            44.968630201348780,
            39.322796055487871,
            38.410787618223637,
            39.444431372623981
        ]);
    });
});