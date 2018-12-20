import { KnuthTAOCP } from '../../../src/lib/rng/knuth-taocp';
import { checkPrec6, createComment } from '../../test-helpers';
import { each, sequenceFactory } from '../../../src/lib/r-func';
import { bessel_i } from '../../../src/lib/bessel/besselI'
import fixture from './fixture';

//besselI

let xI = c(0.3679, 1, 22030, 0.04979, 54.6, 403.4,
    0.04979, 2981, 8103, 0.1353, 0.3679, 2.718);

let nuI = c(3.669, 11.02, 1.221, 63.43, 73.7,
    63.43, -0.4066, -0.1353, -0.4066, -73.7, -54.6, -73.7);


const bI = precision9(besselI(xI, nuI, true));

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


