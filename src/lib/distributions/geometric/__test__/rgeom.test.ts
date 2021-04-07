//helper
import { emptyFloat64Array } from '$constants';
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';
import { globalUni, RNGKind } from '@rng/globalRNG';
import { IRNGTypeEnum } from '@rng/irng-type';
import { rgeom } from '..';
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';

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

const rgeomLogs = select('rgeom');
const rgeomDomainWarns = rgeomLogs("argument out of domain in '%s'");
const rgeomWarns = select('R_Q_P01_check')("argument out of domain in '%s'");

rgeomDomainWarns;
rgeomWarns;

describe('rgeom', function () {
    describe('invalid input', () => {
        beforeEach(() => {
            cl.clear('rgeom');
        });
        it('n=1, prob=NaN', () => {
            const nan = rgeom(1, NaN);
            expect(nan).toEqualFloatingPointBinary(NaN);
            expect(rgeomDomainWarns()).toHaveLength(1);
        });
        it('n=1, prob=-1(<0)', () => {
            const nan = rgeom(1, -1);
            expect(nan).toEqualFloatingPointBinary(NaN);
            expect(rgeomDomainWarns()).toHaveLength(1);
        });
        it('n=1, prob=1.3(>1)', () => {
            const nan = rgeom(1, 1.2);
            expect(nan).toEqualFloatingPointBinary(NaN);
            expect(rgeomDomainWarns()).toHaveLength(1);
        });
    });

    describe('edge cases', () => {
        it('n=0', () => {
            const z = rgeom(0, 1);
            expect(z === emptyFloat64Array).toBeTruthy();
        });
    });

    describe('with fixtures', () => {
        beforeAll(()=>{
            RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
            globalUni().init(12345);
        });
        it('n=100, prob={0.3,0.6}', async () => {
            const [y1, y2] = await loadData(
                resolve(__dirname, 'fixture-generation', 'rgeom.R'),
                 /\s+/,
                 1, 2);
            const a1 = rgeom(100, 0.3);
            const a2 = rgeom(100, 0.6);
            expect(a1).toEqualFloatingPointBinary(y1);
            expect(a2).toEqualFloatingPointBinary(y2);
        });
    });
});