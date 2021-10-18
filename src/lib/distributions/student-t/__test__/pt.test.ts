import { loadData } from '@common/load';
import { resolve } from 'path';


import { cl, select } from '@common/debug-select';

import { pt } from '../index';

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
    describe('ncp = 0',()=>{
        //
    })
});

