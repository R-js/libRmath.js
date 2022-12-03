import { loadData } from '@common/load';
import { resolve } from 'path';


import { cl, select } from '@common/debug-mangos-select';

import { pt } from '..';

const pntLogs = select('pnt');
const pntDomainWarns = pntLogs("argument out of domain in '%s'");

describe('pt(x,df, ncp, log.p)', function () {
    describe('ncp is defined', () => {
        beforeEach(() => {
            cl.clear('pnt');
        });
        it('x=Nan|df=NaN|ncp=NaN', () => {
            //
            const nan1 = pt(NaN, 45, 0);
            const nan2 = pt(0, NaN, 0);
            const nan3 = pt(0, 45, NaN);
            expect([nan1, nan2, nan3]).toEqualFloatingPointBinary(NaN);
        });
        it('df <= 0', () => {
            const nan1 = pt(0, 0, 0);
            expect(nan1).toBeNaN();
            expect(pntDomainWarns()).toHaveLength(1);
        });
        it('x = -Infinity| x= Infinity', () => {
            const zero = pt(-Infinity, 45);
            expect(zero).toBe(0);
            const one = pt(+Infinity, 45);
            expect(one).toBe(1);
        });
        it('ncp=x = -Infinity| x= Infinity', () => {
            const zero = pt(-Infinity, 45);
            expect(zero).toBe(0);
            const one = pt(+Infinity, 45);
            expect(one).toBe(1);
        });
        it('df > 4e5', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pt1.R'), /\s+/, 1, 2);
            const actual = x.map(_x => pt(_x, 10 + 4e5, 45));
            expect(actual).toEqualFloatingPointBinary(y, 40);
        });
        it('df < 4e5 && ncp >  SQRT(2 * M_LN2 * -(DBL_MIN_EXP = -1024))', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pt2.R'), /\s+/, 1, 2);
            const actual = x.map(_x => pt(_x, 1000, 47));
            expect(actual).toEqualFloatingPointBinary(y, 39);
        });
        it.todo('check why pt(-2, 15, 8) returns 8.804068585277491e-14 instead of 8.3266726846886741e-15 (10x smaller)');
        it('x <= 0 && ncp < 45 & df < 4e5', () => {
            expect(pt(9, 15, 8)).toEqualFloatingPointBinary(0.66588304904945461, 49);
            expect(pt(0, 15, 8)).toEqualFloatingPointBinary(6.2209605742717849e-16);
        });
        it('x <= 0 && ncp > 40 && (logp=false | lowerTail = false)', () => {
            expect(pt(-6, 15, 41)).toBe(0);
            expect(pt(-6, 15, 41, false, true)).toBe(0);
            expect(pt(-6, 15, 41, false, false)).toBe(1);
            expect(pt(-6,15,41, true, true)).toEqualFloatingPointBinary(-504.28508885350828);
        });
    });
    describe('ncp = 0 or undefined',()=>{
        it('df = Infinite', ()=>{
            expect(pt(0,Infinity)).toBe(0.5);
        });
        it('df > 4e5', ()=>{
            expect(pt(-2,4e5+10)).toEqualFloatingPointBinary(0.022750469383684711, 50);
            expect(pt(2,4e5+10)).toEqualFloatingPointBinary(0.97724953061631536, 49);
        });
        it('x*x >= df',()=>{
            const df = 15
            const x = Math.sqrt(15)*1.2;
            const ans = pt(x,df, 0);
            expect(ans).toEqualFloatingPointBinary(0.9998421100704078, 34);
        });
        it('1+(x/df)*x > 1e100, lower.tail = True|False and Log.p=True|False',()=>{
            const df = 15
            const x1 = Math.sqrt((1e100-1)*(df+1));
            const ans1 = pt(x1,df, 0, true, true);
            expect(ans1).toEqualFloatingPointBinary(0);
            const ans2 = pt(x1,df, 0, true, false);
            expect(ans2).toEqualFloatingPointBinary(1);
            const ans3 = pt(x1,df, 0, false, true);
            expect(ans3).toEqualFloatingPointBinary(-1729.7124766737861);
        });
    })
});

