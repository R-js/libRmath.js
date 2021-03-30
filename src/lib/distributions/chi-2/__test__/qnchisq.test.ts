import '$jest-extension';
//import { loadData } from '$test-helpers/load';
//import { resolve } from 'path';
import './helper';// for the side effects

//app

const cl = require('debug');

function select(ns:string){
    const logs = cl.get(ns);
    return function(filter: string) {
        return function(){
            if (!logs) return [];
            return logs.filter((s:string[])=> s[0]===filter);
        };
    };
}


const qnchisqLogs = select('_qnchisq');
const gnchisqDomainWarns = qnchisqLogs("argument out of domain in '%s'");
const R_Q_P01_boundaries = select("R_Q_P01_boundaries")("argument out of domain in '%s'");

import { qchisq } from '..';

describe('qnchisq', function () {
    beforeEach(() => {
        cl.clear('_qnchisq');
    })
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
    it.only('p=.2, df=4, ncp=-80(<0)', () => {
        const nan = qchisq(0.2, 4, -80);
        expect(nan).toBeNaN();
        expect(R_Q_P01_boundaries()).toHaveLength(1);
    });
    it('p=(0,1,1.2,-0.2), df=4, ncp=80', () => {
        const z = qchisq(1, 4, 80);
        expect(z).toBe(Infinity);
        const z1 = qchisq(0, 4, 80);
        expect(z1).toBe(0);
        const nan = qchisq(-.2, 4, 80);
        expect(nan).toBeNaN();
        const nan1 = qchisq(1.2, 4, 80);
        expect(nan1).toBeNaN();
        expect(R_Q_P01_boundaries()).toHaveLength(2);
    });

});