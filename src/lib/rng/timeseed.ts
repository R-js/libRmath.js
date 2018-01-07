const { trunc, ceil, min, log2, pow } = Math;
const { now } = Date;

export function timeseed() {
  const n = now();
  //delay 0.5 sec
  do {
    now(); // consume cpu, do something silly
  } while (now() - n < 500);

  // how many bits?
  const nBits = min(32, ceil(log2(n)));
  const lowBits = trunc(nBits / 2);
  const hi = trunc(n / pow(2, lowBits));
  const lo = n - hi * pow(2, lowBits);
  //
  // create 32 bit array
  const buf = new ArrayBuffer(4);
  const reverser = new Uint8Array(buf);
  const uint32 = new Uint32Array(buf);
  uint32[0] = lo ^ hi; // little endian, highest order bytes has lowest indexes so
  // reverse order of bytes, milliseconds changes the fastest in a time
  reverser.reverse();
  return uint32[0];
}
