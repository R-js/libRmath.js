export {};

console.log('hello');

declare global {
    namespace jest {
        interface Matchers<R> {
            toEqualFloatingPointBinary(expected: any): R;
        }
    }
}

type TypeOfResult =
    | 'null'
    | 'undefined'
    | 'arr_32fp'
    | 'arr_64fp'
    | 'arr_0'
    | 'number'
    | 'arr_number'
    | 'arr_any'
    | 'string'
    | 'symbol'
    | 'function'
    | 'bigint'
    | 'boolean'
    | 'object';

function typeOf(o: any): TypeOfResult {
    if (o === null) return 'null';
    if (o === undefined) return 'undefined';
    if (o instanceof Float32Array) return 'arr_32fp';
    if (o instanceof Float64Array) return 'arr_64fp';
    if (Array.isArray(o)) {
        if (o.length === 0) return 'arr_0';
        let i = 0;
        for (; i < o.length; i++) {
            if (typeof o[i] !== 'number') {
                break;
            }
        }
        if (i === o.length) {
            return 'arr_number';
        }
        return 'arr_any';
    }
    return typeof o;
}

function strategy(a: any, b: any): TypeOfResult;

// v = (arr_32fp, arr_64fp, number, arr_any, arr_0, null, undefined, arr_number, other)

// D = arr_32fp x arr_32fp, need to check length
// F = arr_32fp x arr_64fp, unequal floating point bit sizes
// G = arr_32fp x number, expected data is not an array
// H = arr_32fp x arr_any, expected data cannot is not an array of type number
// I = arr_32fp x arr_0, expected is an array of length 0
// J = arr_32fp x null, expected is  not an array of type number or a Float32Array
// K = arr_32fp x undefined, expected is of wrong data type [undefined]
// L = arr_32fp x arr_number, upgrade expected to an arr_32fp, and check for length
// M = arr_32fp x other, upgrade expected

// N = arr_64fp x arr_32fp, unequal floating point bit sizes
// O = arr_64fp x arr_64fp, need to check length
// P = arr_64fp x number, expected data is not an array
// Q = arr_64fp x arr_any, expected data cannot is not an array of type number
// R = arr_64fp x arr_0, expected is an array of length 0
// S = arr_64fp x null, expected [type] is not an array of type number or a Float64Array
// T = arr_64fp x undefined, expected is of wrong data type [undefined]
// U = arr_64fp x arr_number, upgrade expected to arr_64fp, check for length

// V = number x arr_32fp, expected is an array not a scalar like received
// W = number x arr_64fp, expected is an array not a scalar like received
// X = number x number, compare using mantissa and type in options
// Y = number x arr_any, expected data cannot is not a scalar of type number
// Z = 
const decisionMatrix = [
   /*arr_32fp*/, 'DFGHI'
]

function strategy(a: any, b: any) {
    const ta = typeOf(a);
    const tb = typeOf(b);
    if (ta === 'arr_32fp' && tb === 'arr_32fp') {
        if (a.length === b.length) return 'arr_32fp';
        throw [`unequal length, received has length:${a.length}, expected has length:${b.length}`, ta, tb];
    }
    if (ta === 'arr_64fp' && tb === 'arr_64fp') {
        if (a.length === b.length) return 'arr_64fp';
        throw [`unequal length, received has length:${a.length}, expected has length:${b.length}`, ta, tb];
    }
    if (ta === 'number' && tb === 'number') {
        return 'number';
    }
    if (ta === 'arr_number' && tb === 'arr_number') {
        if (a.length === b.length) {
            return 'arr_number';
        }
        throw [`unequal length, received has length:${a.length}, expected has length:${b.length}`, ta, tb];
    }
    // incompatible
    if (!['number', 'string', 'arr_32fp', 'arr_64fp', 'arr_number'].includes(ta)) {
        throw ['receive is not of a type', ta, tb];
    }
    if (!['number', 'string', 'arr_32fp', 'arr_64fp', 'arr_number'].includes(tb)) {
        throw ['expected is not of a type', ta, tb];
    }
    if ('arr_32fp', , 'arr_number'].includes(ta)) {
        if (tb === 'arr_64fp') {
            throw ['received and expected datatype unequal floating point types', ta, tb];
        }
        if (tb === 'arr_64fp') {
            throw ['received and expected datatype unequal floating point types', ta, tb];
        }
    }
    if (['arr_32fp', 'arr_64fp', 'arr_number'].includes(ta)) {
    }
    throw [`unusable types for floating point check`, ta, tb];
}

function humanizeType(ty: TypeOfResult): string {
    let humanTxt: string = ty;
    if (ty === 'arr_number') {
        humanTxt = 'array of numbers';
    } else if (ty === 'arr_32fp') {
        humanTxt = 'Float32Array';
    } else if (ty === 'arr_64fp') {
        humanTxt = 'Float64Array';
    } else if (ty == 'number') {
        humanTxt = 'number';
    } else if (ty == 'arr_0') {
        humanTxt = 'array of length zero';
    } else if (ty == 'arr_any') {
        humanTxt = 'array of non number elements';
    }
    return humanTxt;
}

expect.extend({
    toEqualFloatingPointBinary(received, expected) {
        const options = {
            comment: 'data types not comparable',
            isNot: this.isNot,
            promise: this.promise,
        };
        try {
            const rc: TypeOfResult = strategy(received, expected);
        } catch (err) {
            const [errTxt, ta, tb] = err;
            const humanA = humanizeType(ta);
            const humanB = humanizeType(tb);
            const message = () =>
                this.utils.matcherHint('toEqualFloatingPointBinary', undefined, undefined, options) +
                '\n\n' +
                `Expected: type [${humanB}] is not usable equal type/length as received\n` +
                `Received: type [${humanA}] is not of equal type/length as expected`;
            return {
                message,
                pass: this.isNot ? true : false,
            };
        }
        let pass = 0;
        if (Array.isArray(received) && Array.isArray(expected) && expected.length == received.length) {
            pass = 1;
        } else if (typeof received === 'number' && typeof expected === 'number') {
            pass = 2;
        } else if (
            received instanceof Float32Array &&
            expected instanceof Float32Array &&
            received.length === expected.length
        ) {
            pass = 3;
        } else if (
            received instanceof Float64Array &&
            expected instanceof Float64Array &&
            received.length === expected.length
        ) {
            pass = 4;
        }

        if (pass === 0) {
            const message = () =>
                this.utils.matcherHint('matchFloatingPointBinary', undefined, undefined, options) +
                '\n\n' +
                `Expected: [type] is not of equal type/length as received\n` +
                `Received: [type] is not of equal type/length as expected`;
            return {
                message,
                pass: this.isNot ? true : false,
            };
        }
        return {
            pass: true,
            message: () => '',
        };
    },
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
});
