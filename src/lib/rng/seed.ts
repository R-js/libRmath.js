
// have rollup replace this with globalThis.crypto

/* polyfill for randomBytes
    export function randomBytes(n) {
        return {
            readUInt32BE(offset = 0) {
                if (n - offset < 4) {
                    throw new RangeError('[ERR_BUFFER_OUT_OF_BOUNDS]: Attempt to write outside buffer bounds');
                }
                const sampler = new Uint8Array(n);
                globalThis.crypto.getRandomValues(sampler);
                const dv = new DataView(sampler.buffer);
                return dv.getUint32(offset, false);
            },
        };
    };
*/
import { randomBytes } from 'crypto';

export default function seed(): number {
    return randomBytes(4).readUInt32BE(0);
}
