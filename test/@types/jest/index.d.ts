declare global {
    namespace jest {
        interface Matchers<R> {
            matchFloatingPointBinary(expected: any): R;
        }
    }
}
