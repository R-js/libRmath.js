
import { setSeed, RNGkind } from '@rng/global-rng';

import { rexp } from '..';

import { cl, select } from '@common/debug-mangos-select';

const rexpLogs = select('rexp');
const rexpDomainWarns = rexpLogs("argument out of domain in '%s'");

describe('rexp', function () {
    beforeEach(() => {
        cl.clear('rexp');
        RNGkind({ uniform: "MERSENNE_TWISTER", normal: "INVERSION"});
        setSeed(123456);
    })

    it('n=0', () => {
        const z = rexp(0);
        expect(z).toEqualFloatingPointBinary([]);
    });
    it('n=2 , rate=2', () => {
        const z = rexp(2, 2);
        expect(z).toEqualFloatingPointBinary([
            //from R
            0.29778432077728212,
            0.25356509489938617
        ]);
    });
    it('n=12, rate=2', () => {
        expect(rexp(20, 2)).toEqualFloatingPointBinary([
            //from R
            0.297784320777282119,
            0.253565094899386168,
            0.629084958673870709,
            0.529686986913389113,
            0.569161815547800209,
            0.986526118549418629,
            0.034857962280511856,
            1.311930702004897809,
            0.058075154900267260,
            0.305278878520526653,
            0.068484934015435844,
            0.516560790573662665,
            0.277206317055970430,
            0.831521401139807881,
            1.184882775817382550,
            0.723748533944499672,
            0.880768773103964508,
            0.589350044408183837,
            0.057526889300102656,
            0.022968753473833203
        ]);
    });
    it('n=1 , rate=Nan', () => {
        const nan = rexp(1, NaN);
        expect(nan).toEqualFloatingPointBinary(NaN);
        expect(rexpDomainWarns()).toHaveLength(1);
    });
    it('n=1 , rate=Infinity', () => {
        const z = rexp(1, Infinity);
        expect(z).toEqualFloatingPointBinary(0);
    });

});
