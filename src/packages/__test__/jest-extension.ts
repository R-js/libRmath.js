
export { };

import type { MatcherHintOptions } from 'jest-matcher-utils';
import { isTypedArray } from 'util/types';

type NumberTypes = 'Float32Array' | 'Float64Array' | 'number' | 'number[]';

type ObjectTypes =
    | NumberTypes
    | 'null'
    | 'undefined'
    | 'arr_0'
    | 'any[]'
    | 'string'
    | 'symbol'
    | 'function'
    | 'bigint'
    | 'boolean'
    | 'object';

type EmptyArray = [];
type MoreThenOneNumberArray = [number, ...number[]];

type typedFPArrays = Float32Array | Float64Array;

/* type guards */

function isMoreThenOneNumberArray(o: unknown): o is MoreThenOneNumberArray {
    return isNonEmptyNumberArr(o) && o.length > 1;
}

function isNumber(o: unknown): o is number {
    return typeof o === 'number';
}

function isNull(o: unknown): o is null {
    return (o === null);
}

function isUndefined(o: unknown): o is undefined {
    return (o === undefined);
}

function isFloat32(o: unknown): o is Float32Array {
    return (o instanceof Float32Array);
}

function isFloat64(o: unknown): o is Float64Array {
    return (o instanceof Float64Array);
}

function isNonEmptyNumberArr(o: unknown): o is number[] {
    if (Array.isArray(o)) {
        if (o.length === 0) return false;
        let i = 0;
        for (; i < o.length; i++) {
            if (typeof o[i] !== 'number') {
                return false;
            }
        }
        if (i === o.length) {
            return true;
        }

    }
    return false;
}

function isEmptyArray(o: unknown): o is EmptyArray {
    return (
        (Array.isArray(o) && o.length === 0)
        ||
        (isTypedArray(o) && o.length === 0)
    );
}

function isNotNumberType<T>(o: T): o is Exclude<typeof o, EmptyArray | number[] | Float64Array | Float32Array | number> {
    return !isEmptyArray(o) && !isNonEmptyNumberArr(o) && !isFloat32(o) && !isFloat64(o) && !isUndefined(o) && !isNull(o) && !(typeof o === 'number');
}

function typeOf(o: unknown): ObjectTypes {
    if (o === null) return 'null';
    if (o === undefined) return 'undefined';
    if (o instanceof Float32Array) return 'Float32Array';
    if (o instanceof Float64Array) return 'Float64Array';
    if (Array.isArray(o)) {
        if (o.length === 0) return 'arr_0';
        let i = 0;
        for (; i < o.length; i++) {
            if (typeof o[i] !== 'number') {
                break;
            }
        }
        if (i === o.length) {
            return 'number[]';
        }
        return 'any[]';
    }
    return typeof o;
}

function isNAN(dv1: DataView, bpe: 4 | 8) {
    let rc = false; // not a NaN
    if ((dv1.getUint8(0) & 0x7f) === 0x7f) {
        if (bpe === 4) {
            const r = dv1.getUint8(1);
            if (r & 0x80) {
                const mantissa = (r & 0x7f) + dv1.getUint8(2) + dv1.getUint8(3);
                if (mantissa) {
                    rc = true;
                }
            }
        } else {
            const r = dv1.getUint8(1);
            if (r & 0xf0) {
                const mantissa =
                    (r & 0x0f) +
                    dv1.getUint8(2) +
                    dv1.getUint8(3) +
                    dv1.getUint8(4) +
                    dv1.getUint8(5) +
                    dv1.getUint8(6) +
                    dv1.getUint8(7);
                if (mantissa) {
                    rc = true;
                }
            }
        }
    }
    return rc;
}

function isZeroOrNegativeZero(dv1: DataView, bpe: number) {
    if ((dv1.getUint8(0) & 0x7f) === 0) {
        for (let i = 1; i < bpe; i++) {
            if (dv1.getUint8(i) !== 0) {
                return false;
            }
        }
        return true;
    }
    return false;
}

// returns number of equal bits in the exponent (-1 if all are equal)
function equalbits(dv1: DataView, dv2: DataView, bpe: 4 | 8): number {
    // check if NaN/-NaN
    if (isNAN(dv1, bpe) && isNAN(dv2, bpe)) {
        return bpe * 8 - (bpe === 4 ? 9 : 12);
    }
    // account for -0 bit pattern
    if (isZeroOrNegativeZero(dv1, bpe) && isZeroOrNegativeZero(dv2, bpe)) {
        return bpe * 8 - (bpe === 4 ? 9 : 12);
    }
    for (let i = 0; i < bpe; i++) {
        const b1 = dv1.getUint8(i);
        const b2 = dv2.getUint8(i);
        if (b1 === b2) {
            continue;
        }
        const fl = b1 ^ b2;
        for (let j = 7; j >= 0; j--) {
            if ((fl & (1 << j)) !== 0) {
                return Math.max(0, 7 - j + 8 * i - (bpe === 4 ? 9 : 12));
            }
        }
        return Math.max(0, 8 + 8 * (i + 1) - (bpe === 4 ? 9 : 12));
    }
    return bpe * 8 - (bpe === 4 ? 9 : 12);
}

/**
 *
 * @param a {number} - received
 * @param b {number} - expected
 */
type NumArray = Float32Array | Float64Array | number[];

interface DataView2 extends DataView {
    setFloat(offset: number, data: number): void;
}

function decorateDataView(dv: DataView, bpe: 4 | 8): DataView2 {
    (dv as DataView2).setFloat = function (this: DataView2, offset: number, data: number) {
        if (bpe === 4) {
            this.setFloat32(offset, data);
            return;
        }
        this.setFloat64(offset, data);
    };
    return dv as DataView2;
}

function createFloatArray(bpe: number) {
    if (bpe === 4) {
        return new Float32Array(1);
    }
    return new Float64Array(1);
}

function compareFP(a: NumArray, b: NumArray, bpe: 4 | 8, mantissa: number) {
    const afp = createFloatArray(bpe);
    const bfp = createFloatArray(bpe);
    const adv = decorateDataView(new DataView(afp.buffer), bpe);
    const bdv = decorateDataView(new DataView(bfp.buffer), bpe);
    const maxL = Math.max(a.length, b.length);
    let minMantissa = 0;
    for (let i = 0; i < maxL; i++) {
        const aIdx = i % a.length;
        const bIdx = i % b.length;
        adv.setFloat(0, a[aIdx]);
        bdv.setFloat(0, b[bIdx]);
        const rc = equalbits(adv, bdv, bpe);
        if (rc < mantissa) {
            throw [rc, aIdx, bIdx, a[aIdx], b[bIdx]];
        }
        minMantissa = Math.min(rc, minMantissa || rc);
    }
    return minMantissa;
}

// 1.8 x 10**308 max of float64
// 1.7 x 10**38  max of float32

function toScalar(o: NumArray, alt: string) {
    if (o.length === 1) {
        return o[0];
    }
    return alt;
}

expect.extend({
    toEqualFloatingPointBinary(
        // we do this because these parames have inferred types (it is a custom matcher) but we cannot override with (example mantissa: number = Infinity)
        // because eslint will complain with 
        //   -> "error  Type number trivially inferred from a number literal, remove type annotation  @typescript-eslint/no-inferrable-types"
        //
        // this is ugly though, lets change it
        //...[received, expected, mantissa = Infinity, cycle = true, hf = true]: [received: unknown, expected: unknown, mantissa: number, cycle: boolean, hf: boolean]) {
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        received: unknown, expected: unknown, mantissa: number = Infinity, cycle: boolean = true, hf: boolean = true) {
        const options: MatcherHintOptions = {
            isNot: this.isNot as boolean,
            promise: this.promise as string,
            comment: '',
        };
        const typeR = typeOf(received);
        const typeE = typeOf(expected);
        //
        let errMsg = '';
        if (isNotNumberType(received)) {
            errMsg += `Received data type (${typeR}) is not of type: (number[], number, Float32Array, Float64Array) \n`;
        }
        //
        if (isNotNumberType(expected)) {
            errMsg += `Expected data type (${typeE}) is not of type: (number[], number, Float32Array, Float64Array) \n`;
        }
        // check1
        if (errMsg) {
            options.comment = 'unusable data type(s)';
            return {
                message: () =>
                    this.utils.matcherHint('toEqualFloatingPointBinary', typeR, typeE, options) + '\n\n' + errMsg,
                pass: this.isNot ? true : false,
            };
        }
        // check 2
        // number with array but array is empty
        if (isNumber(received) && isEmptyArray(expected)) {
            options.comment = 'expected is empty data array';
            errMsg = 'Expected is am empty array';
            return {
                message: () =>
                    this.utils.matcherHint('toEqualFloatingPointBinary', typeR, typeE, options) + '\n\n' + errMsg,
                pass: this.isNot ? true : false,
            };
        }
        // check 3
        // number with array, array is more then 1 element and cycle is turned off
        if (isNumber(received) && isMoreThenOneNumberArray(received) && cycle === false) {
            options.comment = 'comparing scalar with array needs cycle = true option';
            errMsg = 'Comparing received (scalar) with an array of length > 1';
            return {
                message: () =>
                    this.utils.matcherHint('toEqualFloatingPointBinary', typeR, typeE, options) + '\n\n' + errMsg,
                pass: this.isNot ? true : false,
            };
        }
        // check 4 , mirror of check 2
        // number with array but array is empty
        if (isEmptyArray(received) && isNumber(expected)) {
            options.comment = 'received is empty data array';
            errMsg = 'Received is am empty array';
            return {
                message: () =>
                    this.utils.matcherHint('toEqualFloatingPointBinary', typeR, typeE, options) + '\n\n' + errMsg,
                pass: this.isNot ? true : false,
            };
        }
        // check 5 , mirror of check 3
        // number with array, array is more then 1 element and cycle is turned off
        if (isMoreThenOneNumberArray(received) && isNumber(expected) && cycle === false) {
            options.comment = 'comparing scalar with array needs cycle = true option';
            errMsg = 'Comparing received (array length > 1) with a Received (scalar)';
            return {
                message: () =>
                    this.utils.matcherHint('toEqualFloatingPointBinary', typeR, typeE, options) + '\n\n' + errMsg,
                pass: this.isNot ? true : false,
            };
        }
        // check 6 , 2 empty arrays are always equal
        if (isEmptyArray(expected) && isEmptyArray(received)) {
            errMsg = 'Received and expected are equal (both empty arrays)';
            return {
                pass: true,
                message: () =>
                    this.utils.matcherHint('toEqualFloatingPointBinary', '[]', '[]', options) + '\n\n' + errMsg,
            };
        }
        // check 7: if one of the arrays is empty thats an error
        if (isEmptyArray(received) || isEmptyArray(expected)) {
            errMsg = isEmptyArray(received) ? 'Received is an empty array' : 'Expected is an empty array';
            return {
                pass: this.isNot ? true : false,
                message: () =>
                    this.utils.matcherHint(
                        'toEqualFloatingPointBinary',
                        isEmptyArray(received) ? '[]' : typeR,
                        isEmptyArray(expected) ? '[]' : typeE,
                        options,
                    ) +
                    '\n\n' +
                    errMsg,
            };
        }

        const bpeR = (received as typedFPArrays).BYTES_PER_ELEMENT || (hf ? 8 : 4);
        const bpeE = (expected as typedFPArrays).BYTES_PER_ELEMENT || (hf ? 8 : 4);
        const bpe: 4 | 8 = Math.min(bpeE, bpeR) as 4 | 8;

        const mantissa2 = Math.min(mantissa, (bpe === 4 || hf === false) ? 23 : 52);

        if (mantissa2 !== mantissa) {
            errMsg += `Mantissa forced to ${mantissa2} bits`;
        }
        // if received = number promote to number[]
        const rec = isNumber(received) ? [received] : received as number[];
        // if expected = number promote to number[]
        const exp = isNumber(expected) ? [expected] : expected as number[];
        try {
            const min = compareFP(rec, exp, bpe, mantissa2);
            errMsg += `Received: [${toScalar(rec, typeR)}] should not be equal to Expected: [${toScalar(
                exp,
                typeE,
            )}] within ${min} bits ${min > mantissa2 ? `(larger then specified ${mantissa2} bits)` : ''}`;
            return {
                pass: true,
                message: () =>
                    this.utils.matcherHint('toEqualFloatingPointBinary', typeR, typeE, options) + '\n\n' + errMsg,
            };
        } catch (err) {
            const [rc, aIdx, bIdx, recv, expv] = err as number[];
            if (rec.length > 1) {
                errMsg += `Received:[${recv} at index ${aIdx}]`;
            } else {
                errMsg += `Received: [${toScalar(rec, typeR)}]`;
            }
            errMsg += ' is NOT equal to ';
            if (exp.length > 1) {
                errMsg += `Expected: [${expv} at index ${bIdx}]`;
            } else {
                errMsg += `Expected: [${toScalar(exp, typeE)}]`;
            }
            errMsg += ` within ${mantissa2} bits (nr equal mantissa bits is ${rc})`;
            return {
                pass: false,
                message: () =>
                    this.utils.matcherHint('toEqualFloatingPointBinary', typeR, typeE, options) + '\n\n' + errMsg,
            };
        }
    },
});
