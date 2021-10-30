import { floor, ceil, log2, trunc } from '@lib/r-func';
import type { IRNG } from '.';
import { globalUni, IRNGSampleKindTypeEnum } from '.';
import { globalSampleKind } from './global-rng';

/* Our PRNGs have at most 32 bit of precision. All generators except
   Knuth-TAOCP, Knuth-TAOCP-2002, and possibly the user-supplied ones
   have 31 or 32 bits of precision; the others are assumed to
   have at least 25. */
const U = 2 ** 25 - 1;

function ru(unif_rand: IRNG): number {

    // effectively it makes  floor(2^25*R)
    // assuming coarsest precision of (1/2)^25 , multiplication R by U would create pure integers of PRNGs 
    // if precision is higher then 2^25 we get small usefull leftover fractional part up to (1/2)^(32-25) = (1/2)^7
    // no wait... we dont keep leftover fractional part it is removed with the floor(...) function
    // 
    return (
        floor(U * unif_rand.random()) // stretch to take all integers between 0 and 2**25
        +
        unif_rand.random()  // add fractional part up to (1/2)**25 (coarsest)
    ) / U;
    // so now we have a double with at least 50 bit precision???
}

function rbits(bits: number, unif_rand: IRNG)
{
    let v = 0n;

    for (let n = 0; n <= bits; n += 16)
    {
        // FIXME:  should this not be "*65535" ?, its ok, 65534 would be an error!!! (as some part of the range would not be reachable)
        //    but 65536 not matter so much
        const v1 = floor(unif_rand.random() * 65536); 
        v = 65536n * v + BigInt(v1); // 
        
    }
    // mask out the bits in the result that are not needed
    return (v & ((1n << BigInt(bits)) - 1n));
}

function R_unif_index_0(dn: number, unif_rand: IRNG): number {

    const cut = unif_rand.cut;
    // makes absolute sense
    const u = dn > cut ? ru(unif_rand) : unif_rand.random();
    return floor(dn * u); // scale it
}

//external to the module, 
// this is to get an value between 0 and dn?
export function R_unif_index(dn: number, unif_rand = globalUni(), sampleKind = globalSampleKind()): number {
    if (sampleKind === IRNGSampleKindTypeEnum.ROUNDING) {
        return R_unif_index_0(dn, unif_rand);
    }

    // rejection sampling from integers below the next larger power of two
    // Q: rejection sampling does not work for negative integers?
    // a log2 is used to determine bitlength, so negative is not used, why not make log2(abs(dn))
    if (dn <= 0) {
        return 0.0;
    }

    //Q: why not make log2(abs(dn)) so you can handle negative "dn"?
    const bits = trunc(ceil(log2(dn))); // how many bits is dn, note, this can be larger then 2**32 but not larger then 2**64

    let dv = dn; // make it true the first time
    while (dv >= dn) {
        dv = Number(rbits(bits, unif_rand));
    }

    // O: the return value can be decomposed in ( [B]ase = 2**16 )  (a0*B^0 + a1*B^1 + a2*B^2 + a3*B^3) & 
    // O: in this case each of the a_n (a0,a1, etc) is a number between (0 and 1) multiplied by 65536 (should be 65535)
    // O: the max value dv can reach is (2**64-1 & 2^bits)
    // example  bits = ceil(LN2(A)), so   A is between  2**bits and 2**(bits-1)
    // 2**
    // |-----
    return dv;
}