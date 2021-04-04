//helper
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { rf } from '..';
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

const rnfLogs = select('rnf');
const rnfDomainWarns = rnfLogs("argument out of domain in '%s'");
rnfDomainWarns;
describe('rf with ncp defined', function () {
    beforeEach(() => {
        RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
        cl.clear('rnf');
        globalUni().init(123456);
    })
    it('n=2 df1=3, df2=55 ncp=NaN', () => {
        const actual = rf(2, 3, 55, NaN);
        expect(actual).toEqualFloatingPointBinary([NaN,NaN]);
    });/*
    it('n=1, df1=-3(<0), df2=55', () => {
        const nan = rf(1, -3, 55);
        expect(nan).toEqualFloatingPointBinary(NaN);
        expect(rfDomainWarns()).toHaveLength(1);
    });
    it('n=1, df1=Inf, df2=Inf', () => {
        const z = rf(1, Infinity, Infinity);
        expect(z).toEqualFloatingPointBinary(1);
    });
    /*
    it('p=0.2 df1=Nan, df2=231', () => {
        const nan = qf(0.2, NaN, 231);
        expect(nan).toBeNaN();
    });
    it('p=0.2, df1=-2(<0), df2=4', () => {
        const nan = qf(0.2, -2, 4,);
        expect(nan).toBeNaN();
        expect(qfDomainWarns()).toHaveLength(1);
    });
    it('p=0.3, df1=35, df2=4e6', () => {
        const z = qf(0.3, 35, 4e6);
        expect(z).toEqualFloatingPointBinary(0.86223349387851478);
    });
    it('p=0.3, df1=Infinity, df2=Infinity', () => {
        const z = qf(0.3, Infinity, Infinity);
        expect(z).toBe(1);
    });
    it('p=0.3, df1=1e6, df2=234', () => {
        const z = qf(0.3, 1e6, 234);
        expect(z).toEqualFloatingPointBinary( 0.95571309656704362);
    });*/
});