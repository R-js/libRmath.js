import { resolve } from 'path';

import { loadData } from '@common/load';
import { qchisq } from '..';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('qnchisq', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    it('p=NaN, df=2, ncp=80', () => {
        const nan = qchisq(NaN, 2, 80);
        expect(nan).toBeNaN();
    });
    it('p=.2, df=NaN, ncp=80', () => {
        const nan = qchisq(0.2, NaN, 80);
        expect(nan).toBeNaN();
    });
    it('p=.2, df=2, ncp=NaN', () => {
        const nan = qchisq(0.2, 2, NaN);
        expect(nan).toBeNaN();
    });
    it('p=.2, df=Infinite, ncp=80', () => {
        const nan = qchisq(0.2, Infinity, 80);
        expect(nan).toBeNaN();
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'qnchisq',
                formatter: "argument out of domain in '%s'",
                args: ['qnchisq']
            }
        ]);
    });
    it('p=.2, df=-4(<0), ncp=80', () => {
        const nan = qchisq(0.2, -4, 80);
        expect(nan).toBeNaN();
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'qnchisq',
                formatter: "argument out of domain in '%s'",
                args: ['qnchisq']
            }
        ]);
    });
    it('p=.2, df=4, ncp=-80(<0)', () => {
        const nan = qchisq(0.2, 4, -80);
        expect(nan).toBeNaN();
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'qnchisq',
                formatter: "argument out of domain in '%s'",
                args: ['qnchisq']
            }
        ]);
    });
    it('bounderies, p=(0,1,1.2,-0.2), df=4, ncp=80', () => {
        const z = qchisq(1, 4, 80);
        expect(z).toBe(Infinity);
        const z1 = qchisq(0, 4, 80);
        expect(z1).toBe(0);
        const nan = qchisq(-0.2, 4, 80);
        expect(nan).toBeNaN();
        const nan1 = qchisq(1.2, 4, 80);
        expect(nan1).toBeNaN();
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'R_Q_P01_boundaries',
                formatter: "argument out of domain in '%s'",
                args: ['R_Q_P01_boundaries']
            },
            {
                prefix: '',
                namespace: 'R_Q_P01_boundaries',
                formatter: "argument out of domain in '%s'",
                args: ['R_Q_P01_boundaries']
            }
        ]);
    });
    it('p=.8, df=42, ncp=80', () => {
        const z = qchisq(0.8, 42, 85);
        expect(z).toEqualFloatingPointBinary(144.0164689065154);
    });
    it('p=1-EPS/2, df=4, ncp=75', () => {
        const z = qchisq(1 - Number.EPSILON / 2, 42, 75);
        expect(z).toBe(Infinity);
        const z1 = qchisq(1 - Number.EPSILON / 2, 42, 75, false);
        expect(z1).toBe(0);
    });
    it('p=0.3, df=4, ncp=99, lowerTail=false', () => {
        const z = qchisq(0.3, 4, 99, false);
        expect(z).toEqualFloatingPointBinary(112.79273936154311);
    });
    it('p [0,1], df=3, ncp=25, lower=false', async () => {
        const [p, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qnchisq.R'), /\s+/, 1, 2);
        const actual = p.map((_p) => qchisq(_p, 3, 25, false));
        expect(actual).toEqualFloatingPointBinary(y, 48);
    });
    it('p [0,1], df=3, ncp=85, lower=false', async () => {
        const [p, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qnchisq2.R'), /\s+/, 1, 2);
        const actual = p.map((_p) => qchisq(_p, 3, 85, false));
        expect(actual).toEqualFloatingPointBinary(y, 49);
    });
});
