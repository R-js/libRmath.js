import { resolve } from 'path';

//helper
import { loadData } from '@common/load';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

//app
import { pbinom } from '..';

describe('pbinom', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    it('ranges x ∊ [0, 12] size=12, prob=0.01', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pbinom1.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => pbinom(_x, 12, 0.02));
        expect(actual).toEqualFloatingPointBinary(y, 34);
    });
    it('x = NaN, size=NaN, prob=0.01', () => {
        const actual = pbinom(NaN, NaN, 0.01);
        expect(actual).toBeNaN();
    });
    it('x = 5, size=Infinity, prob=0.01', () => {
        const actual = pbinom(5, Infinity, 0.01);
        expect(actual).toBeNaN();
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'pbinom',
                formatter: "argument out of domain in '%s'",
                args: ['pbinom']
            }
        ]);
    });
    it('x=0, size=12, prob=0, asLog=true|false', () => {
        const actual = pbinom(-5, 10, 0.01);
        expect(actual).toBe(0);
    });

    it('x = 5, size=Infinity, prob=0.01', () => {
        const actual = pbinom(5, 7.2, 0.01);
        expect(actual).toBeNaN();
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'pbinom',
                formatter: 'non-integer n = %d',
                args: [7.2]
            },
            {
                prefix: '',
                namespace: 'pbinom',
                formatter: "argument out of domain in '%s'",
                args: ['pbinom']
            }
        ]);
    });
    it('x = 5, size=Infinity, prob=0.01', () => {
        const actual = pbinom(5, -7, 0.01);
        expect(actual).toBeNaN();
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'pbinom',
                formatter: "argument out of domain in '%s'",
                args: ['pbinom']
            }
        ]);
    });
});
