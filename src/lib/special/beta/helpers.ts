import type { NumArray } from '$constants';
import { isArray, matchFloatType, emptyFloat64Array } from '$constants';

export function validateBetaArgs(tag: string, a: NumArray, b?: NumArray) {
    // check "a" (must always be there)
    const fa = isArray(a);
    const fb = isArray(b);
    if (!fa) {
        throw new TypeError(`${tag}: argument "a" be an array of number[], Float32Array, Float64Array`);
    }
    if (b && !fb) {
        throw new TypeError(
            `${tag}: argument "b" (if defined) must be an array of number[], Float32Array, Float64Array`,
        );
    }
    let onlyA = false;
    if (!b) {
        onlyA = true;
    }
    if (a.length === 0 && (onlyA || (b as NumArray).length === 0)) {
        return { rc: emptyFloat64Array };
    }
    if (b && b.length != a.length) {
        throw new TypeError(
            `${tag}: arguments "a" and "b" must be of equal vector length (#a=${a.length}, b=#${b.length}) of number[], Float32Array, Float64Array`,
        );
    }
    if (onlyA) {
        if (a.length % 2 !== 0) {
            throw new Error(
                `${tag}: ("b"=onevent elements of a), error cannot interleave data from a because array length of a(${a.length}) is not multiple of 2`,
            );
        }
    }
    const rc = onlyA ? matchFloatType(onlyA ? a.length / 2 : a.length, a) : matchFloatType(a.length, a, b as NumArray);
    return { rc, onlyA };
}
