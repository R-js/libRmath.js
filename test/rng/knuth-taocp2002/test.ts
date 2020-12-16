import { KnuthTAOCP2002 } from '../../../src/lib/rng/knuth-taocp-2002';
import { fixtureSeed0, seedStateAfter500FetchedInit1234, seedStateAfter20FetchesInit654321 } from './fixture';

//import { forcePrecision } from '../../../src/lib/r-func';

//const _10 = forcePrecision(10)

function createFP32BitFieldComparor() {
    // determin endianess
    //let dv = new DataView(new Float32Array([Infinity]).buffer);
    //let bigEndian = dv.getUint8(0) === 0x7f && dv.getUint8(1) === 0x80 && dv.getUint8(2) === 0 && dv.getUint8(3);
    // prepare
    const v1 = new Float32Array(1);
    const v2 = new Float32Array(2);
    const dv1 = new DataView(v1.buffer);
    const dv2 = new DataView(v2.buffer);

    function exp(dv: DataView) {
        const exp = ((dv.getUint8(0) & 127) << 1) + ((dv.getUint8(1) & 128) >> 7);
        return exp;
    }

    function sign(dv: DataView) {
        return (dv.getInt8(0) & 128) >> 7;
    }

    function man(dv) {
        return (
            (dv.getUint8(1) & 127).toString(2).padStart(8, '0') +
            dv.getUint8(2).toString(2).padStart(8, '0') +
            dv.getUint8(3).toString(2).padStart(8, '0')
        );
    }

    return function check(a: number, b: number) {
        dv1.setFloat32(0, a, false);
        dv2.setFloat32(0, b, false);
        //sign
        if (sign(dv1) !== sign(dv2)) {
            return 0;
        }
        //exp
        if (exp(dv1) !== exp(dv2)) {
            return 0;
        }
        //
        const man1 = man(dv1);
        const man2 = man(dv2);
        let i;
        if (man1 === man2) {
            return 24;
        }
        for (i = 0; i < 24; i++) {
            if (man1[i] !== man2[i]) {
                break;
            }
        }
        return i;
    };
}

const check = createFP32BitFieldComparor();

describe('rng knuth-taocp-2002', function n() {
    check(1 / 33, 1 / 34);
    it('for seed=0, n=100', () => {
        const knuth2002 = new KnuthTAOCP2002();
        knuth2002.init(0);
        const result = knuth2002.randoms(100);

        for (let i = 0; i < result.length; i++) {
            const same = check(result[i], fixtureSeed0[i]);
            if (same === 0) {
                throw new Error(`Not same sign or exponent in fp32: ${result[i]} ${fixtureSeed0[i]}`);
            }
            if (same < 12) {
                throw new Error(`mantissa different from bit ${same} for fp32: ${result[i]} ${fixtureSeed0[i]}`);
            }
        }
    });
    xit('get internal state after 500 samples, seed=1234', () => {
        const knuth2002 = new KnuthTAOCP2002();
        knuth2002.init(1234);
        knuth2002.randoms(500);
        const result = knuth2002.seed;
        expect(result).toEqual(seedStateAfter500FetchedInit1234);
    });
    xit('for seed=654321 -> set seed from external state -> sample 10 numbers', () => {
        const knuth2002 = new KnuthTAOCP2002(654321);
        knuth2002.randoms(20);
        const result = knuth2002.seed;
        expect(result).toEqual(seedStateAfter20FetchesInit654321);
    });
    xit('init() resets the state to random values', () => {
        const knuth2002 = new KnuthTAOCP2002(1234);
        const seed1 = knuth2002.seed;
        knuth2002.init();
        const seed2 = knuth2002.seed;
        expect(seed1.length).toEqual(seed2.length);
        expect(seed2).toEqual(seed1);
    });
    xit('set the state, generates predictable seq of values afterwards', () => {
        const knuth2002 = new KnuthTAOCP2002(1234);
        const seed = knuth2002.seed;
        const var1 = knuth2002.random();
        knuth2002.randoms(100);
        knuth2002.seed = seed;
        const var2 = knuth2002.random();
        expect(var1).toEqual(var2);
    });
});
