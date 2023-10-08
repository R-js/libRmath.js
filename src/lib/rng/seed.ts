export default function seed(): number {
    const sampler = new Uint8Array(4);
    globalThis.crypto.getRandomValues(sampler);
    const dv = new DataView(sampler.buffer);
    return dv.getUint32(0, false);
}
