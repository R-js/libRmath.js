import { KnuthTAOCP } from '../';
import { fixture as getRFixture } from './fixture';

const fixture = getRFixture();

expect.extend({
    matchFloatingPointBinary(received: number| number[], expected: number| number[], mantissa: number) {
        
        let pass = 0;
        if (Array.isArray(received) && Array.isArray(expected) && expected.length == received.length){
            pass = 1;
        }
        else if (typeof received === 'number' && typeof expected === 'number'){
                pass = 2;
        }
        else if (received instanceof Float32Array && expected instanceof Float32Array && received.length === expected.length){
            pass = 3;
        }
        else if (received instanceof Float64Array && expected instanceof Float64Array && received.length === expected.length){
            pass = 4;
        }

        if (pass === 0){
            const options = {
                comment: 'data types not comparable',
                isNot: this.isNot,
                promise: this.promise,
            };
            const message  = () => this.utils.matcherHint('matchFloatingPointBinary', undefined, undefined, options) +
          '\n\n' +
          `Expected: [type] is not of equal type/length as received\n` +
          `Received: [type] is not of equal type/length as expected`;
          return {
                message,
                pass,
          };
        }
        if (pass === 1){
            return checkNumberArrays(received, expected);
        }
        else
        /* 
            Now we do the real checks.
            }
            const options = {
                comment: '< inequality check',
                isNot: this.isNot,
                promise: this.promise,
            };
            const message =
                () => this.utils.matcherHint('toBeLowerThen', undefined, undefined, options) +
                '\n\n' +
                `Expected: should be bigger then ${this.utils.printExpected(ceiling)}\n` +
                `Received: ${this.utils.printReceived(received)}`
                :
                () => `expected ${received} to be lower then ${ceiling}`;
            */
       
    },
});




describe('rng knuth-taocp', function n() {
    
    it.only('some test', () => {
        expect.hasAssertions();
        expect('hello world').toEqual(expect.stringContaining('o w'));
    });

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
    it('wrong seed setting is self correcting', () => {
        const knuth1997 = new KnuthTAOCP();
        knuth1997.init();
        const fnThrow1 = () => (knuth1997.seed = new Uint32Array([1, 2, 3]));
        expect(fnThrow1).toThrow('the seed is not an array of proper size for rng KNUTH_TAOCP');
    });
});
