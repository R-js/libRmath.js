import { loadData } from '@common/load';
import { resolve } from 'path';

loadData
resolve

import { cl, select } from '@common/debug-select';

import { pt } from '../index';

const pntLogs = select('pnt');
const pntDomainWarns = pntLogs("argument out of domain in '%s'");

pntDomainWarns

describe('pt (n,df,ncp, giveLog)', function () {
    describe('invalid input and edge cases', () => {
        describe('ncp = undefined or not relevant', () => {
            beforeEach(() => {
                cl.clear('pnt');
            });
            it('x=Nan|df=NaN', () => {
               //
               pt(NaN, 0);
            });
            it('df <= 0', () => {
                //
            });
            it('x = Infinite', () => {
                //
            });
        });
        describe('ncp defined', () => {
            it('ncp=Nan', () => {
                //
            });
        });
    });
    describe('fidelity', () => {
        describe('ncp = undefined', () => {
            it('x=seq(-2,2), df=5', async () => {
                //
            });
            it('df = Infinite x=(-4,4)', async () => {
                //
            });
            it('(x*x)/df > (1 / DBL_EPSILON);', () => {
               //
            });
        });
        describe('ncp defined', () => {
            it('ncp=42.2 , x=seq(0,90), df=5', async () => {
               //
            });
            
            it('x close to zero, ncp=100 and df=1000 (abs(x) <= sqrt(df * DBL_EPSILON)', () => {
                //
            });
            it('df >= 1e8 (1e9) it will become dnorm with mu=ncp variance=1', async () => {
                //
            });
        });
    });
});

