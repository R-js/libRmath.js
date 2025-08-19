import log1p from '../log1p';

//hypot

import createDebugLoggerBackend, { createStatsFromLogs, LogEntry } from '@common/debug-backend';
import { register } from '@common/debug-frontend';

const logs: LogEntry[] = [];

register(createDebugLoggerBackend(logs));

describe('log1p', function () {
    describe('invalid input and edge cases', () => {
        it('x < -1 should be a NaN', () => {
            const l = log1p(-1.5);
            const stats = createStatsFromLogs(logs);
            expect(l).toEqualFloatingPointBinary(NaN);
            expect(stats.log1p).toBe(1);

        });
        it('x = -1 should be a -Infinity', () => {
            const l = log1p(-1);
            expect(l).toEqualFloatingPointBinary(-Infinity);
        });
        it('x < -0.999999985 causes precision failure warning', () => {
            const stats0 = createStatsFromLogs(logs);
            const l = log1p(-0.999999999);
            const stats1 = createStatsFromLogs(logs);
            expect(l).toEqualFloatingPointBinary(-20.723265865228342);
            expect(stats1.log1p - stats0.log1p).toBe(1);
        });
    });
    describe('fidelity', () => {
        it('log1p(0)', () => {
            expect(log1p(0)).toEqualFloatingPointBinary(0);
        });
        it('log1p(1)', () => {
            expect(log1p(1)).toEqualFloatingPointBinary(0.6931471805599453);
        });
        it('log1p(10000)', () => {
            expect(log1p(10000)).toEqualFloatingPointBinary(9.210440366976517);
        });
        it('log1p(x < 0.375, x = 0.2)', () => {
            expect(log1p(0.2)).toEqualFloatingPointBinary(0.18232155679395462, 51);
        });
        it('fabs(x) < 0.5 EPSILON)', () => {
            expect(log1p(0.4 * Number.EPSILON)).toEqualFloatingPointBinary(8.881784197001253e-17);
        });
        it('fabs(x) < 0.5 EPSILON)', () => {
            expect(log1p(0.4 * Number.EPSILON)).toEqualFloatingPointBinary(8.881784197001253e-17);
        });
        it('0 < x < 1e-8)', () => {
            expect(log1p(0.5e-8)).toEqualFloatingPointBinary(4.9999999875e-9);
        });
    });
});
