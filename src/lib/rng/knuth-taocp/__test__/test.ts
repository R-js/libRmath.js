import { KnuthTAOCP } from '../..';
import { fixture as getRFixture } from './fixture';

const fixture = getRFixture();

describe('rng knuth-taocp', function n() {
    it('sample for seed=0, n=10', () => {
        const knuth1997 = new KnuthTAOCP(0);
        const result = knuth1997.randoms(10);
        expect(result).toEqualFloatingPointBinary(new Float32Array(fixture.case0.sample), undefined, false);
    });
    it('get internal state after 500 samples, seed=1234', () => {
        const knuth1997 = new KnuthTAOCP();
        knuth1997.init(1234);
        knuth1997.randoms(500);
        const state = knuth1997.seed;
        expect(state).toEqual(new Uint32Array(fixture.case1.state));
    });
    it('set seed from external state, after get sample 10 numbers', () => {
        const knuth1997 = new KnuthTAOCP();
        knuth1997.init();
        knuth1997.seed = new Uint32Array(fixture.case2.state);
        const sample = knuth1997.randoms(10);
        expect(sample).toEqualFloatingPointBinary(new Float32Array(fixture.case2.sample), undefined, false);
    });
    it('basic sanity checks', () => {
        const knuth1997 = new KnuthTAOCP();
        knuth1997.init();
        const fnThrow1 = () => (knuth1997.seed = new Uint32Array([1, 2, 3]));
        expect(fnThrow1).toThrow('the seed is not an array of proper size for rng KNUTH_TAOCP');
        expect(knuth1997.name).toEqual('Knuth-TAOCP');
        expect(knuth1997.kind).toEqual('KNUTH_TAOCP');
        knuth1997.init(0);
        expect(knuth1997.randoms(0)).toEqualFloatingPointBinary(0.6274007670581344);
        const data = ['hello', 'world'];
        expect(() => (knuth1997.seed = data as never)).toThrow(
            'the seed is not of type Array for rng:KNUTH_TAOCP'
        );
        expect(() => (knuth1997.seed = new Uint32Array(0))).toThrow(
            'the seed is not an array of proper size for rng KNUTH_TAOCP',
        );
    });
});
