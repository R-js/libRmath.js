import { loadData } from '@common/load';
import { resolve } from 'path';

import { cl, select } from '@common/debug-mangos-select';
import { DBL_EPSILON, DBL_MIN } from '@lib/r-func';

import { qt } from '..';

const qtDomainWarns = select('qt')("argument out of domain in '%s'");
const qtboundaryWarns = select('R_Q_P01_boundaries')("argument out of domain in '%s'");

function partialQtf(p: number, df: number, lowerTail = true, logP = false){
    return qt(p, df, undefined, lowerTail, logP);
}

// partialQtf(p: number, ndf: number, lower_tail: boolean, log_p: boolean): number

describe('partialQtf(x, df, lower.tail, log.p)', function () {
    describe('invalid input and edge cases', () => {
        beforeEach(() => {
            cl.clear('qt');
            cl.clear('R_Q_P01_boundaries');
        });
        it('p=NaN| df = NaN', () => {
            const nan1 = partialQtf(NaN, 0, true, false);
            const nan2 = partialQtf(0.5, NaN, true, false);
            expect([nan1, nan2]).toEqualFloatingPointBinary(NaN);
        });
        it('bounderies p <= 0, p => 1', () => {
            const nan1 = partialQtf(-1, 100, true, false);
            expect(nan1).toBeNaN();
            const nan2 = partialQtf(2, 100, true, false);
            expect(nan2).toBeNaN();
            expect(qtboundaryWarns()).toHaveLength(2);
        });
        it('df <= 0', () => {
            const nan1 = partialQtf(0.2, -2, true, false);
            expect(nan1).toBeNaN();
            expect(qtDomainWarns()).toHaveLength(1);
        });
        it('df > 1e20', () => {
            const ans = partialQtf(0.2, 1.1e20, true, false);
            expect(ans).toEqualFloatingPointBinary(-0.84162123357291418);
        });
        it('df = 1.1e10, p=0.7|p=0.2, lowerTail=true|false asLog=true|false', () => {
            const ans1 = partialQtf(0.7, 1.1e10, true, false);
            expect(ans1).toEqualFloatingPointBinary(0.52440051272323629, 30);
            const ans2 = partialQtf(0.7, 1.1e10, false, false);
            expect(ans2).toEqualFloatingPointBinary(-0.52440051272323629, 30);
            const ans3 = partialQtf(Math.log(0.7), 1.1e10, false, true);
            expect(ans3).toEqualFloatingPointBinary(-0.52440051272323629, 30);
            const ans4 = partialQtf(Math.log(0.7), 1.1e10, true, true);
            expect(ans4).toEqualFloatingPointBinary(0.52440051272323629, 30);
            const ans5 = partialQtf(Math.log(0.2), 1.1e10, true, true);
            expect(ans5).toEqualFloatingPointBinary(-0.8416212336055906, 29);
            const ans6 = partialQtf(Math.log(0.2), 1.1e10, false, true);
            expect(ans6).toEqualFloatingPointBinary(0.8416212336055906, 29);
        });
        it('p < DBL_MIN, df= 45, p=0.7, lowerTail=true, log=true', () => {
            const ans1 = partialQtf(Math.log(DBL_MIN / 2), 45, true, true);
            expect(ans1).toEqualFloatingPointBinary(-43926862.668675929, 43);
            const ans2 = partialQtf(-DBL_MIN / 2, 45, true, true);
            expect(ans2).toEqualFloatingPointBinary(43926862.668675929, 43);
        });
        xit('df < 2.1 && P > 0.5 (lowerTail=false && p ~ 0', () => {
            const ans1 = partialQtf(-DBL_MIN / 2, 1.2, false, true);
            expect(ans1).toEqualFloatingPointBinary(-1.0055623670775586e+256);
        });
        xit('p close to 1 or 0 (-+ EPSILON)',()=>{
            expect(partialQtf(1-DBL_EPSILON/2, 0.2, true, false)).toEqualFloatingPointBinary(Infinity);
            expect(partialQtf(DBL_MIN/2, 2, true, false)).toEqualFloatingPointBinary(-Infinity);
            expect(partialQtf(-DBL_MIN/2, 2, true, true)).toEqualFloatingPointBinary(Infinity);
        });
        xit('p close to 0 , df=1 lowertail=T , aslog = false', ()=>{
            expect(partialQtf(DBL_MIN/2, 1, true, false)).toEqualFloatingPointBinary(-2.8611174857570284e+307);
            //js returns -Infinity, R returns -2.8611174857570284e+307
        })
        it('p close to 0 lowertail=T , aslog = false', ()=>{
            expect(partialQtf(-DBL_MIN/2, 1, true, true)).toEqualFloatingPointBinary(2.8611174857570284e+307);
        })
        it('p = 0.5  df=1, lowertail=True, aslog= false ', ()=>{
            expect(partialQtf(0.5, 1, true, false)).toEqualFloatingPointBinary(0);
        });
    });
    describe('fidelity', () => {
        it('range(0,1), df= 0.2, tail=true, log=false', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qt1.R'), /\s+/, 1, 2);
            const actual = x.map(_x => partialQtf(_x, 0.2, true, false));
            expect(actual).toEqualFloatingPointBinary(y, 21);
        });
        it('range(0,1), df= 2', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qt2.R'), /\s+/, 1, 2);
            const actual = x.map(_x => partialQtf(_x, 2, true, false));
            expect(actual).toEqualFloatingPointBinary(y);   
        });
        it('range(0,1), df= 1', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qt3.R'), /\s+/, 1, 2);
            const actual = x.map(_x => partialQtf(_x, 1, true, false));
            expect(actual).toEqualFloatingPointBinary(y, 47);   
        });
    });
});