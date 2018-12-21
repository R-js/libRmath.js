import { should } from 'mocha';
import { expect } from 'chai';
import { createComment } from '../test-helpers';
import {
    Rcycle, //done
    c, //done
    compose, //done
    pipe, //done
    each, //done implicit
    flatten,
    forcePrecision,
    isNumber,
    lazyMap,
    lazySeq,
    map,
    multiplexer,
    randomGenHelper,
    range,
    seq_len,
    sequenceFactory,
    sum,
    typeOf
} from '../../src/lib/r-func';

import { fixture } from './fixture';


describe(`Tools&Die`, () => {

    describe('Rcycle', () => {

        const cases = fixture.Rcycle
        each(cases)((test, testName) => {
            if ('skip' in test) { return }
            const { input } = test
            const comment = createComment(input)
            it(`test:${testName}\t→${comment}`,
                function (this: any, fn, args, expected) {
                    args = Array.isArray(args) ? args : [args]
                    const rfn = Rcycle(fn)
                    const result = rfn.apply(rfn, args);
                    //console.log(result);
                    expect(result).to.deep.equal(expected);
                }.bind(null, input.fn, input.args, test.expected) // mocha "it" is called in next eventloop
            )
        });
        const errs = fixture.RcycleErr
        each(errs)((test, testName) => {
            if ('skip' in test) { return }
            const { input } = test
            const comment = createComment(input)
            it(`error-test:${testName}\t→${comment}`,
                function (this: any, fn, args, expected) {
                    const rfn = Rcycle(fn)
                    expect(() => rfn.apply(rfn, args)).to.throw(expected.msg);
                }.bind(null, input.fn, input.args, test.expected) // mocha "it" is called in next eventloop
            )
        });
    })
    describe('c Combine Values', () => {
        const cases = fixture.combine
        each(cases)((test, testName) => {
            if ('skip' in test) { return }
            const { input } = test
            const comment = createComment(input)
            it(`test:${testName}\t→${comment}`,
                function (this: any, args, expected) {
                    const actual = c(...args)
                    expect(actual).to.deep.equal(expected)
                }.bind(null, input.args, test.expected) // mocha "it" is called in next eventloop
            )
        });
    })
    describe('pipe functional hoc', () => {
        it(`test: pipe\t→pipe(v=>[v,v+1], (a,b)=>a*b)`, () => {
            const fn = pipe(v => ([v, v + 1]), (a, b) => a * b);
            const [ans1] = fn(42) // 42*43 = 1806
            expect(ans1).to.equal(1806);
        });
        it(`test: pipe\t→pipe() zero number of functions should give an error`, () => {
            expect(() => pipe()).to.throw('specify functions!');
        });
        it(`test: pipe\t→pipe({},()=>1) specify "non function type" should give an error`, () => {
            expect(() => pipe({} as any, () => 1)).to.throw('argument 1 is not a function');
        });
    })
    describe('compose functional hoc', () => {
        it(`test: compose\t→compose(v=>[v,v+1], (a,b)=>a*b)`, () => {
            const fn = compose(v => ([v, v + 1]), (a, b) => a * b);
            const ans1 = fn(3, 5) // 15 -> [15,16]
            expect(ans1).to.deep.equal([15, 16]);
        });
    })
    describe('test generator flatten', () => {
        it(`test: simple flatten sequence`, () => {
            const ans: number[] = [];
            const fn = flatten(1, 2, [1, 2, 3, 4]);
            let i = 0; //guard against infinite loop
            do {
                i++;
                const step = fn.next()
                if (step.done) break;
                ans.push(step.value)
            }
            while (i < 100)
            expect(i).to.be.lessThan(100);
            expect(ans).to.deep.equal([1, 2, 1, 2, 3, 4]);
        });
        it(`test: flatten sequence with embeddable iterators (other flattens)`, () => {
            const ans: number[] = [];
            const fn = flatten(1, 2, [1, 2, 3, 4]);
            const fn2 = flatten(1, 2, [1, 2, [78, 9], fn]);
            let i = 0; //guard against infinite loop
            do {
                i++;
                const step = fn2.next()
                if (step.done) break;
                ans.push(step.value)
            }
            while (i < 100)
            expect(i).to.be.lessThan(100);
            //console.log(ans);
            expect(ans).to.deep.equal([1, 2, 1, 2, 78, 9, 1, 2, 1, 2, 3, 4]);
        })
        it(`test: flatten sequence with embeddable Maps`, () => {
            const ans: number[] = []
            const map = new Map()
            map.set('k1', [1, 1])
            map.set('k2', [1, 2, 3, 4])
            const fn2 = flatten(1, 2, [1, map, [78, 9], map.keys(), 90]);
            let i = 0; //guard against infinite loop
            do {
                i++;
                const step = fn2.next()
                if (step.done) break;
                ans.push(step.value)
            }
            while (i < 100)
            expect(i).to.be.lessThan(100);
            //console.log(ans);
            expect(ans).to.deep.equal([1, 2, 1, 'k1', 1, 1, 'k2', 1, 2, 3, 4, 78, 9, 'k1', 'k2', 90]);
        });
        // we have to do this because nyc has a bug
        it(`test: flatten sequence with embeddable Set`, () => {
            const ans: number[] = []
            const set = new Set()
            set.add('k1');
            set.add('k2');
            const fn2 = flatten(set.keys());
            let i = 0; //guard against infinite loop
            do {
                i++;
                const step = fn2.next()
                if (step.done) break;
                ans.push(step.value)
            }
            while (i < 100)
            expect(i).to.be.lessThan(100);
            //console.log(ans);
            expect(ans).to.deep.equal(['k1', 'k2']);
        });
    })
})


