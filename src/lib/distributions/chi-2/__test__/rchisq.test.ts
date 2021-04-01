//helper
import '$jest-extension';
import './helper';// for the side effects
import { globalUni, RNGKind } from '@rng/globalRNG';

import { rchisq } from '..';
import { IRNGTypeEnum  } from '@rng/irng-type';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';


const cl = require('debug');

function select(ns:string){
    return function(filter: string) {
        return function(){
            const logs = cl.get(ns);// put it here and not in the function scope
            if (!logs) return [];
            return logs.filter((s:string[])=> s[0]===filter);
        };
    };
}


const rchisqLogs = select('rchisq');
const rchisqDomainWarns = rchisqLogs("argument out of domain in '%s'");
//const R_Q_P01_boundaries = select("R_Q_P01_boundaries")("argument out of domain in '%s'");

describe('rchisq', function () {
    beforeEach(() => {
        RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
        globalUni().init(98765);
    })
    it('n=10, df=34, defaults', () => {
        rchisq(10,45); // skip 10
        const actual = rchisq(10, 45);
        expect(actual).toEqualFloatingPointBinary([
            32.638684661215024,
            63.015911772417191,
            40.626237311699306,
            51.208705873715331,
            44.909424675790682,
            56.322790586854410,
            45.370044281715892,
            59.646756291554219,
            41.112547915379793,
            47.739896277088462
        ]);
    });
    it('n=1, location=NaN, defaults', () => {
        const nan = rchisq(1, NaN);
        expect(nan).toEqualFloatingPointBinary(NaN);
        expect(rchisqDomainWarns()).toHaveLength(1);
    });
});