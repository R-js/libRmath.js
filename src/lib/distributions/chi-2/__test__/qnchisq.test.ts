import { resolve } from 'path';

import { loadData } from '@common/load';
import { cl, select } from '@common/debug-mangos-select';

const qnchisqLogs = select('qnchisq');
const gnchisqDomainWarns = qnchisqLogs("argument out of domain in '%s'");
const R_Q_P01_boundaries = select('R_Q_P01_boundaries')("argument out of domain in '%s'");

import { qchisq } from '..';

describe('qnchisq', function () {
    beforeEach(() => {
        cl.clear('qnchisq');
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
        expect(gnchisqDomainWarns()).toHaveLength(1);
    });
    it('p=.2, df=-4(<0), ncp=80', () => {
        const nan = qchisq(0.2, -4, 80);
        expect(nan).toBeNaN();
        expect(gnchisqDomainWarns()).toHaveLength(1);
    });
    it('p=.2, df=4, ncp=-80(<0)', () => {
        const nan = qchisq(0.2, 4, -80);
        expect(nan).toBeNaN();
        expect(gnchisqDomainWarns()).toHaveLength(1);
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
        expect(R_Q_P01_boundaries()).toHaveLength(2);
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
