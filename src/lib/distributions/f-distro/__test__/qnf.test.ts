//helper
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';
import { qf } from '..';

const cl = require('debug');

function select(ns: string) {
    return function (filter: string) {
        return function () {
            const logs = cl.get(ns);// put it here and not in the function scope
            if (!logs) return [];
            return logs.filter((s: string[]) => s[0] === filter);
        };
    };
}

const qnfLogs = select('qnf');
const qnfDomainWarns = qnfLogs("argument out of domain in '%s'");

describe('qf ncp is defined', function () {
    beforeEach(() => {
        cl.clear('qnf');
    })
    it('p ∈ [-0.125, 1.125], df1=3, df2=5, ncp=25', async () => {
        const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'qnf.R'), /\s+/, 1, 2);
        const a1 = p.map(_p => qf(_p, 3, 5, 25));
        expect(a1).toEqualFloatingPointBinary(y1, 23);
    });
    it('p=0.2 df1=Nan, df2=231, ncp=25', () => {
        const nan = qf(0.2, NaN, 231, 25);
        expect(nan).toBeNaN();
    });
    it('p=0.2, df1=-2(<0), df2=4, ncp=25', () => {
        const nan = qf(0.2, -2, 4, 25);
        expect(nan).toBeNaN();
        expect(qnfDomainWarns()).toHaveLength(1);
    });
    it('p=0.2, df1=Inf, df2=Inf, ncp=25', () => {
        const nan = qf(0.2, Infinity, Infinity, 25);
        expect(nan).toBeNaN();
        expect(qnfDomainWarns()).toHaveLength(1);
    });
    it('p=0.2, df1=2.4e8, df2=2E8, ncp=2e9', () => {
        const z = qf(0.2, 2.4,2e8, 290);
        expect(z).toEqualFloatingPointBinary(109.75391976731237);
    });
});