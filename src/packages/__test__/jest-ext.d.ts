export {};
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R> {
            toEqualFloatingPointBinary(expected: unknown, mantissa?: number, cycle?: boolean, hf?: boolean): R;
        }
    }
}
