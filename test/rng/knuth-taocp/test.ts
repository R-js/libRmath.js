import { expect } from 'chai'
import { KnuthTAOCP } from '../../../src/lib/rng/knuth-taocp'
import { fixture as getRFixture } from './fixture'

const fixture = getRFixture()

describe('rng knuth-taocp', function n() {
   
    it('sample for seed=0, n=10', () => {
        
        const knuth1997 = new KnuthTAOCP(0);
        const result = knuth1997.unif_rand(10)
        expect(result).to.deep.equal(fixture.case0.sample)
    })
    it('get internal state after 500 samples, seed=1234', () => {
        const knuth1997 = new KnuthTAOCP();
        knuth1997.init(1234)
        knuth1997.unif_rand(500)
        const state = knuth1997.seed
        expect(state).to.deep.equal(fixture.case1.state)
    })
    it('set seed from external state, after get sample 10 numbers', () => {
        const knuth1997 = new KnuthTAOCP();
        knuth1997.init();
        knuth1997.seed = fixture.case2.state
        const sample = knuth1997.unif_rand(10);
        expect(sample).to.deep.equal(fixture.case2.sample);
    })
    it('wrong seed setting is selfcorrecting', () => {
        const knuth1997 = new KnuthTAOCP();
        knuth1997.init();
        const fnThrow1 = () => knuth1997.seed = [1, 2, 3]
        expect(fnThrow1).to.throw('the seed is not an array of proper size for rng KNUTH_TAOCP')
    })

})

