import { should } from 'mocha';
import { expect } from 'chai';
import { createComment } from '../test-helpers';
import {   
    Rcycle,
    c,
    chain,
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
               function (this: any, fn, args , expected) {
                   const rfn = Rcycle(fn) 
                   const result = rfn(...args);
                   expect(result).to.deep.equal(expected);
                }.bind(null, input.fn, input.args, test.expected) // mocha "it" is called in next eventloop
            )
        });
    })
})


