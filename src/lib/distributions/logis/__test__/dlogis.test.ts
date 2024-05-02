import { loadData } from '@common/load';
import { resolve } from 'path';
import { cl, select } from '@common/debug-mangos-select';

import { dlogis } from '..';

const dLogisLogs = select('dlogis');
const dLogisDomainWarns = dLogisLogs("argument out of domain in '%s'");

describe('dlogis', function () {
    describe('edge cases', () => {
        beforeEach(() => {
            cl.clear('dlogis');
        });
        it('x = NaN or location = Nan, or scale = NaN or give_log = NaN', () => {
            const nan1 = dlogis(NaN);
            expect(nan1).toBeNaN();
            //
            const nan2 = dlogis(0, NaN);
            expect(nan2).toBeNaN();
            //
            const nan3 = dlogis(0, undefined, NaN);
            expect(nan3).toBeNaN();
        });
        it('scale <= 0', () => {
            const nan = dlogis(0, undefined, -0.5);
            expect(nan).toBeNaN();
            expect(dLogisDomainWarns()).toMatchInlineSnapshot(`
                [
                  [
                    "argument out of domain in '%s'",
                    "dlogis, line:10, col:34",
                  ],
                ]
            `);
        });
    });
    describe('fidelity', () => {
        //# y=dlogis(x,localtion=4,scale=99.125, Log=TRUE)
        it('x=[0,8], location=4, scale = 99.125, log=TRUE', async () => {
            const [x, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'dlog1.R'), /\s+/, 1, 2, 3);
            const acty = x.map((_x) => dlogis(_x, 4, 99.125, true));
            expect(acty).toEqualFloatingPointBinary(y1, 48);
        });
        it('x=[0,8], location=4, scale = 0.5, log=FALSE', async () => {
            const [x, , y2] = await loadData(resolve(__dirname, 'fixture-generation', 'dlog1.R'), /\s+/, 1, 2, 3);
            const acty = x.map((_x) => dlogis(_x, 4, 0.5, false));
            expect(acty).toEqualFloatingPointBinary(y2, 48);
        });
    });
});
