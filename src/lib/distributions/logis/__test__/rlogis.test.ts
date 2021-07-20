//helper
//helper
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { rlogis } from '..';
import { IRNGTypeEnum } from '@rng/irng-type';
import { globalUni, RNGKind } from '@rng/globalRNG';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';

const cl = require('debug');

function select(ns: string) {
    return function (filter: string) {
        return function () {
            const logs = cl.get(ns);// put it here and not in the function scope
            if (!logs) return [];
            return logs.filter((s: string[]) => s[0] === filter);
        };
    };
}

const rLogisLogs = select('rlogis');
const rLogisDomainWarns = rLogisLogs("argument out of domain in '%s'");

rLogisDomainWarns;

describe('rlogis', function () {

    beforeEach(() => {
        cl.clear('rlogis');
        RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
        globalUni().init(123456);
    });
    it('n = 0', () => {
        //  rlogis(n: number, location = 0, scale = 1, rng: IRNG = globalUni()): Float64Array
        const rc = rlogis(0);
        expect(rc).toEqualFloatingPointBinary([]);
    });
    it('n = 5, all others on default ', () => {
        //  rlogis(n: number, location = 0, scale = 1, rng: IRNG = globalUni()): Float64Array
        const rc = rlogis(5);
        expect(rc).toEqualFloatingPointBinary([
            1.37250343948471332,
            1.11771752244335709,
            -0.44203706681561084,
            -0.65636472273741553,
            -0.56975173518906264
        ], 50);
    });

    it('n = 5, all others on default ', () => {
        //  rlogis(n: number, location = 0, scale = 1, rng: IRNG = globalUni()): Float64Array
        const infs = rlogis(5, Infinity);
        expect(infs).toEqualFloatingPointBinary([Infinity, Infinity, Infinity, Infinity, Infinity]);
    });

    it('n = 5, location = nan', () => {
        //  rlogis(n: number, location = 0, scale = 1, rng: IRNG = globalUni()): Float64Array
        const nans = rlogis(5, NaN);
        expect(nans).toEqualFloatingPointBinary([NaN, NaN, NaN, NaN, NaN]);
        expect(rLogisDomainWarns()).toEqual([
            ["argument out of domain in '%s'", ''],
            ["argument out of domain in '%s'", ''],
            ["argument out of domain in '%s'", ''],
            ["argument out of domain in '%s'", ''],
            ["argument out of domain in '%s'", '']
        ]);
    });


    xit('p = 0', () => {
        const nInf = rlogis(0);
        expect(nInf).toBe(-Infinity);
    });
    xit('p = 1', () => {
        const Inf = rlogis(1);
        expect(Inf).toBe(Infinity);
    });
    xit('p = -1 and p = 1.2', () => {
        const nan1 = rlogis(-1);
        const nan2 = rlogis(1.2);
        expect(nan1).toEqualFloatingPointBinary(NaN);
        expect(nan2).toEqualFloatingPointBinary(NaN);
    });
    xit('scale <= 0', () => {
        const nan = rlogis(0.3, undefined, -1);
        expect(nan).toEqualFloatingPointBinary(NaN);
        expect(rLogisDomainWarns()).toEqual([["argument out of domain in '%s'", '']])
    });
    xit('scale == 0', () => {
        const location = rlogis(0.2, 4, 0);
        expect(location).toEqualFloatingPointBinary(4);
        console.log(rLogisDomainWarns());
    });
});
