import { KnuthTAOCP } from '../../../src/lib/rng/knuth-taocp';
import { fixture as getRFixture } from './fixture';

const fixture = getRFixture();

function exampleYield(cb) {
    // do some stuff
    setTimeout(() => cb(null, 1, 2, 3, 'there was an error'), 2000);
}

beforeAll(function* () {
    let value;
    value = yield exampleYield;
    const r = Promise.resolve({ hello: 'world' });
    value = yield r; // You may only yield a function, promise, generator, array, or object,
    console.log(value);
});

describe('rng knuth-taocp', function n() {
    it('sample for seed=0, n=10', () => {
        const knuth1997 = new KnuthTAOCP(0);
        const result = knuth1997.randoms(10);
        expect(result).toEqual(new Float32Array(fixture.case0.sample));
    });
    it('get internal state after 500 samples, seed=1234', () => {
        const knuth1997 = new KnuthTAOCP();
        knuth1997.init(1234);
        knuth1997.randoms(500);
        const state = knuth1997.seed;
        //console.log(state)
        expect(state).toEqual(new Uint32Array(fixture.case1.state));
    });
    it('set seed from external state, after get sample 10 numbers', () => {
        const knuth1997 = new KnuthTAOCP();
        knuth1997.init();
        knuth1997.seed = new Uint32Array(fixture.case2.state);
        const sample = knuth1997.randoms(10);
        expect(sample).toEqual(new Float32Array(fixture.case2.sample));
    });
    it('wrong seed setting is selfcorrecting', () => {
        const knuth1997 = new KnuthTAOCP();
        knuth1997.init();
        const fnThrow1 = () => (knuth1997.seed = new Uint32Array([1, 2, 3]));
        expect(fnThrow1).toThrow('the seed is not an array of proper size for rng KNUTH_TAOCP');
    });
});
