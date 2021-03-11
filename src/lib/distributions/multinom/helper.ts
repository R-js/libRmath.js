
export function checks(prob: Float32Array, size: number, n: number, printer: (...args: any[]) => void) {
    if (prob.length === 0) {
        printer('no positive probabilites');
        return 0;
    }
    if (size < 0) {
        printer('invalid size, is negative');
        return 0;
    }
    //check probabilities
    let sum = 0;
    for (let i = 0; i < prob.length; i++) {
        if (!isFinite(prob[i])) {
            printer('probability contains non finite number');
            return 0;
        }
        if (prob[i] < 0) {
            printer('probability contains negative number');
            return 0;
        }
        sum += prob[i];
    }
    if (!sum) {
        printer('no positive probabilities');
    }
    return sum;
}