import { KnuthTAOCP } from '../../../src/lib/rng/knuth-taocp';
import { checkPrec6, createComment } from '../../test-helpers';
import { each } from '../../../src/lib/r-func';
import fixture from './fixture';


describe(`KnuthTAOCP`, () => {
    describe('Output for different seeds', () => {
       
        const cases = fixture.seedsTests;
        each(cases)((test, testName) => {
            if ('skip' in test) { return }
            const { input, expected: _expected } = test;
            const comment = createComment(input);
            const knuth = new KnuthTAOCP(input.seed);
            it(`test:${testName}\t→${comment}`,
               function (this: any, testSeed , expected) {
                   const result = knuth.unif_rand(100);
                   for (let i = 0; i < result.length; i++){
                       checkPrec6(expected[i],result[i]);
                   }
                }.bind(null, input.seed, _expected.first100) // mocha "it" is called in next eventloop
            )
        });
    })
})


