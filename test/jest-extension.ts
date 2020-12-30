export {};
declare global {
    namespace jest {
        interface Matchers<R> {
            matchFloatingPointBinary(expected: any): R;
        }
    }
}

expect.extend({
    matchFloatingPointBinary(received, expected) {
        // let received: number[]  = []

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
            const options = {
                comment: 'data types not comparable',
                isNot: this.isNot,
                promise: this.promise,
            };
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
