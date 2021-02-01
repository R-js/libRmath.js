'use strict'
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
        it(`pipe\t→pipe() zero number of functions should give an error`, () => {
            expect(() => pipe()).to.throw('specify functions!');
        });
        it(`pipe\t→pipe({},()=>1) specify "non function type" should give an error`, () => {
            expect(() => pipe({} as any, () => 1)).to.throw('argument 1 is not a function');
        });
    })
    describe('compose functional hoc', () => {
        it(`compose\t→compose(v=>[v,v+1], (a,b)=>a*b)`, () => {
            const fn = compose(v => ([v, v + 1]), (a, b) => a * b);
            const ans1 = fn(3, 5) // 15 -> [15,16]
            expect(ans1).to.deep.equal([15, 16]);
        });
    })
    describe('generator function "flatten"', () => {
        it(`simple flatten sequence`, () => {
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
        it(`flatten sequence with embeddable iterators (other flattens)`, () => {
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
        it(`flatten sequence with embeddable Maps`, () => {
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
        it(`flatten sequence with embeddable Set`, () => {
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
        })
    })
    describe('generator function "seq_len"', () => {
        it(`seq_len({length:5}) with default for "base" prop`, () => {
            const ans = Array.from({ length: 5 })
            const it = seq_len({ length: 5 });
            let i = 0;
            for (const num of it) {
                ans[i++] = num;
            }
            expect(ans).to.deep.equal([1, 2, 3, 4, 5])
        })
        it(`seq_len() all defaults`, () => {
            const ans: number[] = [];
            const it = seq_len();
            for (const num of it) {
                ans.push(num)
            }
            expect(ans).to.deep.equal([0])
        })
    })
    describe('sequenceFactory', () => {
        it(`sequenceFactory()(0, 2, 0.2) firstly all defaults`, () => {
            const ans: number[] = sequenceFactory()(0, 2, 0.2);
            const expected = [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2];
            for (let i = 0; i < ans.length; i++) {
                expect(ans[i]).to.be.closeTo(expected[i], Number.EPSILON)
            }
        })
        it(`sequenceFactory(4,-1)(0, 2, 0.2) firstly all defaults`, () => {
            const ans: number[] = sequenceFactory(4, -1)(2, 0, -0.2);
            const expected = [1, 0.8, 0.6, 0.4, 0.2, 0, -0.2, -0.4, -0.6, -0.8, -1]
            for (let i = 0; i < ans.length; i++) {
                expect(ans[i]).to.be.closeTo(expected[i], Number.EPSILON * 1.5)
            }
        })
        it(`sequenceFactory()(0, 2) with defaults`, () => {
            const ans: number[] = sequenceFactory()(0, 2);
            const expected = [0, 1, 2]
            for (let i = 0; i < ans.length; i++) {
                expect(ans[i]).to.be.closeTo(expected[i], Number.EPSILON)
            }
        })
    })
    describe('lazySeq', () => {
        it(`lazySeq(0, 1, step=0, 0, 0) should throw a TypeError`, function () {

            const throwF = () => {
                const it = lazySeq(0, 1, 0, 0, 0)
                it.next(); // should throw!
            }
            //throwF();
            expect(throwF).to.throw('argument \'step\' cannot be zero')
        })
        it(`lazySeq(start=0, end=-1, 1, 0, 0) start > end && stop > 0, should throw a TypeError`, function () {

            const throwF = () => {
                const it = lazySeq(0, -1, 1, 0, 0)
                it.next(); // should throw!
            }
            expect(throwF).to.throw('\'end\' < \'start\' so delta must be negative')
        })
        it(`lazySeq(start=0, end=1, -1, 0, 0) start < end && stop < 0, should throw a TypeError`, function () {

            const throwF = () => {
                const it = lazySeq(0, 1, -1, 0, 0)
                it.next(); // should throw!
            }
            expect(throwF).to.throw('\'end\' > \'start\' so delta must be positive')
        })
    })

    describe('helper misc', () => {
        it(`isNumber('random') should return false`, function () {
            const ans = isNumber('hi')
            expect(ans).to.equal(false)
        })
        it(`isNumber('random') should return false`, function () {
            const ans = isNumber(NaN)
            expect(ans).to.equal(true)
        })
        it('forcePrecision, defaults', () => {
            const _6 = forcePrecision()
            const ans = _6({ hello: 'world', mu: 1.123456E-13 })
            expect(ans).to.deep.equal({ hello: 'world', mu: 1.12346E-13 })
        })
        it('forcePrecision, 3', () => {
            const _3 = forcePrecision(3)
            const ans = _3({ hello: 'world', mu: 1.1291E-13 })
            expect(ans).to.deep.equal({ hello: 'world', mu: 1.13E-13 })
        })
        it('sum', () => {
            const ans = sum([1, 2, 3, 4, 5])
            expect(ans).to.equal(15)
        })
        it('randomGenHelper([1,2,3],testFn, par1="hello", par2="world")', () => {
            let stack = 0;
            const testFn = (par1, par2) => {
                const id = ++stack * 2;
                return `${id}-${par1}-${par2}`
            };
            const ans = randomGenHelper([1, 2, 3, 4, 5], testFn, 'hello', 'world')
            expect(ans).to.deep.equal([
                '2-hello-world',
                '4-hello-world',
                '6-hello-world',
                '8-hello-world',
                '10-hello-world'])
        })
        it('randomGenHelper(0,testFn)', () => {
            let stack = 0;
            const testFn = (par1, par2) => {
                const id = ++stack * 2;
                return `${id}-${par1}-${par2}`
            };
            const ans = randomGenHelper(0, testFn)
            expect(ans).to.deep.equal([])
        })
        it('randomGenHelper(4,testFn)', () => {
            let stack = 0;
            const testFn = () => {
                const id = ++stack * 2;
                return `${id}`
            };
            const ans = randomGenHelper(4, testFn)
            expect(ans).to.deep.equal([
                '2',
                '4',
                '6',
                '8']
            )
        })
        it('randomGenHelper(undefined,testFn) should throw an error', () => {
            let stack = 0;
            const testFn = () => {
                const id = ++stack * 2;
                return `${id}`
            };
            const trig: number = undefined as any;
            const shouldThrow = () => randomGenHelper(trig, testFn)
            expect(shouldThrow).to.throw(`n argument is not a number or a number array`)
        })
        it('map({hello:"world", num:2})(concat)', () => {
            const ans = map({ hello: "world", num: 2 })((key, value) => `${key}-${value}`);
            expect(ans).to.deep.equal(['world-hello', '2-num'])
        })
    })
    describe('range', () => {
        it(`lazy range(start=1, stop=4, step=2)`, function () {
            const collect: number[] = []
            for (const i of range(1, 4, 2)) {
                collect.push(i)
            }
            expect(collect).to.deep.equal([1, 3])
        })
        it(`lazy range(start=1, stop=4)`, function () {
            const collect: number[] = []
            for (const i of range(1, 4)) {
                collect.push(i)
            }
            expect(collect).to.deep.equal([1, 2, 3, 4])
        })
    })
    describe('lazyMap', () => {
        it(`lazyMap(fn,obj)=>arr`, function () {
            const collect: any[] = [];
            const s = new Set(['hello', 'world', 'first', 'last']);
            const it = lazyMap((v, k) => `${k}=${v}`)(s.keys());
            for (const i of it) {
                collect.push(i)
            }
            expect(collect).to.deep.equal(['0=hello', '1=world', '2=first', '3=last'])

        })

    })
})

