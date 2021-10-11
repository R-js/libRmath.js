import { loadData } from '@common/load';
import { resolve } from 'path';

import { cl, select } from '@common/debug-select';

import { dt } from '../index';

const dntLogs = select('dnt');
const dntDomainWarns = dntLogs("argument out of domain in '%s'");

describe('dt (n,df,ncp, giveLog)', function () {

    describe('invalid input and edge cases', () => {
        describe('ncp = undefined', () => {
            beforeEach(() => {
                cl.clear('dnt');
            });
            it('x=Nan|df=NaN', () => {
                const nan1 = dt(NaN, 4);
                const nan2 = dt(5, NaN);
                expect(nan1).toBeNaN();
                expect(nan2).toBeNaN();
            });
            it('df <= 0', () => {
                const nan1 = dt(4, -3);
                expect(nan1).toBeNaN();
                expect(dntDomainWarns()).toHaveLength(1);
            });
            it('x = Infinite', () => {
                const zero1 = dt(Infinity, 3);
                expect(zero1).toBe(0);
                const zero2 = dt(-Infinity, 3);
                expect(zero2).toBe(0);
            });
           
        });
        describe('ncp defined', () => {
            it('ncp=Nan', () => {
                const nan1 = dt(3, 4, NaN);
                expect(nan1).toBeNaN();
            });
            it.todo('isNaN(ncp) check apply to upstream dnt.c');
        });
    });
    describe('fidelity', () => {
        describe('ncp = undefined', () => {
            it('x=seq(-2,2), df=5', async () => {
                const [x, y, yAsLog] = await loadData(resolve(__dirname, 'fixture-generation', 'dt1.R'), /\s+/, 1, 2, 3);
                const res = x.map(_x => dt(_x, 5));
                expect(res).toEqualFloatingPointBinary(y, 46);
                const resAsLog = x.map(_x => dt(_x, 5, undefined, true));
                expect(resAsLog).toEqualFloatingPointBinary(yAsLog, 51);
                
            });
            it('df = Infinite x=(-4,4)', async () => {
                const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dt4.R'), /\s+/, 1, 2);
                const actual = x.map(_x => dt(_x, Infinity));
                expect(actual).toEqualFloatingPointBinary(y, 49);
  
            });
            it('(x*x)/df > (1 / DBL_EPSILON);', () => {
                // x*x > df/DBL_EPSILON
                // |x| > sqrt(df/DBL_EPSILON)
                // choose df=40
                expect(dt(424433733, 40)).toEqualFloatingPointBinary(5e-322);
            });
        });
        describe('ncp defined', () => {
            it('ncp=42.2 , x=seq(0,90), df=5', async () => {
                const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dt2.R'), /\s+/, 1, 2);
                const res = x.map(_x => dt(_x, 5, 42.2));
                expect(res).toEqualFloatingPointBinary(y, 42);
            });
            //(abs(x) > sqrt(df * DBL_EPSILON))
            it('x close to zero, ncp=100 and df=1000 (abs(x) <= sqrt(df * DBL_EPSILON)', () => {
                const actual = [
                    -2.2204460492503131e-13,
                    -1.9984014443252818e-13,
                    -1.7763568394002505e-13,
                    -1.5543122344752192e-13,
                    -1.3322676295501878e-13,
                    -1.1102230246251565e-13,
                    -8.8817841970012523e-14,
                    -6.6613381477509392e-14,
                    -4.4408920985006262e-14,
                    -2.2204460492503131e-14,
                    0.0000000000000000e+00,
                    2.2204460492503131e-14,
                    4.4408920985006262e-14,
                    6.6613381477509392e-14,
                    8.8817841970012523e-14,
                    1.1102230246251565e-13,
                    1.3322676295501878e-13,
                    1.5543122344752192e-13,
                    1.7763568394002505e-13,
                    1.9984014443252818e-13,
                    2.2204460492503131e-13,
                ].map(_x => dt(_x, 1000, 4))
                expect(actual).toEqualFloatingPointBinary(0.00013379677239581429);
                expect(dt(-1.5543122344752192e-13, 1000, 4, true)).toEqualFloatingPointBinary(-8.9191885331633856);
            });
            it('df >= 1e8 (1e9) it will become dnorm with mu=ncp variance=1', async () => {
                const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dt3.R'), /\s+/, 1, 2);
                const actual = x.map(_x => dt(_x, 1e9, 4));
                expect(actual).toEqualFloatingPointBinary(y, 49);
            });
        });
    });
});

