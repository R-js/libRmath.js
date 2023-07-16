import { cl, select } from '@common/debug-mangos-select';

import { rlogis } from '..';
import { globalUni, RNGkind } from '@rng/global-rng';

const rLogisLogs = select('rlogis');
const rLogisDomainWarns = rLogisLogs("argument out of domain in '%s'");

describe('rlogis', function () {
    beforeEach(() => {
        cl.clear('rlogis');
        RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
        globalUni().init(123456);
    });
    it('n = 0', () => {
        const rc = rlogis(0);
        expect(rc).toEqualFloatingPointBinary([]);
    });
    it('n = 5, all others on default', () => {
        const rc = rlogis(5);
        expect(rc).toEqualFloatingPointBinary(
            [
                1.37250343948471332, 1.11771752244335709, -0.44203706681561084, -0.65636472273741553,
                -0.56975173518906264
            ],
            50
        );
    });

    it('n = 5, all others on default ', () => {
        const infs = rlogis(5, Infinity);
        expect(infs).toEqualFloatingPointBinary([Infinity, Infinity, Infinity, Infinity, Infinity]);
    });

    it('n = 5, location = nan', () => {
        const nans = rlogis(5, NaN);
        expect(nans).toEqualFloatingPointBinary([NaN, NaN, NaN, NaN, NaN]);
        expect(rLogisDomainWarns()).toMatchInlineSnapshot(`
            [
              [
                "argument out of domain in '%s'",
                "rlogisOne, line:9, col:34",
              ],
              [
                "argument out of domain in '%s'",
                "rlogisOne, line:9, col:34",
              ],
              [
                "argument out of domain in '%s'",
                "rlogisOne, line:9, col:34",
              ],
              [
                "argument out of domain in '%s'",
                "rlogisOne, line:9, col:34",
              ],
              [
                "argument out of domain in '%s'",
                "rlogisOne, line:9, col:34",
              ],
            ]
        `);
    });

    it('n = 0', () => {
        const empty = rlogis(0);
        expect(empty).toEqualFloatingPointBinary([]);
    });
});
