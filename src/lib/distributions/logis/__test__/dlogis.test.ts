import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

import { loadData } from '@common/load';
import { resolve } from 'path';
import { dlogis } from '..';

//dlogis(x: number, location = 0, scale = 1, give_log = false)

describe('dlogis', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    describe('edge cases', () => {
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
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'dlogis',
                    formatter: "argument out of domain in '%s'",
                    args: ['dlogis']
                }
            ]);
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
