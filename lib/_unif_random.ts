//park node crypto in diff namespace

import * as nodeCrypto from 'crypto';

const isBrowser = process && process.versions && typeof process.versions.node === 'string';

/**
 * The crypto.randomBytes() method will block until there is sufficient entropy.
 * This should normally never take longer than a few milliseconds.
 * The only time when generating the random bytes may 
 *      conceivably block for a longer period of time is right after boot, 
 *      when the whole system is still low on entropy.
 * 
 */


const MAX_INT_64 = Math.pow(2, 64);

function random_32bit_node(length: number): Uint32Array {
    let buf = nodeCrypto.randomBytes(Uint32Array.BYTES_PER_ELEMENT * length);
    let rng = new Uint32Array(buf.buffer.slice(0, buf.byteLength));
    return rng;
}

function random_32bit_browser(length: number): Uint32Array {
    let rng = new Uint32Array(length * Uint32Array.BYTES_PER_ELEMENT);
    window.crypto.getRandomValues(rng);
    return rng;
}

function random_32_bit(length: number): Uint32Array {
    return isBrowser ? random_32bit_browser(length) : random_32bit_node(length);
}

function random_64bit(length: number): number[] {
    let rng = random_32_bit(length * 2);
    let rc: number[] = [];
    for (let i = 0; i < rng.length; i += 2) {
        rc.push(Math.pow(rng[i + 1], 32) + rng[i]);
    }
    return rc;
}

export function random2_64StepsAsFloat(): number {
    let rng = random_64bit(1);
    let rc = rng[0] / MAX_INT_64;
    return rc;
}



function createAndValidateSeed(seed: number[], seedLength: number) {
    if (typeof seedLength !== 'number' || (seedLength <= 0)) {
        throw new Error(`seed Length does not have a valid nonzero length:${seedLength}`);
    }
    if (!(seed instanceof Array) || seed.length !== seedLength) {
        throw new Error(`Seed must be ${seedLength} x 32 bit integers`);
    }
    return Uint32Array.from(seed);
}


/**
 *  http://school.anhb.uwa.edu.au/personalpages/kwessen/shared/Marsaglia03.html 
 *   
 *  32 bit random numbers with period 2^(32 bit)*k
 *  (1) rng with k=1 (VAX)
 *  (2) rng with k=5 32 bit numbers , period about 2^160 = 2^5*32
 *  (3) rng with k=257 , perdiod about 2^257*(32 bit) = 2^8224
 *  (4) rng with k=4097, period about 2^about
 */


//(1)
let cong0 = random_32_bit(2);

function cong32bit(seed?: number[]): Uint32Array {
    if (seed) {
        cong0 = createAndValidateSeed(seed, 2);
    }
    cong0 = cong0.map((v: number) => {
        return v * 69069 + 362437;
    });
    //return a copy
    return new Uint32Array(cong0);
}

export function congSingle64bit(seed?: number[]): number {
    let c = cong32bit(seed);
    return Math.pow(c[1], 32) + c[0];
}

//(2)

let xorshift_seed = random_32_bit(10);

export function xorshift32bit(seed?: number[]): number[] {
    if (seed) {
        cong0 = createAndValidateSeed(seed, 10);
    }
    function nextStep(offset: number) {

        let a = [xorshift_seed[offset], xorshift_seed[offset + 4]];

        let t = (a[0] ^ (a[0] >> 7));
        let v = (a[1] ^ (a[1] << 6)) ^ (t ^ (t << 13));
        xorshift_seed.copyWithin(offset, offset + 1, 4);
        xorshift_seed[offset + 4] = v;
        //clamp it to 32bits
        return Uint32Array.from([(xorshift_seed[offset + 2] * 2 + 1) * v])[0];
    }
    let rc = [nextStep(0), nextStep(5)];
    return rc;
}

export function unif_rand(){
    return random2_64StepsAsFloat();
}
