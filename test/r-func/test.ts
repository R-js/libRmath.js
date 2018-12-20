import { should } from 'mocha';
import { expect } from 'chai';
import { createComment } from '../test-helpers';
import {
    Rcycle,//done
    c,//done
    compose,
    pipe,
    each,
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
        it(`test: pipe\t→pipe(v=>[v,v+1], (a,b)=>a*b)`,()=>{
             const fn = pipe(v=>([v,v+1]), (a,b)=>a*b);
             const [ ans1 ] = fn(42) // 42*43 = 1806
             expect(ans1).to.equal(1806);
        });
        it(`test: pipe\t→pipe() zero number of functions should give an error`,()=>{
            expect(() => pipe()).to.throw('specify functions!');
        });
        it(`test: pipe\t→pipe({},()=>1) specify "non function type" should give an error`,()=>{
            expect(() => pipe({} as any, ()=>1)).to.throw('argument 1 is not a function');
        });
    })
    describe('compose functional hoc', () => {
        it(`test: compose\t→compose(v=>[v,v+1], (a,b)=>a*b)`,()=>{
             const fn = compose(v=>([v,v+1]), (a,b)=>a*b);
             const ans1  = fn(3,5) // 15 -> [15,16]
             expect(ans1).to.deep.equal([15,16]);
        });
        /*it(`test: pipe\t→pipe() zero number of functions should give an error`,()=>{
            expect(() => chain()).to.throw('specify functions!');
        });
        it(`test: pipe\t→pipe({},()=>1) specify "non function type" should give an error`,()=>{
            expect(() => pipe({} as any, ()=>1)).to.throw('argument 1 is not a function');
        });*/
    })
})


