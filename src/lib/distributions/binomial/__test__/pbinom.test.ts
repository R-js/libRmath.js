import { resolve } from 'path';

//helper
import { loadData } from '@common/load';


//app
import { pbinom } from '..';
import createDebugLoggerBackend, { createStatsFromLogs, LogEntry } from '@common/debug-backend';
import { register } from '@common/debug-frontend';

const logs: LogEntry[] = [];

register(createDebugLoggerBackend(logs));

describe('pbinom', function () {
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
        const stats0 = createStatsFromLogs(logs);
        const actual = pbinom(5, Infinity, 0.01);
        const stats1 = createStatsFromLogs(logs);
        expect(actual).toBeNaN();
        expect(stats1.pbinom - stats0.pbinom).toBe(1);
    });
    it('x=0, size=12, prob=0, asLog=true|false', () => {
        const actual = pbinom(-5, 10, 0.01);
        expect(actual).toBe(0);
    });

    it('x = 5, size=Infinity, prob=0.01', () => {
        const stats0 = createStatsFromLogs(logs);
        const actual = pbinom(5, 7.2, 0.01);
        const stats1 = createStatsFromLogs(logs);
        expect(stats1.pbinom - stats0.pbinom).toBe(2);
        expect(actual).toBeNaN();
    });
    it('x = 5, size=Infinity, prob=0.01', () => {
        const stats0 = createStatsFromLogs(logs);
        const actual = pbinom(5, -7, 0.01);
        const stats1 = createStatsFromLogs(logs);
        expect(actual).toBeNaN();
        expect(stats1.pbinom - stats0.pbinom).toBe(1);
    });
});
